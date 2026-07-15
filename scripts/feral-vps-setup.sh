#!/usr/bin/env bash
#
# FERAL gateway — setup hardened pe VPS (Ubuntu/Debian), pentru feature-ul
# „Audit by AI" de pe bloommedia.ro.
#
# Ce face:
#   1. Instalează dependențele de build (Rust, Bun, toolchain C).
#   2. Creează userul de sistem dedicat `feral` (neprivilegiat).
#   3. Clonează + compilează feral-cli (gateway) și feral-agent (sidecar).
#      NOTĂ: feral-cli folosește feral-core cu default-features=false,
#      deci NU compilează llama.cpp — build ușor, CPU-only, fără GPU.
#   4. Instalează ambele binare în /opt/feral (sidecar-ul TREBUIE să stea
#      lângă CLI — find_binary() caută `feral-agent` lângă executabil).
#   5. Scrie env-ul MiniMax + hardening și unitul systemd (user unit +
#      linger, calea documentată în docs/HEADLESS.md).
#
# Rulare (ca root sau cu sudo):  bash feral-vps-setup.sh
# După rulare: completează cheia MiniMax în /home/feral/.config/feral/feral.env
# apoi:        sudo -iu feral systemctl --user restart feral
#
set -euo pipefail

FERAL_REPO="https://github.com/bloom500/feral"
FERAL_USER="feral"
FERAL_HOME="/home/${FERAL_USER}"
INSTALL_DIR="/opt/feral"
SRC_DIR="${FERAL_HOME}/src/feral"

# ── 1. Dependențe ────────────────────────────────────────────────────────────
apt-get update
apt-get install -y --no-install-recommends \
  build-essential pkg-config libssl-dev libdbus-1-dev cmake git curl ca-certificates unzip
# libdbus-1-dev: cerut de crate-ul `keyring` (Secret Service) din feral-core —
# fără el build-ul pică la libdbus-sys. Pe server keychain-ul nu e folosit
# (BYOK vine din env), dar crate-ul se compilează oricum.

# ── 2. User dedicat, neprivilegiat ───────────────────────────────────────────
if ! id -u "${FERAL_USER}" &>/dev/null; then
  useradd --create-home --shell /bin/bash "${FERAL_USER}"
fi

# Rust + Bun se instalează PER-USER (nu ca root) — build-ul rulează ca `feral`.
sudo -iu "${FERAL_USER}" bash -euo pipefail <<'BUILD'
if ! command -v cargo &>/dev/null; then
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal
fi
source "$HOME/.cargo/env"

if ! command -v bun &>/dev/null && [ ! -x "$HOME/.bun/bin/bun" ]; then
  curl -fsSL https://bun.sh/install | bash
fi
export PATH="$HOME/.bun/bin:$PATH"

# ── 3. Clone + build ─────────────────────────────────────────────────────────
mkdir -p "$HOME/src"
if [ -d "$HOME/src/feral/.git" ]; then
  git -C "$HOME/src/feral" pull --ff-only
else
  git clone --depth 1 https://github.com/bloom500/feral "$HOME/src/feral"
fi

# Sidecar (feral-agent): binar standalone via bun --compile.
cd "$HOME/src/feral/FeralAgent"
bun install --frozen-lockfile
bun run build   # → dist/feral-agent

# Gateway CLI (feral-cli): --no-default-features e OBLIGATORIU pe server —
# default-ul crate-ului e ["inference"], care trage llama-cpp-sys-2 (build
# greu, cere clang/bindgen). Inferența vine de la MiniMax prin env, deci
# engine-ul local nu e necesar.
cd "$HOME/src/feral"
cargo build --release -p feral-cli --no-default-features

# Workspace-ul agentului — singurul loc unde are voie să scrie (vezi env).
mkdir -p "$HOME/workspace"
BUILD

# ── 4. Instalare în /opt/feral (sidecar LÂNGĂ CLI, cerință find_binary) ─────
mkdir -p "${INSTALL_DIR}"
install -m 0755 "${SRC_DIR}/target/release/feral-cli"        "${INSTALL_DIR}/feral"
install -m 0755 "${SRC_DIR}/FeralAgent/dist/feral-agent"     "${INSTALL_DIR}/feral-agent"
ln -sf "${INSTALL_DIR}/feral" /usr/local/bin/feral

# ── 5. Env (MiniMax BYOK + hardening) ────────────────────────────────────────
# FERAL_BASE_URL/API_KEY/MODEL au prioritate peste orice (feral_agent.rs) —
# pe un server headless fără keychain asta e calea oficială, nu FERAL_BYOK_PROVIDER.
ENV_DIR="${FERAL_HOME}/.config/feral"
ENV_FILE="${ENV_DIR}/feral.env"
mkdir -p "${ENV_DIR}"
if [ ! -f "${ENV_FILE}" ]; then
  cat > "${ENV_FILE}" <<'ENV'
# ── MiniMax (BYOK prin env override) ─────────────────────────────
FERAL_BASE_URL=https://api.minimax.io/v1
# COMPLETEAZĂ cheia din abonamentul MiniMax:
FERAL_API_KEY=CHANGE_ME
# Ajustează la modelul din abonament (ex. MiniMax-M3):
FERAL_MODEL=MiniMax-M3

# ── Hardening pentru pipeline-ul de lead-uri ─────────────────────
# Conținutul site-urilor analizate e input NESIGUR (prompt injection).
# Limităm agentul la un workspace dedicat, gol:
FERAL_WORKSPACE=/home/feral/workspace
# Deny-wall suplimentar peste cel implicit (~/.feral, ~/.ssh):
FERAL_FS_DENY=/home/feral/.config:/home/feral/src:/opt/feral:/etc
# Execuția de cod e OFF by default — o lăsăm explicit off:
FERAL_ENABLE_CODE_EXEC=0

# Opțional: cheie Jina pentru rate-limit mai mare pe read_webpage
# (merge și fără — r.jina.ai e gratuit cu limită):
# FERAL_JINA_API_KEY=

# Opțional: SearXNG self-hosted pentru web_search real (auditul de bază
# NU are nevoie — folosim read_webpage direct pe URL-ul lead-ului):
# FERAL_SEARXNG_URL=http://127.0.0.1:8888
ENV
  chmod 0600 "${ENV_FILE}"
fi
chown -R "${FERAL_USER}:${FERAL_USER}" "${ENV_DIR}" "${FERAL_HOME}/workspace" 2>/dev/null || true

# ── 6. Unit systemd (user unit + linger, ca în docs/HEADLESS.md) ────────────
UNIT_DIR="${FERAL_HOME}/.config/systemd/user"
mkdir -p "${UNIT_DIR}"
cat > "${UNIT_DIR}/feral.service" <<UNIT
[Unit]
Description=Feral Gateway (Bloom audit-by-AI)
After=network-online.target

[Service]
ExecStart=${INSTALL_DIR}/feral gateway
EnvironmentFile=${ENV_FILE}
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
UNIT
chown -R "${FERAL_USER}:${FERAL_USER}" "${FERAL_HOME}/.config/systemd"

loginctl enable-linger "${FERAL_USER}"
sudo -iu "${FERAL_USER}" bash -c 'systemctl --user daemon-reload && systemctl --user enable --now feral'

# ── 7. Smoke test ────────────────────────────────────────────────────────────
sleep 3
sudo -iu "${FERAL_USER}" bash -c '/opt/feral/feral doctor || true'
echo
echo "──────────────────────────────────────────────────────────────"
echo "Setup gata. Pași finali:"
echo "  1. Pune cheia MiniMax în ${ENV_FILE}"
echo "  2. sudo -iu ${FERAL_USER} systemctl --user restart feral"
echo "  3. Smoke test:"
echo '     sudo -iu feral bash -c '"'"'TOKEN=$(cat ~/.feral/api-token); \
       curl -s -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
       -X POST http://127.0.0.1:11435/runtime/chat \
       -d "{\"content\":\"Citește https://bloommedia.ro cu read_webpage și spune-mi titlul paginii.\",\"stream\":false,\"session_id\":\"smoke\"}"'"'"
echo "──────────────────────────────────────────────────────────────"
