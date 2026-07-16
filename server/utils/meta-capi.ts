import { createHash } from 'node:crypto'

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function hashEmail(email: string): string {
  return sha256(email.toLowerCase().trim())
}

function hashPhone(phone: string): string {
  // Strip everything except digits, then hash
  const digits = phone.replace(/\D/g, '')
  return sha256(digits)
}

function hashName(name: string): string {
  return sha256(name.toLowerCase().trim())
}

interface CAPILeadData {
  name: string
  email: string
  phone: string
  sourceUrl?: string
  /** Același UUID trimis de browser la fbq('track','Lead') — dedup Pixel/CAPI. */
  eventId?: string
  /** Semnale de matching (Event Match Quality): IP, UA, cookie-urile _fbp/_fbc. */
  clientIp?: string | null
  userAgent?: string | null
  fbp?: string | null
  fbc?: string | null
}

export async function sendMetaLeadEvent(data: CAPILeadData): Promise<void> {
  const token = process.env.META_CAPI_ACCESS_TOKEN
  const pixelId = '1672336757255871'

  if (!token) {
    console.warn('[meta-capi] META_CAPI_ACCESS_TOKEN not set — skipping')
    return
  }

  const nameParts = data.name.trim().split(/\s+/)
  const fn = nameParts[0] ?? ''
  const ln = nameParts.slice(1).join(' ') || fn

  const user_data: Record<string, unknown> = {
    em: [hashEmail(data.email)],
    ph: [hashPhone(data.phone)],
    fn: [hashName(fn)],
    ln: [hashName(ln)],
  }
  // Nehash-uite, conform spec CAPI.
  if (data.clientIp)  user_data.client_ip_address = data.clientIp
  if (data.userAgent) user_data.client_user_agent = data.userAgent
  if (data.fbp)       user_data.fbp = data.fbp
  if (data.fbc)       user_data.fbc = data.fbc

  const payload = {
    // Token în body, nu în query string — nu ajunge în logurile intermediarilor.
    access_token: token,
    data: [
      {
        event_name: 'Lead',
        event_time: Math.floor(Date.now() / 1000),
        event_id: data.eventId ?? `lead_${Date.now()}`,
        event_source_url: data.sourceUrl ?? 'https://www.bloommedia.ro',
        action_source: 'website',
        user_data,
      },
    ],
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )
    if (!res.ok) {
      const body = await res.text()
      console.error('[meta-capi] Error:', res.status, body)
    }
  } catch (err) {
    console.error('[meta-capi] Fetch failed:', err)
  }
}
