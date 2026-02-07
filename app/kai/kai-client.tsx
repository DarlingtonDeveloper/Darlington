'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { MessageList } from '@/components/kai/message-list'
import { ChatInput } from '@/components/kai/chat-input'

export interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: number
}

type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'auth-required'

function uuid(): string {
    return crypto.randomUUID()
}

/**
 * OpenClaw Gateway WebSocket chat client.
 *
 * Protocol: typed req/res/event frames over WebSocket.
 * Handshake: server sends connect.challenge → client sends connect req → server res hello-ok.
 * Chat: chat.send → streaming chat events (delta/final).
 *
 * For remote connections, we need device identity (WebCrypto keypair).
 * The API route proxies auth config so the token stays server-side.
 */
export function KaiClient() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isStreaming, setIsStreaming] = useState(false)
    const [connState, setConnState] = useState<ConnectionState>('connecting')
    const [error, setError] = useState<string | null>(null)

    const wsRef = useRef<WebSocket | null>(null)
    const pendingRef = useRef<Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>>(new Map())
    const runIdRef = useRef<string | null>(null)
    const streamContentRef = useRef('')
    const assistantMsgIdRef = useRef<string | null>(null)
    const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const configRef = useRef<{ wsUrl: string; token: string; sessionKey: string } | null>(null)

    // Send a typed request over WS
    const request = useCallback((method: string, params: Record<string, unknown>): Promise<unknown> => {
        const ws = wsRef.current
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            return Promise.reject(new Error('Not connected'))
        }
        const id = uuid()
        const frame = { type: 'req', id, method, params }
        return new Promise((resolve, reject) => {
            pendingRef.current.set(id, { resolve, reject })
            ws.send(JSON.stringify(frame))
        })
    }, [])

    // Extract text content from a message object
    const extractText = useCallback((msg: Record<string, unknown>): string | null => {
        const content = msg.content
        if (typeof content === 'string') return content
        if (Array.isArray(content)) {
            const texts = content
                .filter((c: unknown) => {
                    const item = c as Record<string, unknown>
                    return item.type === 'text' && typeof item.text === 'string'
                })
                .map((c: unknown) => (c as { text: string }).text)
            return texts.length > 0 ? texts.join('\n') : null
        }
        if (typeof msg.text === 'string') return msg.text
        return null
    }, [])

    // Fetch WS config from auth-gated API route
    const fetchConfig = useCallback(async () => {
        try {
            const res = await fetch('/api/kai/chat')
            if (res.status === 401) {
                setConnState('auth-required')
                return null
            }
            if (!res.ok) throw new Error('Config fetch failed')
            return await res.json() as { wsUrl: string; token: string; sessionKey: string }
        } catch {
            setError('Could not load chat config')
            return null
        }
    }, [])

    // Connect to Gateway WebSocket
    const connect = useCallback(async () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return

        const config = configRef.current || await fetchConfig()
        if (!config) return
        configRef.current = config

        setConnState('connecting')
        setError(null)

        const ws = new WebSocket(config.wsUrl)
        wsRef.current = ws

        ws.onmessage = async (event) => {
            let frame: Record<string, unknown>
            try {
                frame = JSON.parse(event.data)
            } catch { return }

            // Event frames
            if (frame.type === 'event') {
                const eventName = frame.event as string
                const payload = frame.payload as Record<string, unknown> | undefined

                // Challenge → send connect
                if (eventName === 'connect.challenge') {
                    request('connect', {
                        minProtocol: 3,
                        maxProtocol: 3,
                        client: {
                            id: 'webchat',
                            version: '1.0.0',
                            platform: 'web',
                            mode: 'webchat',
                        },
                        role: 'operator',
                        scopes: ['operator.read', 'operator.write'],
                        caps: [],
                        auth: { token: config.token },
                        userAgent: navigator.userAgent,
                        locale: navigator.language,
                    }).then(() => {
                        setConnState('connected')

                        // Load chat history
                        request('chat.history', {
                            sessionKey: config.sessionKey || 'webchat',
                            limit: 100,
                        }).then((result) => {
                            const res = result as { messages?: Array<Record<string, unknown>> }
                            if (res.messages && Array.isArray(res.messages)) {
                                setMessages(
                                    res.messages
                                        .filter(m => m.role === 'user' || m.role === 'assistant')
                                        .map(m => ({
                                            id: uuid(),
                                            role: m.role as 'user' | 'assistant',
                                            content: extractText(m) || '',
                                            timestamp: (m.timestamp as number) || Date.now(),
                                        }))
                                        .filter(m => m.content)
                                )
                            }
                        }).catch(() => { /* history load failure is non-fatal */ })
                    }).catch(() => {
                        setError('Authentication failed')
                        ws.close()
                    })
                    return
                }

                // Chat streaming events
                if (eventName === 'chat') {
                    const state = payload?.state as string | undefined
                    const message = payload?.message as Record<string, unknown> | undefined

                    if (state === 'delta' && message) {
                        const text = extractText(message)
                        if (typeof text === 'string') {
                            // Only update if new content is longer (cumulative)
                            if (text.length >= streamContentRef.current.length) {
                                streamContentRef.current = text
                            }

                            if (!assistantMsgIdRef.current) {
                                const id = uuid()
                                assistantMsgIdRef.current = id
                                setMessages(prev => [...prev, {
                                    id,
                                    role: 'assistant',
                                    content: streamContentRef.current,
                                    timestamp: Date.now(),
                                }])
                            } else {
                                const id = assistantMsgIdRef.current
                                const content = streamContentRef.current
                                setMessages(prev =>
                                    prev.map(m => m.id === id ? { ...m, content } : m)
                                )
                            }
                        }
                    }

                    if (state === 'final' || state === 'aborted' || state === 'error') {
                        // On final, refresh from history for clean state
                        if (state === 'final') {
                            request('chat.history', {
                                sessionKey: config.sessionKey || 'webchat',
                                limit: 100,
                            }).then((result) => {
                                const res = result as { messages?: Array<Record<string, unknown>> }
                                if (res.messages && Array.isArray(res.messages)) {
                                    setMessages(
                                        res.messages
                                            .filter(m => m.role === 'user' || m.role === 'assistant')
                                            .map(m => ({
                                                id: uuid(),
                                                role: m.role as 'user' | 'assistant',
                                                content: extractText(m) || '',
                                                timestamp: (m.timestamp as number) || Date.now(),
                                            }))
                                            .filter(m => m.content)
                                    )
                                }
                            }).catch(() => {})
                        }

                        if (state === 'error') {
                            setError((payload?.errorMessage as string) || 'Response error')
                        }

                        runIdRef.current = null
                        streamContentRef.current = ''
                        assistantMsgIdRef.current = null
                        setIsStreaming(false)
                    }
                }
                return
            }

            // Response frames
            if (frame.type === 'res') {
                const id = frame.id as string
                const pending = pendingRef.current.get(id)
                if (!pending) return
                pendingRef.current.delete(id)

                if (frame.ok) {
                    pending.resolve(frame.payload)
                } else {
                    const err = frame.error as { message?: string } | undefined
                    pending.reject(new Error(err?.message || 'Request failed'))
                }
            }
        }

        ws.onclose = (event) => {
            setConnState('disconnected')
            wsRef.current = null

            // Flush pending requests
            pendingRef.current.forEach((p) => {
                p.reject(new Error('Connection closed'))
            })
            pendingRef.current.clear()

            // Don't reconnect on auth/pairing failure
            if (event.code === 1008 || event.code === 4001 || event.code === 4008) {
                setError(`Connection rejected (${event.code}): ${event.reason || 'auth failed'}`)
                return
            }

            // Auto-reconnect
            reconnectTimer.current = setTimeout(() => connect(), 3000)
        }

        ws.onerror = () => {
            setError('Connection error')
        }
    }, [fetchConfig, request, extractText])

    // Connect on mount
    useEffect(() => {
        connect()
        return () => {
            if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
            if (wsRef.current) wsRef.current.close()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const sendMessage = useCallback(() => {
        if (!input.trim() || isStreaming || connState !== 'connected') return

        const text = input.trim()
        const config = configRef.current
        if (!config) return

        const userMsg: Message = {
            id: uuid(),
            role: 'user',
            content: text,
            timestamp: Date.now(),
        }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsStreaming(true)
        setError(null)
        streamContentRef.current = ''
        assistantMsgIdRef.current = null

        const idempotencyKey = uuid()
        runIdRef.current = idempotencyKey

        request('chat.send', {
            sessionKey: config.sessionKey || 'webchat',
            message: text,
            deliver: false,
            idempotencyKey,
        }).catch((err) => {
            setError(err.message || 'Failed to send')
            setIsStreaming(false)
            runIdRef.current = null
        })
    }, [input, isStreaming, connState, request])

    const stopStreaming = useCallback(() => {
        const config = configRef.current
        request('chat.abort', {
            sessionKey: config?.sessionKey || 'webchat',
            ...(runIdRef.current ? { runId: runIdRef.current } : {}),
        }).catch(() => {})
        setIsStreaming(false)
        runIdRef.current = null
        streamContentRef.current = ''
        assistantMsgIdRef.current = null
    }, [request])

    if (connState === 'auth-required') {
        return (
            <div className="flex flex-col h-full items-center justify-center px-8 text-center">
                <p className="font-display text-xl mb-2" style={{ color: 'var(--accent, #c4b5a0)' }}>Sign in required</p>
                <p className="text-sm mb-4" style={{ color: 'var(--fg2, #6b6560)' }}>You need to be logged in to chat with Kai.</p>
                <a
                    href="/login"
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
                    style={{ background: 'var(--accent, #c4b5a0)', color: 'var(--bg, #07070e)' }}
                >
                    Sign in
                </a>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full max-w-2xl mx-auto">
            {connState === 'connecting' && (
                <div className="text-center py-2 text-xs" style={{ color: 'var(--fg2, #6b6560)' }}>
                    Connecting...
                </div>
            )}
            {connState === 'disconnected' && (
                <div className="text-center py-2 text-xs" style={{ color: 'var(--accent2, #a89880)' }}>
                    Disconnected — reconnecting...
                </div>
            )}
            <MessageList messages={messages} isStreaming={isStreaming} />
            {error && (
                <div className="px-4 py-2 text-sm text-center" style={{ color: 'var(--accent2, #a89880)' }}>{error}</div>
            )}
            <ChatInput
                value={input}
                onChange={setInput}
                onSend={sendMessage}
                onStop={stopStreaming}
                disabled={connState !== 'connected'}
                isStreaming={isStreaming}
            />
        </div>
    )
}
