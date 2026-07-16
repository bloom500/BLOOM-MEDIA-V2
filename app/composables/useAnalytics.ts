/*
 * Analytics consent-gated: nimic nu se încarcă fără accept explicit.
 * Meta Pixel (ID-ul din meta-capi.ts) + GA4 opțional prin NUXT_PUBLIC_GA_ID.
 * trackLead(eventId) folosește același eventID ca CAPI → Meta deduplică.
 */
const CONSENT_KEY = 'bloom-consent' // 'yes' | 'no' | absent = neîntrebat
const PIXEL_ID = '1672336757255871'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export function getConsent(): 'yes' | 'no' | null {
  if (!import.meta.client) return null
  const v = localStorage.getItem(CONSENT_KEY)
  return v === 'yes' || v === 'no' ? v : null
}

export function setConsent(value: 'yes' | 'no') {
  localStorage.setItem(CONSENT_KEY, value)
  if (value === 'yes') loadAnalytics()
}

let loaded = false

export function loadAnalytics() {
  if (!import.meta.client || loaded || getConsent() !== 'yes') return
  loaded = true

  // Meta Pixel — snippet-ul standard, fără eval.
  const w = window
  if (!w.fbq) {
    const fbq: any = (...args: unknown[]) => {
      fbq.callMethod ? fbq.callMethod(...args) : fbq.queue.push(args)
    }
    fbq.push = fbq
    fbq.loaded = true
    fbq.version = '2.0'
    fbq.queue = []
    w.fbq = fbq
    const s = document.createElement('script')
    s.async = true
    s.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(s)
  }
  w.fbq!('init', PIXEL_ID)
  w.fbq!('track', 'PageView')

  // GA4 — doar dacă e configurat ID-ul.
  const gaId = useRuntimeConfig().public.gaId
  if (gaId) {
    const s = document.createElement('script')
    s.async = true
    s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    document.head.appendChild(s)
    w.dataLayer = w.dataLayer || []
    w.gtag = (...args: unknown[]) => { w.dataLayer!.push(args) }
    w.gtag('js', new Date())
    w.gtag('config', gaId, { anonymize_ip: true })
  }
}

/** Apelat de formulare după submit reușit; eventId = cel trimis și la CAPI. */
export function trackLead(eventId: string) {
  if (!import.meta.client || getConsent() !== 'yes') return
  window.fbq?.('track', 'Lead', {}, { eventID: eventId })
  window.gtag?.('event', 'generate_lead')
}
