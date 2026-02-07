import { NextRequest } from 'next/server'

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789'
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || ''

const MAX_MESSAGE_LENGTH = 10000
const MAX_MESSAGES = 50

interface ChatMessage {
    role: string
    content: string
}

function validateMessages(messages: unknown): messages is ChatMessage[] {
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
        return false
    }
    return messages.every(
        (m) =>
            typeof m === 'object' &&
            m !== null &&
            typeof m.content === 'string' &&
            m.content.length <= MAX_MESSAGE_LENGTH &&
            (m.role === 'user' || m.role === 'assistant')
    )
}

export async function POST(req: NextRequest) {
    let body: unknown
    try {
        body = await req.json()
    } catch {
        return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { messages } = body as { messages?: unknown }

    if (!validateMessages(messages)) {
        return Response.json(
            { error: 'Invalid messages: must be a non-empty array of {role: "user"|"assistant", content: string}' },
            { status: 400 }
        )
    }

    let response: Response
    try {
        response = await fetch(`${GATEWAY_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GATEWAY_TOKEN}`,
            },
            body: JSON.stringify({
                model: 'openclaw:main',
                messages,
                stream: true,
                user: 'darlington-web',
            }),
            signal: AbortSignal.timeout(60_000),
        })
    } catch {
        return Response.json({ error: 'Gateway unavailable' }, { status: 502 })
    }

    if (!response.ok) {
        return Response.json({ error: 'Gateway error' }, { status: 502 })
    }

    if (!response.body) {
        return Response.json({ error: 'No response body from gateway' }, { status: 502 })
    }

    return new Response(response.body, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    })
}
