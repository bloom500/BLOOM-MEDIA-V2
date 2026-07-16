export interface LeadRow {
  source: string
  /** UUID generat de rută — worker-ul actualizează status-ul pe baza lui. */
  lead_id?: string
  status?: string
  name: string
  email: string
  phone: string
  website?: string | null
  social?: string | null
  message?: string | null
  selected_services?: string[] | null
  monthly_total?: number | null
  one_time_total?: number | null
}

export type InsertResult = 'saved' | 'skipped' | 'failed'

/**
 * Persistă lead-ul. Supabase e sursa de adevăr a pipeline-ului: rutele îl
 * apelează PRIMUL și întorc 500 dacă eșuează — restul integrărilor (email,
 * CRM, CAPI) sunt best-effort. 'skipped' = env nesetat (dev local).
 */
export async function insertLead(row: LeadRow): Promise<InsertResult> {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.warn('[supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — skipping')
    return 'skipped'
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
      body: JSON.stringify({ status: 'received', ...row }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error('[supabase] Error:', res.status, body)
      return 'failed'
    }
    return 'saved'
  } catch (err) {
    console.error('[supabase] Fetch failed:', err)
    return 'failed'
  }
}
