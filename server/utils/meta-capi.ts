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
  eventId?: string
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

  const payload = {
    data: [
      {
        event_name: 'Lead',
        event_time: Math.floor(Date.now() / 1000),
        event_id: data.eventId ?? `lead_${Date.now()}`,
        event_source_url: data.sourceUrl ?? 'https://bloommedia.ro',
        action_source: 'website',
        user_data: {
          em: [hashEmail(data.email)],
          ph: [hashPhone(data.phone)],
          fn: [hashName(fn)],
          ln: [hashName(ln)],
        },
      },
    ],
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${token}`,
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
