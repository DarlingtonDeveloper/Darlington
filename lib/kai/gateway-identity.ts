/**
 * Device identity for OpenClaw Gateway WebSocket connections.
 * Uses Ed25519 signing — same as the Control UI.
 *
 * Keys are persisted in localStorage so the device is recognised across sessions.
 * Device ID = SHA-256 hex of the public key bytes.
 */
import * as ed from '@noble/ed25519'

// Configure @noble/ed25519 to use browser's SHA-512
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(ed.etc as any).sha512Async = async (message: Uint8Array) => {
    const buf = new Uint8Array(message).buffer
    const hash = await crypto.subtle.digest('SHA-512', buf)
    return new Uint8Array(hash)
}

const STORAGE_KEY = 'openclaw-device-identity-v1'

// ── Base64url encode/decode (matching Control UI format) ──

function toBase64Url(bytes: Uint8Array): string {
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '')
}

function fromBase64Url(str: string): Uint8Array {
    const padded = str.replaceAll('-', '+').replaceAll('_', '/') +
        '='.repeat((4 - (str.length % 4)) % 4)
    const binary = atob(padded)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
    }
    return bytes
}

// ── Helpers ──

async function sha256Hex(data: Uint8Array): Promise<string> {
    const buf = new Uint8Array(data).buffer
    const hash = await crypto.subtle.digest('SHA-256', buf)
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
}

// ── Device identity ──

interface DeviceKeys {
    deviceId: string
    publicKey: string   // base64url-encoded public key
    privateKey: string  // base64url-encoded secret key
}

interface StoredIdentity {
    version: 1
    deviceId: string
    publicKey: string
    privateKey: string
    createdAtMs: number
}

/**
 * Get or create device identity. Persisted in localStorage.
 */
export async function getDeviceIdentity(): Promise<DeviceKeys> {
    // Try to load existing
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            const parsed: StoredIdentity = JSON.parse(stored)
            if (
                parsed?.version === 1 &&
                typeof parsed.deviceId === 'string' &&
                typeof parsed.publicKey === 'string' &&
                typeof parsed.privateKey === 'string'
            ) {
                // Verify deviceId matches public key
                const pubBytes = fromBase64Url(parsed.publicKey)
                const expectedId = await sha256Hex(pubBytes)
                if (expectedId !== parsed.deviceId) {
                    // Fix stale deviceId
                    const fixed = { ...parsed, deviceId: expectedId }
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(fixed))
                    return { deviceId: expectedId, publicKey: parsed.publicKey, privateKey: parsed.privateKey }
                }
                return { deviceId: parsed.deviceId, publicKey: parsed.publicKey, privateKey: parsed.privateKey }
            }
        }
    } catch {
        // Corrupted storage, regenerate
    }

    // Generate new Ed25519 keypair
    const secretKey = ed.utils.randomSecretKey()
    const publicKey = await ed.getPublicKeyAsync(secretKey)
    const deviceId = await sha256Hex(publicKey)

    const identity: StoredIdentity = {
        version: 1,
        deviceId,
        publicKey: toBase64Url(publicKey),
        privateKey: toBase64Url(secretKey),
        createdAtMs: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identity))

    return { deviceId, publicKey: identity.publicKey, privateKey: identity.privateKey }
}

/**
 * Build the signature payload string (pipe-separated, matching Control UI format).
 */
export function buildSignaturePayload(opts: {
    deviceId: string
    clientId: string
    clientMode: string
    role: string
    scopes: string[]
    signedAtMs: number
    token: string | null
    nonce: string | null
}): string {
    const version = opts.nonce ? 'v2' : 'v1'
    const parts = [
        version,
        opts.deviceId,
        opts.clientId,
        opts.clientMode,
        opts.role,
        opts.scopes.join(','),
        String(opts.signedAtMs),
        opts.token ?? '',
    ]
    if (version === 'v2') {
        parts.push(opts.nonce ?? '')
    }
    return parts.join('|')
}

/**
 * Sign a message with the device's Ed25519 private key.
 * Returns base64url-encoded signature.
 */
export async function signMessage(privateKeyB64: string, message: string): Promise<string> {
    const secretKey = fromBase64Url(privateKeyB64)
    const messageBytes = new TextEncoder().encode(message)
    const signature = await ed.signAsync(messageBytes, secretKey)
    return toBase64Url(signature)
}
