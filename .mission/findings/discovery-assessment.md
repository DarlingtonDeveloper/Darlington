# MC Dashboard — Discovery Assessment

## Current State

- 8 files, ~350 lines of shell code at /mc
- Basic WebSocket hook, flat worker list, connection status
- Needs complete rewrite to match SPEC.md

## Reference

- SPEC.jsx: 2,186-line demo with mock data — complete visual reference
- SPEC.md: 301-line spec with exact design tokens, endpoints, protocol

## Scope

- 3 views: Mission (workers+chat), Trace (dependency graph), Activity (gates+audit+charts)
- Persistent header with pipeline bar, task stats, token burn
- Real-time WebSocket with topic subscriptions
- REST API integration for actions (gate approve, worker spawn/kill, chat)

## Existing Patterns

- Next.js 15, React 19, Tailwind CSS 4
- Server page + client component pattern
- Radix UI + CVA (but SPEC.jsx uses inline styles — will convert to Tailwind)
- Dark theme with CSS variables

## Key Decision

- SPEC.jsx uses inline styles — convert to Tailwind classes matching existing site patterns
- Keep component structure from JSX demo but split into proper files
