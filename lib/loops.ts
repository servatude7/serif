const LOOPS_API_BASE = 'https://app.loops.so/api/v1'

interface LoopsContactInput {
  email: string
  firstName?: string
}

function getLoopsApiKey() {
  const apiKey = process.env.LOOPS_API_KEY
  if (!apiKey) throw new Error('LOOPS_API_KEY is not set')
  return apiKey
}

async function loopsRequest(path: string, method: string, body: unknown) {
  const res = await fetch(`${LOOPS_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${getLoopsApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Loops request failed (${res.status}): ${detail}`)
  }

  return res.json()
}

// "update" creates the contact if it doesn't exist yet, or updates it if it
// does. Unlike "create", it never 409s for contacts that already exist
// (e.g. from re-signups or contacts added while testing a loop).
export async function upsertLoopsContact({ email, firstName }: LoopsContactInput) {
  return loopsRequest('/contacts/update', 'PUT', {
    email,
    firstName,
    source: 'Signup form',
  })
}

// Explicitly fires a "signup" event so a welcome loop triggers on every
// signup, even for a contact that already existed in Loops (a
// "contact created" trigger would otherwise only fire once, ever).
export async function sendLoopsSignupEvent({ email, firstName }: LoopsContactInput) {
  return loopsRequest('/events/send', 'POST', {
    email,
    firstName,
    eventName: 'signup',
  })
}
