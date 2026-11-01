"use client";

import { useActionSubmit } from "@/components/form-meta";
import { CircleAlert, Loader2, LockKeyhole, LogIn, Mail } from "lucide-react";
import { WithIcon } from "@/components/field";
import { useActionState } from "react";
import { signIn } from "@/app/actions/admin";
import type { FormState } from "@/lib/validation";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, { status: "idle" } as FormState);
  const onSubmit = useActionSubmit(action);
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="label">Email</label>
        <WithIcon icon={Mail}>
          <input id="email" name="email" type="email" autoComplete="username" required placeholder="you@realvaluepromoters.com" className="field field-icon" />
        </WithIcon>
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <WithIcon icon={LockKeyhole}>
          <input id="password" name="password" type="password" autoComplete="current-password" required placeholder="Your password" className="field field-icon" />
        </WithIcon>
      </div>
      {state.status === "error" && (
        <p className="flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert"><CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />{state.message}</p>
      )}
      <button type="submit" disabled={pending} className="btn-primary btn-lg w-full">
        {pending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <LogIn className="size-5" aria-hidden />} Sign in
      </button>
    </form>
  );
}
