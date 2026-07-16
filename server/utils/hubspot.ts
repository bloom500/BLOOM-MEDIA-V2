interface HubSpotContactData {
  name: string
  email: string
  phone: string
  website?: string | null
  source?: string
}

export async function createHubSpotContact(data: HubSpotContactData): Promise<void> {
  // Vercel are variabila sub numele HUBSPOT_API_KEY — acceptăm ambele.
  const token = process.env.HUBSPOT_TOKEN || process.env.HUBSPOT_API_KEY
  if (!token) {
    console.warn('[hubspot] HUBSPOT_TOKEN not set — skipping')
    return
  }

  const nameParts = data.name.trim().split(/\s+/)
  const firstname = nameParts[0] ?? ''
  const lastname  = nameParts.slice(1).join(' ') || ''

  const properties: Record<string, string> = {
    firstname,
    email:           data.email,
    phone:           data.phone,
    hs_lead_status:  'NEW',
    lifecyclestage:  'lead',
  }
  if (lastname)      properties.lastname = lastname
  if (data.website)  properties.website  = data.website
  if (data.source)   properties.hs_analytics_source_data_1 = data.source

  try {
    const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ properties }),
    })

    if (res.status === 409) {
      // Contact already exists — not an error
      return
    }

    if (!res.ok) {
      const body = await res.text()
      console.error('[hubspot] Error:', res.status, body)
    }
  } catch (err) {
    console.error('[hubspot] Fetch failed:', err)
  }
}
