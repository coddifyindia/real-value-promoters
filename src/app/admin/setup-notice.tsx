export function SetupNotice() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
      <h1 className="text-xl text-amber-900">Supabase isn&apos;t connected yet</h1>
      <p className="mt-2 text-sm">
        Set <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> and{" "}
        <code>SUPABASE_SECRET_KEY</code> in your environment, then reload. See SETUP.md in the repository.
      </p>
    </div>
  );
}
