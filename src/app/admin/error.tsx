"use client";

import { ErrorState } from "@/components/error-state";

export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <ErrorState
      error={error}
      retry={retry}
      compact
      title="That didn't work"
      message="The database didn't respond in time or the change couldn't be saved. Nothing was lost; try again."
    />
  );
}
