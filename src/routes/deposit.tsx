"use client";

import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Zap,
  Copy,
  Check,
} from "lucide-react";
import { Reveal } from "@/components/reveal";
import { PageBackground } from "@/components/page-background";

export const Route = createFileRoute("/deposit")({
  head: () => ({
    meta: [
      { title: "Deposit Capital — ChainForge" },
      {
        name: "description",
        content:
          "Instant and secure funding for your trading accounts across major brokers.",
      },
    ],
  }),
  component: DepositPage,
});

type BrokerType = "weltrade" | "deriv" | "other";
type PaymentMethodType = "ecocash" | "innbucks" | "fnb_eft";

const MIN_DEPOSIT = 1;

function DepositPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    whatsapp: "",
  });

  const [selectedBroker, setSelectedBroker] = useState<BrokerType>("weltrade");
  const [crNumber, setCrNumber] = useState<string>("");
  const [binanceAddress, setBinanceAddress] = useState<string>("");
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethodType>("ecocash");
  const [amount, setAmount] = useState<string>("100");

  const amountNum = Number(amount || 0);
  const fee = +(amountNum * 0.1).toFixed(2);
  const net = +(amountNum * 0.9).toFixed(2);

  const isCrInvalid =
    selectedBroker === "deriv" &&
    crNumber.trim().length > 0 &&
    !/^CR\d+$/i.test(crNumber.trim());
  const isAmountInvalid = amountNum < MIN_DEPOSIT;

  const isFormValid =
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.whatsapp.trim() !== "" &&
    !isAmountInvalid &&
    (selectedBroker !== "deriv" || /^CR\d+$/i.test(crNumber.trim())) &&
    ((selectedBroker !== "weltrade" && selectedBroker !== "other") || binanceAddress.trim() !== "");

  return (
    <>
      <section className="relative">
        <PageBackground variant="soft" />
        <div className="relative mx-auto max-w-5xl px-6 pt-24 pb-12 text-center">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.25em] text-primary-glow font-['Montserrat']">
              Account Funding
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="font-display mt-5 text-5xl md:text-6xl font-['Montserrat']">
              <span className="text-gradient">Deposit</span>{" "}
              <span className="text-accent-gradient">Capital.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-6 max-w-2xl text-muted-foreground text-sm md:text-base">
              Move your capital onto the desk with zero friction. Minimum
              deposit{" "}
              <span className="text-foreground font-semibold">${MIN_DEPOSIT}</span>.
              A flat <span className="text-foreground font-semibold">10% desk fee</span>{" "}
              is deducted from your deposit.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-8 lg:grid-cols-3 items-start">
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Personal Details */}
            <div className="card-animated rounded-3xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground font-['Montserrat'] mb-6 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-glow/20 text-primary-glow text-[10px]">
                  1
                </span>
                Personal Details
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="First Name"
                  icon={<User className="h-4 w-4 text-muted-foreground mr-2.5" />}
                  value={formData.firstName}
                  placeholder="John"
                  onChange={(v) => setFormData({ ...formData, firstName: v })}
                />
                <Field
                  label="Surname"
                  icon={<User className="h-4 w-4 text-muted-foreground mr-2.5" />}
                  value={formData.lastName}
                  placeholder="Doe"
                  onChange={(v) => setFormData({ ...formData, lastName: v })}
                />
                <div className="sm:col-span-2">
                  <Field
                    label="Email Address"
                    type="email"
                    icon={<Mail className="h-4 w-4 text-muted-foreground mr-2.5" />}
                    value={formData.email}
                    placeholder="johndoe@example.com"
                    onChange={(v) => setFormData({ ...formData, email: v })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Field
                    label="WhatsApp Number"
                    type="tel"
                    icon={<Phone className="h-4 w-4 text-muted-foreground mr-2.5" />}
                    value={formData.whatsapp}
                    placeholder="+263 7xx xxx xxx"
                    onChange={(v) => setFormData({ ...formData, whatsapp: v })}
                  />
                </div>
              </div>
            </div>

            {/* 2. Broker */}
            <div className="card-animated rounded-3xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground font-['Montserrat'] mb-6 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-glow/20 text-primary-glow text-[10px]">
                  2
                </span>
                Select Destination Broker
              </h3>

              <div className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    { id: "weltrade", label: "Weltrade", logo: "/wel.png" },
                    { id: "deriv", label: "Deriv", logo: "/der.png" },
                    { id: "other", label: "Other", logo: "/bin.png" },
                  ] as { id: BrokerType; label: string; logo: string }[]
                ).map((broker) => (
                  <button
                    key={broker.id}
                    type="button"
                    onClick={() => setSelectedBroker(broker.id)}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border font-['Montserrat'] font-medium text-sm transition-all relative ${
                      selectedBroker === broker.id
                        ? "border-primary-glow bg-primary-glow/[0.08] text-foreground shadow-[0_0_25px_rgba(139,92,246,0.25)]"
                        : "border-border bg-background/40 text-muted-foreground hover:border-muted-foreground/40"
                    }`}
                  >
                    <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-white/95 p-1.5">
                      <img
                        src={broker.logo}
                        alt={broker.label}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            "none";
                        }}
                      />
                    </div>
                    {broker.label}
                    {selectedBroker === broker.id && (
                      <CheckCircle2 className="absolute top-2 right-2 h-3.5 w-3.5 text-primary-glow" />
                    )}
                  </button>
                ))}
              </div>

              {selectedBroker === "deriv" && (
                <div className="mt-5 pt-4 border-t border-border/50">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70 block mb-2">
                    Deriv CR Number
                  </label>
                  <div
                    className={`flex items-center rounded-xl border px-3 py-2.5 bg-background/40 transition-colors ${
                      isCrInvalid
                        ? "border-rose-500/80 focus-within:border-rose-500"
                        : "border-border focus-within:border-primary-glow/50"
                    }`}
                  >
                    <input
                      type="text"
                      placeholder="CR123456"
                      value={crNumber}
                      onChange={(e) => setCrNumber(e.target.value)}
                      className="w-full bg-transparent text-sm text-foreground outline-none border-none p-0 font-mono uppercase tracking-wide"
                    />
                  </div>
                  {isCrInvalid && (
                    <p className="flex items-center gap-1.5 text-xs text-rose-500 font-medium mt-2">
                      <AlertCircle className="h-3.5 w-3.5" />
                      CR Number should start with CR only
                    </p>
                  )}
                </div>
              )}

              {(selectedBroker === "weltrade" || selectedBroker === "other") && (
                <div className="mt-5 pt-4 border-t border-border/50">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70 block mb-2">
                    Your Binance Payout Address (USDT TRC20)
                  </label>
                  <div className="flex items-center rounded-xl border border-border px-3 py-2.5 bg-background/40 focus-within:border-primary-glow/50 transition-colors">
                    <input
                      type="text"
                      placeholder="Paste your USDT TRC20 address here"
                      value={binanceAddress}
                      onChange={(e) => setBinanceAddress(e.target.value)}
                      className="w-full bg-transparent text-sm text-foreground outline-none border-none p-0 font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-rose-500 font-bold bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 mt-3">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span className="text-[11px] uppercase tracking-wider">USDT TRC20 only!</span>
                  </div>
                  <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">
                    Double check your address. We are not responsible for funds sent to a wrong address.
                  </p>
                </div>
              )}
            </div>

            {/* 3. Payment Method */}
            <div className="card-animated rounded-3xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground font-['Montserrat'] mb-6 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-glow/20 text-primary-glow text-[10px]">
                  3
                </span>
                Payment Method
              </h3>

              <div className="grid gap-4 sm:grid-cols-3">
                {(
                  [
                    { id: "ecocash", label: "EcoCash", logo: "/ecocash.jpg" },
                    { id: "innbucks", label: "InnBucks", logo: "/innbucks.png" },
                    { id: "fnb_eft", label: "FNB EFT", logo: "/fnb.png" },
                  ] as { id: PaymentMethodType; label: string; logo: string }[]
                ).map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method.id)}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border font-medium text-sm transition-all relative ${
                      selectedMethod === method.id
                        ? "border-primary-glow bg-primary-glow/[0.08] text-foreground shadow-[0_0_25px_rgba(139,92,246,0.25)]"
                        : "border-border bg-background/40 text-muted-foreground hover:border-muted-foreground/40"
                    }`}
                  >
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/95 p-1">
                      <img
                        src={method.logo}
                        alt={method.label}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          const t = e.currentTarget as HTMLImageElement;
                          t.style.display = "none";
                          const fb = t.parentElement?.querySelector(
                            ".fb"
                          ) as HTMLElement | null;
                          if (fb) fb.style.display = "flex";
                        }}
                      />
                      <Smartphone className="fb h-5 w-5 text-primary-glow hidden" />
                    </div>
                    {method.label}
                    <span className="text-[9px] font-mono text-muted-foreground/60 mt-1">
                      10% DESK FEE
                    </span>
                    {selectedMethod === method.id && (
                      <CheckCircle2 className="absolute top-2 right-2 h-3.5 w-3.5 text-primary-glow" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Amount */}
            <div className="card-animated rounded-3xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground font-['Montserrat'] mb-4">
                Amount Setting
              </h3>
              <div
                className={`relative flex items-center rounded-xl border bg-background/50 transition-colors px-4 py-2.5 ${
                  isAmountInvalid && amount !== ""
                    ? "border-rose-500/80"
                    : "border-border focus-within:border-primary-glow/60"
                }`}
              >
                <span className="text-sm font-medium text-muted-foreground mr-1.5">
                  $
                </span>
                <input
                  type="number"
                  min={MIN_DEPOSIT}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent text-base font-semibold text-foreground placeholder-muted-foreground/40 outline-none border-none p-0"
                  placeholder={`${MIN_DEPOSIT}`}
                />
              </div>
              {isAmountInvalid && (
                <p className="flex items-center gap-1.5 text-xs text-rose-500 font-medium mt-2">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Minimum deposit is ${MIN_DEPOSIT}.
                </p>
              )}
            </div>
          </div>

          {/* Right summary */}
          <div className="space-y-6 lg:sticky lg:top-36">
            <div className="card-animated rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground font-['Montserrat']">
                  Summary
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-emerald-500 uppercase">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure Desk
                </div>
              </div>

              <div className="space-y-3.5 text-xs border-b border-border/60 pb-5">
                <Row label="Target Broker" value={selectedBroker} capitalize />
                {selectedBroker === "deriv" && crNumber && (
                  <Row label="Account ID" value={crNumber} mono uppercase />
                )}
                {(selectedBroker === "weltrade" || selectedBroker === "other") && binanceAddress && (
                  <Row label="Payout Address" value={binanceAddress} mono />
                )}
                <Row
                  label="Method"
                  value={selectedMethod.replace("_", " ")}
                  uppercase
                />
                <Row
                  label="Deposit Amount"
                  value={`$${amountNum.toLocaleString()}`}
                  mono
                />
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Desk Fee (10%)</span>
                  <span className="font-mono text-rose-400">
                    - ${fee.toFixed(2)}
                  </span>
                </div>
                <div className="pt-3 flex justify-between items-baseline">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                    Net Credited to Broker
                  </span>
                  <span className="text-xl font-bold tracking-tight text-primary-glow font-mono">
                    ${net.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Per-method protocol — flashing so it can't be missed */}
              <div className="mt-5 p-4 rounded-2xl protocol-flash text-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider font-['Montserrat'] mb-3 flex items-center gap-1.5 protocol-flash-title">
                  <Zap className="h-3.5 w-3.5" />
                  Deposit Instructions
                </p>

                {selectedMethod === "fnb_eft" ? (
                  <FnbDepositInstructions />
                ) : (
                  <MobileDepositInstructions
                    method={selectedMethod}
                    showQrStep={selectedBroker !== "deriv"}
                  />
                )}
              </div>

              {(() => {
                const qrLine =
                  selectedBroker !== "deriv"
                    ? `\n*Reminder:* attach (1) proof of transaction AND (2) your Binance QR screenshot.`
                    : `\n*Reminder:* attach your proof of transaction.`;

                const buildMsg = () =>
                  encodeURIComponent(
                    `*NEW DEPOSIT REQUEST — ChainForge*\n` +
                      `─────────────────────\n` +
                      `*Client:* ${formData.firstName} ${formData.lastName}\n` +
                      `*Email:* ${formData.email}\n` +
                      `*WhatsApp:* ${formData.whatsapp}\n` +
                      `─────────────────────\n` +
                      `*Broker:* ${selectedBroker.toUpperCase()}` +
                      (selectedBroker === "deriv" ? ` (CR: ${crNumber})` : "") +
                      ((selectedBroker === "weltrade" || selectedBroker === "other") ? `\n*Binance Address:* ${binanceAddress}` : "") +
                      `\n` +
                      `*Payment Method:* ${selectedMethod
                        .replace("_", " ")
                        .toUpperCase()}\n` +
                      `─────────────────────\n` +
                      `*Deposit Amount:* $${amountNum.toLocaleString()}\n` +
                      `*Desk Fee (10%):* -$${fee.toFixed(2)}\n` +
                      `*Net to Broker:* $${net.toFixed(2)}\n` +
                      `─────────────────────` +
                      qrLine,
                  );

                const dispatch = () => {
                  if (!isFormValid) return;
                  const msg = buildMsg();
                  window.open(`https://wa.me/+263782048523?text=${msg}`, "_blank", "noopener,noreferrer");
                };

                return (
                  <button
                    type="button"
                    onClick={dispatch}
                    disabled={!isFormValid}
                    aria-disabled={!isFormValid}
                    className={`group mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-semibold transition-all ${
                      isFormValid
                        ? "premium-button hover:scale-[1.01]"
                        : "bg-muted/20 text-muted-foreground/40 cursor-not-allowed border border-border/50"
                    }`}
                  >
                    <span>Initiate Transaction</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------- Small helpers ---------- */

function Field({
  label,
  icon,
  value,
  placeholder,
  onChange,
  type = "text",
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70 block mb-1.5">
        {label}
      </label>
      <div className="flex items-center rounded-xl border border-border bg-background/40 px-3 py-2.5 focus-within:border-primary-glow/50 transition-colors">
        {icon}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm text-foreground outline-none border-none p-0"
        />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  uppercase,
  capitalize,
}: {
  label: string;
  value: string;
  mono?: boolean;
  uppercase?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="flex justify-between items-center text-muted-foreground">
      <span>{label}</span>
      <span
        className={[
          "text-foreground font-semibold",
          mono ? "font-mono" : "",
          uppercase ? "uppercase" : "",
          capitalize ? "capitalize" : "",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

function CopyChip({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* noop */
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-md bg-black/40 px-2 py-1 font-mono text-[11px] text-white hover:bg-black/60 transition-colors"
    >
      {label ?? value}
      {copied ? (
        <Check className="h-3 w-3 text-emerald-400" />
      ) : (
        <Copy className="h-3 w-3 text-muted-foreground" />
      )}
    </button>
  );
}

function MobileDepositInstructions({
  method,
  showQrStep,
}: {
  method: "ecocash" | "innbucks";
  showQrStep: boolean;
}) {
  const ECOCASH_CODE = "*153*2*2*002905#";
  return (
    <ol className="space-y-3 text-amber-100/90 list-decimal pl-3.5">
      {method === "ecocash" ? (
        <li>
          <span className="font-semibold text-white">DIAL MERCHANT CODE</span>{" "}
          to pay our desk:
          <div className="mt-1.5 flex items-center gap-2">
            <CopyChip value={ECOCASH_CODE} />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/70">
              Tap to copy
            </span>
          </div>
          <p className="text-[11px] mt-1.5 text-amber-100/80">
            EcoCash → Merchant Payment → paste the code → enter amount → confirm.
          </p>
        </li>
      ) : (
        <li>
          <span className="font-semibold text-white">SEND FUNDS</span> via
          InnBucks to:
          <div className="mt-1.5 grid gap-1 rounded-lg bg-black/40 p-2 font-mono text-[11px] text-white">
            <span>Number: 0784293089</span>
            <span>Name: Paradise Mnqobi Sibanda</span>
          </div>
        </li>
      )}
      <li>
        <span className="font-semibold text-white">SCREENSHOT</span> the
        successful transaction.
      </li>
      {showQrStep && (
        <li>
          <span className="font-semibold text-white">BINANCE QR:</span> save a
          screenshot of your Binance deposit QR code.
        </li>
      )}
      <li>
        <span className="font-semibold text-white">SEND</span> all screenshots
        on WhatsApp when redirected.
      </li>
    </ol>
  );
}

function FnbDepositInstructions() {
  const [account, setAccount] = useState<"maz" | "paradise">("maz");
  const accounts = {
    maz: {
      label: "MAZ FX (PVT) LTD",
      name: "MAZ FX (PVT) LTD",
      number: "63051409861",
      type: "FNB Business Account",
    },
    paradise: {
      label: "Paradise M. Sibanda",
      name: "Paradise Mnqobi Sibanda",
      number: "63135912673",
      type: "FNB Personal Account",
    },
  } as const;
  const chosen = accounts[account];

  return (
    <div className="space-y-3 text-amber-100/90">
      <p>
        Choose which FNB account to deposit into and follow the steps. Enter
        the banking details carefully.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(accounts) as Array<keyof typeof accounts>).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setAccount(k)}
            className={`rounded-xl border px-3 py-2 text-[11px] font-semibold transition-all ${
              account === k
                ? "border-primary-glow bg-primary-glow/[0.12] text-white shadow-[0_0_18px_rgba(139,92,246,0.25)]"
                : "border-border/60 bg-background/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            {accounts[k].label}
          </button>
        ))}
      </div>

      <ol className="space-y-3 list-decimal pl-3.5">
        <li>
          <span className="font-semibold text-white">Log in</span> to your FNB
          App or online banking portal.
        </li>
        <li>
          <span className="font-semibold text-white">Make a payment</span> to:
          <div className="mt-1.5 grid gap-1 rounded-lg bg-black/40 p-2 font-mono text-[11px] text-white">
            <span>Account Name: {chosen.name}</span>
            <span className="flex items-center gap-2">
              Account Number:
              <CopyChip value={chosen.number} />
            </span>
            <span>Account Type: {chosen.type}</span>
          </div>
        </li>
        <li>
          <span className="font-semibold text-white">Reference:</span> use your
          Full Name or Trading ID.
        </li>
        <li>
          <span className="font-semibold text-white">Capture proof:</span>{" "}
          screenshot the successful transaction or save the PDF receipt.
        </li>
        <li>
          <span className="font-semibold text-white">Verification:</span> upload
          your Proof of Payment on WhatsApp once redirected.
        </li>
      </ol>
      <p className="mt-2 rounded-lg bg-amber-500/15 border border-amber-400/40 p-2 text-white">
        IMPORTANT: don't forget to attach your proof of payment image and QR
        code screenshot once redirected to WhatsApp.
      </p>
    </div>
  );
}
