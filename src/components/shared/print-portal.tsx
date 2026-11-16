"use client";

import React, { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

interface PrintPortalProps {
  children: React.ReactNode;
}

const emptySubscribe = () => () => {};

/**
 * Mounts printable A4 document trees directly onto document.body via React Portal
 * so @media print isolation rules in globals.css work consistently across all browsers,
 * including mobile viewports and multi-page documents.
 */
export const PrintPortal: React.FC<PrintPortalProps> = ({ children }) => {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isClient || typeof document === "undefined") {
    return null;
  }

  return createPortal(children, document.body);
};
