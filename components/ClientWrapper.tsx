"use client";

import { useSyncExternalStore } from "react";

interface ClientWrapperProps {
  children: React.ReactNode;
}

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function ClientWrapper({ children }: ClientWrapperProps) {
  const isMounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (!isMounted) {
    return null;
  }

  return <>{children}</>;
}
