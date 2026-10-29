"use client";

import { useActionSubmit } from "@/components/form-meta";
import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { updateLead } from "@/app/actions/admin";
import { LEAD_STATUS_LABELS, LEAD_STATUSES, type LeadStatus } from "@/lib/types";
import type { FormState } from "@/lib/validation";

export function LeadEditor({ id, status, notes }: { id: string; status: LeadStatus; notes: string }) {
  const [state, action, pending] = useActionState(updateLead, { status: "idle" } as FormState);
  const onSubmit = useActionSubmit(action);
  return (
    <form onSubmit={onSubmit} className="space-y-2 rounded-xl bg-slate-50 p-3">
      <input type="hidden" name="id" value={id} />
      <label className="block">
        <span className="text-xs font-medium text-slate-600">Status</span>
        <select name="status" defaultValue={status} className="field mt-1">
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-xs font-medium text-slate-600">Internal notes</span>
        <textarea name="notes" defaultValue={notes} rows={2} className="field mt-1" placeholder="Called, interested in 3 cents…" />
      </label>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn-primary min-h-9 px-4">
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />} Save
        </button>
        {state.message && (
          <span className={`text-sm ${state.status === "error" ? "text-red-600" : "text-green-700"}`} role="status">
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
