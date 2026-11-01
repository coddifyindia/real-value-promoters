"use client";

import { Calculator, Info } from "lucide-react";
import { useId, useState } from "react";
import { formatINR, formatINRShort, loanBreakdown } from "@/lib/finance";

// Typical Indian plot-loan terms; every value is adjustable by the visitor.
const DEFAULTS = { downPayment: 25, rate: 9.5, years: 10 };

export function EmiCalculator({ price, propertyName }: { price: number; propertyName: string }) {
  const id = useId();
  const [amount, setAmount] = useState(price);
  const [downPayment, setDownPayment] = useState(DEFAULTS.downPayment);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [years, setYears] = useState(DEFAULTS.years);

  const b = loanBreakdown(amount, downPayment, rate, years);
  const interestShare = b.totalPayable ? (b.totalInterest / b.totalPayable) * 100 : 0;

  return (
    <section aria-labelledby={`${id}-title`} className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-200/70 sm:p-7">
      <div className="flex items-center gap-3">
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
          <Calculator className="size-5" aria-hidden />
        </span>
        <div>
          <h2 id={`${id}-title`} className="text-2xl">
            Loan &amp; EMI estimate
          </h2>
          <p className="text-sm text-slate-500">For {propertyName}. Move the sliders to match your plan.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="space-y-5">
          <div>
            <label htmlFor={`${id}-amount`} className="label">
              Property price
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-500">₹</span>
              <input
                id={`${id}-amount`}
                type="number"
                inputMode="numeric"
                min={50000}
                step={10000}
                value={amount || ""}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                className="field pl-8"
              />
            </div>
          </div>
          <Slider id={`${id}-down`} label="Down payment" value={downPayment} min={10} max={60} step={5} onChange={setDownPayment} display={`${downPayment}% · ${formatINRShort(b.downPayment)}`} />
          <Slider id={`${id}-rate`} label="Interest rate (per year)" value={rate} min={7} max={14} step={0.25} onChange={setRate} display={`${rate.toFixed(2)}%`} />
          <Slider id={`${id}-years`} label="Loan tenure" value={years} min={1} max={20} step={1} onChange={setYears} display={`${years} ${years === 1 ? "year" : "years"}`} />
        </div>

        <div className="flex flex-col rounded-2xl bg-navy-900 p-6 text-white">
          <p className="text-sm text-white/70">Estimated monthly EMI</p>
          <p className="mt-1 font-display text-4xl text-gold-300 tabular-nums" aria-live="polite" data-testid="emi-monthly">
            {formatINR(b.monthly)}
          </p>
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/15" aria-hidden>
            <div className="h-full rounded-full bg-gold-400 transition-[width] duration-500" style={{ width: `${100 - interestShare}%` }} />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="flex items-center gap-1.5 text-white/60">
                <span className="size-2 rounded-full bg-gold-400" aria-hidden /> Loan amount
              </dt>
              <dd className="mt-0.5 font-semibold tabular-nums">{formatINR(b.principal)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-white/60">
                <span className="size-2 rounded-full bg-white/30" aria-hidden /> Total interest
              </dt>
              <dd className="mt-0.5 font-semibold tabular-nums">{formatINR(b.totalInterest)}</dd>
            </div>
            <div className="col-span-2 border-t border-white/10 pt-3">
              <dt className="text-white/60">Total payable over {years} {years === 1 ? "year" : "years"}</dt>
              <dd className="mt-0.5 font-semibold tabular-nums">{formatINR(b.totalPayable)}</dd>
            </div>
          </dl>
          <a href="#enquire" className="btn-gold mt-6">
            Get loan assistance
          </a>
        </div>
      </div>
      <p className="mt-4 flex items-start gap-1.5 text-xs text-slate-500">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        Indicative only. Final rates, tenure and eligibility are decided by the bank. We help with SBI, HDFC, LIC HFL and more.
      </p>
    </section>
  );
}

function Slider({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
        <span className="text-sm font-semibold text-navy-900 tabular-nums">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={display}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range w-full"
        style={{ "--pct": `${pct}%` } as React.CSSProperties}
      />
    </div>
  );
}
