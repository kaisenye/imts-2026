// Vercel serverless function: business card image URL -> parsed fields.
// Requires OPENAI_API_KEY. Never called with the key client-side.

const PROMPT = `Extract contact details from this business card image.
Return ONLY a JSON object with these exact keys: name, title, company, email, email2, phone, phone2.
Cards often carry two phone numbers (office and mobile) or two email addresses: put the
first in email/phone and the second in email2/phone2.
Use null for any field not present on the card. Do not guess or invent values.`

export const config = { runtime: 'nodejs' }

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'OCR is not configured' }, { status: 501 })
  }

  let imageUrl: string
  try {
    const body = (await request.json()) as { imageUrl?: string }
    if (!body.imageUrl) throw new Error('imageUrl is required')
    imageUrl = body.imageUrl
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: PROMPT },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      console.error('OpenAI error', response.status, detail)
      return Response.json({ error: 'Could not read the card' }, { status: 502 })
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const content = payload.choices?.[0]?.message?.content
    if (!content) return Response.json({ error: 'Empty response' }, { status: 502 })

    const parsed = JSON.parse(content) as Record<string, unknown>
    return Response.json({
      name: parsed.name ?? null,
      title: parsed.title ?? null,
      company: parsed.company ?? null,
      email: parsed.email ?? null,
      email2: parsed.email2 ?? null,
      phone: parsed.phone ?? null,
      phone2: parsed.phone2 ?? null,
    })
  } catch (error) {
    console.error('OCR failed', error)
    return Response.json({ error: 'Could not read the card' }, { status: 502 })
  }
}
