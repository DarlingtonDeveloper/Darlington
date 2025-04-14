'use client'

import { useState, useEffect } from 'react'

interface ClientWrapperProps {
    children: React.ReactNode
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return null
    }

    return <>{children}</>
}