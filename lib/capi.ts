// Raw fetch instead of facebook-nodejs-business-sdk because:
// 1. The SDK imports Node.js `https` — incompatible with Edge Runtime.
// 2. The SDK adds ~800 KB to the bundle; fetch adds zero.

export interface CAPIEventPayload {
  pixelId: string
  accessToken: string
  eventSourceUrl: string
  clientIpAddress: string
  clientUserAgent: string
  fbc?: string
  campaignName?: string
  utmSource?: string
  utmContent?: string
}

export async function sendMetaCAPIEvent(payload: CAPIEventPayload): Promise<void> {
  const {
    pixelId,
    accessToken,
    eventSourceUrl,
    clientIpAddress,
    clientUserAgent,
    fbc,
    campaignName,
    utmSource,
    utmContent,
  } = payload

  const body = {
    data: [
      {
        event_name: 'Lead',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: eventSourceUrl,
        user_data: {
          client_ip_address: clientIpAddress,
          client_user_agent: clientUserAgent,
          // fbc is derived from fbclid query param; fbp omitted (no cookie access in Edge)
          ...(fbc ? { fbc } : {}),
        },
        custom_data: {
          ...(campaignName ? { campaign_name: campaignName } : {}),
          ...(utmSource ? { utm_source: utmSource } : {}),
          ...(utmContent ? { utm_content: utmContent } : {}),
        },
      },
    ],
    access_token: accessToken,
  }

  const response = await fetch(
    `https://graph.facebook.com/v19.0/${pixelId}/events`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Meta CAPI ${response.status}: ${text}`)
  }
}
