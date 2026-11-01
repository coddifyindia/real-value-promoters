"use client";

import { Fraunces, Inter } from "next/font/google";
import { ErrorState } from "@/components/error-state";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], display: "swap" });

// Last line of defence: replaces the root layout if it fails to render.
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="flex min-h-dvh flex-col justify-center">
        <title>Something went wrong | Real Value Promoters</title>
        <ErrorState error={error} retry={retry} />
      </body>
    </html>
  );
}
