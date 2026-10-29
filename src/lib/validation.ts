import { z } from "zod";
import { LEAD_KINDS } from "./types";

const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s()-]/g, ""))
  .pipe(
    z
      .string()
      .regex(/^(\+?\d{10,15})$/, "Enter a valid phone number (10 digits, or with country code)"),
  );

export const leadSchema = z
  .object({
    kind: z.enum(LEAD_KINDS),
    name: z.string().trim().min(2, "Please enter your name").max(120),
    email: z.email("Enter a valid email address").trim().max(254),
    phone,
    message: z.string().trim().max(2000, "Message is too long").optional().default(""),
    propertySlug: z.string().trim().max(120).optional().default(""),
    preferredDate: z
      .union([z.literal(""), z.iso.date("Pick a valid date")])
      .optional()
      .default(""),
    sourcePath: z.string().max(300).optional().default(""),
  })
  .superRefine((v, ctx) => {
    if (v.kind === "site_visit" && !v.preferredDate) {
      ctx.addIssue({ code: "custom", path: ["preferredDate"], message: "Pick a date for your visit" });
    }
  });

export type LeadInput = z.infer<typeof leadSchema>;

export const subscribeSchema = z.object({
  email: z.email("Enter a valid email address").trim().max(254),
});

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
  whatsappUrl?: string;
};

export function fieldErrorsOf(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
