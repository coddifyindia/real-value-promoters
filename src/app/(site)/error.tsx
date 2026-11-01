"use client";

import { ErrorState } from "@/components/error-state";

// Catches errors in any public page while keeping the header, footer and
// contact bar on screen.
export default function SiteError({ error, retry }: { error: unknown; retry: () => void }) {
  return <ErrorState error={error} retry={retry} />;
}
