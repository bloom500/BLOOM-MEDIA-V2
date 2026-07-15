# Audit worker (VPS)

Punte între formularul de audit (Vercel) și FERAL (VPS). Vercel nu poate
atinge loopback-ul VPS-ului, deci worker-ul ascultă pe `127.0.0.1:8787`
iar Caddy îl expune cu TLS pe un subdomeniu.

## Deploy (o singură dată)

```bash
# 0. DNS: agent.bloommedia.ro → A record → IP-ul VPS-ului (din panoul DNS)

# 1. Copiază fișierele
ssh VPS 'mkdir -p /home/feral/audit-worker'
scp worker/audit-worker.mjs VPS:/home/feral/audit-worker/

# 2. Env (pe VPS)
cat > /home/feral/audit-worker/worker.env <<'EOF'
AUDIT_WORKER_SECRET=<generat: openssl rand -hex 32>
RESEND_API_KEY=<cheia Resend>
EOF
chmod 600 /home/feral/audit-worker/worker.env

# 3. systemd
sudo cp audit-worker.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now audit-worker
curl -s localhost:8787/health   # {"ok":true}

# 4. Caddy (adaugă în Caddyfile, apoi `sudo systemctl reload caddy`)
#   agent.bloommedia.ro {
#     reverse_proxy 127.0.0.1:8787
#   }

# 5. Vercel → proiectul bloom-media-v2 → Environment Variables:
#   AUDIT_WORKER_URL=https://agent.bloommedia.ro
#   AUDIT_WORKER_SECRET=<același secret>
```

## Test end-to-end

```bash
curl -X POST https://agent.bloommedia.ro/audit \
  -H "Content-Type: application/json" \
  -H "x-audit-secret: $SECRET" \
  -d '{"name":"Test","email":"t@t.ro","phone":"07","website":"https://bloommedia.ro"}'
# → 202, apoi în 1-2 min raportul vine pe mailul agenției
```

Raportul merge DOAR la agenție (human-in-the-loop) — nimic automat către lead.
