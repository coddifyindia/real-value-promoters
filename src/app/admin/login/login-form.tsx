"use client";

import { useActionSubmit } from "@/components/form-meta";
import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { signIn } from "@/app/actions/admin";
import type { FormState } from "@/lib/validation";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, { status: "idle" } as FormState);
  const onSubmit = useActionSubmit(action);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      {state.status === "error" && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{state.message}</p>
      )}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden />} Sign in
      </button>
    </form>
  );
}
