export interface LeadRow {
  source: string
  name: string
  email: string
  phone: string
  website?: string | null
  social?: string | null
  message?: string | null
  selected_services?: string[] | null
  monthly_total?: number | null
}

export async function insertLead(row: LeadRow): Promise<void> {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.warn('[supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — skipping')
    return
  }

  try {
    const res = await fetch(`${url}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        key,
        'Authorization': `Bearer ${key}`,
        'Prefer':        'return=minimal',
      },
      body: JSON.stringify(row),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error('[supabase] Error:', res.status, body)
    }
  } catch (err) {
    console.error('[supabase] Fetch failed:', err)
  }
}
