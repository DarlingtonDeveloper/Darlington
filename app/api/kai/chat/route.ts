import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/kai/chat — Auth gate for WebSocket config.
 * Returns the Gateway WS URL + token only to authenticated users.
 * The token never reaches the client HTML — only fetched after auth.
 */
export async function GET() {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || 'ws://127.0.0.1:18789'
    const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN || ''

    // Convert http(s) to ws(s) if needed
    const wsUrl = gatewayUrl
        .replace(/^https:\/\//, 'wss://')
        .replace(/^http:\/\//, 'ws://')

    // Each authenticated user gets their own webchat session, isolated from
    // WhatsApp (which uses 'main') and from other webchat users.
    const sessionKey = `webchat:${user.id}`

    return Response.json({
        wsUrl,
        token: gatewayToken,
        sessionKey,
    })
}
