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
  Clock,
  Zap,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { Reveal } from "@/components/reveal";
import { PageBackground } from "@/components/page-background";

export const Route = createFileRoute("/withdrawal")({
  head: () => ({
    meta: [
      { title: "Withdraw Capital — ChainForge" },
      {
        name: "description",
        content:
          "Liquidate your trading profits safely. Fast withdrawals from major brokers to your local rails.",
      },
    ],
  }),
  component: WithdrawalPage,
});
type BrokerType = "weltrade" | "deriv" | "other";
type PayoutMethodType = "ecocash" | "innbucks" | "omari" | "fnb_eft";

function WithdrawalPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    whatsapp: "",
  });

  const [selectedBroker, setSelectedBroker] = useState<BrokerType>("weltrade");
  const [selectedMethod, setSelectedMethod] =
    useState<PayoutMethodType>("ecocash");
  const [amount, setAmount] = useState<string>("500");

  // Mobile-wallet payout details (Ecocash / InnBucks / Omari)
  const [walletNumber, setWalletNumber] = useState<string>("");
  const [walletName, setWalletName] = useState<string>("");

  // EFT bank payout details (FNB EFT or other South-African bank)
  const [bankName, setBankName] = useState<string>("");
  const [bankAccountName, setBankAccountName] = useState<string>("");
  const [bankAccountNumber, setBankAccountNumber] = useState<string>("");
  const [bankBranchCode, setBankBranchCode] = useState<string>("");

  const requiresWalletDetails =
    selectedMethod === "ecocash" || selectedMethod === "innbucks" || selectedMethod === "omari";
  const requiresBankDetails = selectedMethod === "fnb_eft";
  const requiresBinanceQr =
    selectedBroker === "weltrade" || selectedBroker === "other";

  const isFormValid =
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.whatsapp.trim() !== "" &&
    Number(amount) > 0 &&
    (!requiresWalletDetails ||
      (walletNumber.trim() !== "" && walletName.trim() !== "")) &&
    (!requiresBankDetails ||
      (bankName.trim() !== "" &&
        bankAccountName.trim() !== "" &&
        bankAccountNumber.trim() !== ""));

  return (
    <>
      <section className="relative">
        <PageBackground variant="soft" />
        <div className="relative mx-auto max-w-5xl px-6 pt-24 pb-12 text-center">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.25em] text-primary-glow font-['Montserrat']">
              Profit Liquidation
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="font-display mt-5 text-5xl md:text-6xl font-['Montserrat']">
              <span className="text-gradient">Withdraw</span>{" "}
              <span className="text-accent-gradient">Earnings.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-6 max-w-2xl text-muted-foreground text-sm md:text-base">
              Access your trading capital with institutional speed. We process
              your liquidation requests via the most reliable local and digital
              rails.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-8 lg:grid-cols-3 items-start">
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Identity */}
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

            {/* 2. Source Broker */}
            <div className="card-animated rounded-3xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground font-['Montserrat'] mb-6 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-glow/20 text-primary-glow text-[10px]">
                  2
                </span>
                Select Source Broker
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
                  <p className="text-[11px] leading-relaxed rounded-lg bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 px-3 py-2">
                    Type <span className="font-mono font-bold text-white">"THE FOREX MAFIA"</span> on the Deriv payment-agents withdrawal side and select us as the agent.
                  </p>
                </div>
              )}
            </div>

            {/* 3. Binance QR (Weltrade / Other) */}
            {requiresBinanceQr && (
              <div className="card-animated rounded-3xl p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground font-['Montserrat'] mb-4 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/20 text-amber-300 text-[10px]">
                    !
                  </span>
                  Send Funds to Our Binance — Scan or Copy Address
                </h3>
                <div className="grid gap-6 sm:grid-cols-[auto_1fr] items-start">
                  <div className="rounded-2xl bg-white p-3 shadow-xl w-fit shrink-0">
                    <img
                      src="/QR.png"
                      alt="Binance deposit QR code"
                      className="h-44 w-44 object-contain"
                    />
                  </div>
                  <div className="text-sm space-y-4">
                    <p>
                      On your {selectedBroker === "weltrade" ? "Weltrade" : "broker"}{" "}
                      dashboard, withdraw via Binance and scan this QR to send
                      the funds to our corporate Binance wallet.
                    </p>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70 block">
                        Wallet Address
                      </label>
                      <CopyChip value="TPvTAj6w8AZQzsnu27TsPjUMR7tNJ9CHgP" />
                      <div className="flex items-center gap-2 text-rose-500 font-bold bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 mt-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span className="text-[11px] uppercase tracking-wider">USDT TRC20 only!</span>
                      </div>
                    </div>

                    <p className="text-foreground font-semibold pt-2 border-t border-border/40">
                      Screenshot the successful transaction — you'll need to
                      attach it on WhatsApp.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Payout Method */}
            <div className="card-animated rounded-3xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground font-['Montserrat'] mb-6 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-glow/20 text-primary-glow text-[10px]">
                  3
                </span>
                Receiving Payout Method
              </h3>

              <div className="grid gap-4 sm:grid-cols-4">
                {(
                  [
                    { id: "ecocash", label: "EcoCash", logo: "/ecocash.jpg" },
                    { id: "innbucks", label: "InnBucks", logo: "/innbucks.png" },
                    { id: "omari", label: "Omari", logo: "/omari.png" }, // Added Omari here
                    { id: "fnb_eft", label: "FNB EFT", logo: "/fnb.png" },
                  ] as { id: PayoutMethodType; label: string; logo: string }[]
                ).map((method) => (
                  <button
                    key={method.id}
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
                    {selectedMethod === method.id && (
                      <CheckCircle2 className="absolute top-2 right-2 h-3.5 w-3.5 text-primary-glow" />
                    )}
                  </button>
                ))}
              </div>

              {requiresWalletDetails && (
                <div className="mt-5 pt-5 border-t border-border/50 grid gap-4 sm:grid-cols-2">
                  <Field
                    label={`${
                      selectedMethod === "ecocash"
                        ? "EcoCash"
                        : selectedMethod === "innbucks"
                        ? "InnBucks"
                        : "Omari"
                    } Number`}
                    icon={
                      <Phone className="h-4 w-4 text-muted-foreground mr-2.5" />
                    }
                    value={walletNumber}
                    placeholder="07xxxxxxxx"
                    onChange={setWalletNumber}
                  />
                  <Field
                    label="Name on Account"
                    icon={
                      <User className="h-4 w-4 text-muted-foreground mr-2.5" />
                    }
                    value={walletName}
                    placeholder="Full registered name"
                    onChange={setWalletName}
                  />
                </div>
              )}

              {requiresBankDetails && (
                <div className="mt-5 pt-5 border-t border-border/50 grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Bank Name"
                    icon={<ShieldCheck className="h-4 w-4 text-muted-foreground mr-2.5" />}
                    value={bankName}
                    placeholder="e.g. FNB, Standard Bank, ABSA"
                    onChange={setBankName}
                  />
                  <Field
                    label="Account Holder Name"
                    icon={<User className="h-4 w-4 text-muted-foreground mr-2.5" />}
                    value={bankAccountName}
                    placeholder="Full name as on account"
                    onChange={setBankAccountName}
                  />
                  <Field
                    label="Account Number"
                    icon={<Smartphone className="h-4 w-4 text-muted-foreground mr-2.5" />}
                    value={bankAccountNumber}
                    placeholder="e.g. 62512345678"
                    onChange={setBankAccountNumber}
                  />
                  <Field
                    label="Branch Code (optional)"
                    icon={<ShieldCheck className="h-4 w-4 text-muted-foreground mr-2.5" />}
                    value={bankBranchCode}
                    placeholder="Universal code accepted"
                    onChange={setBankBranchCode}
                  />
                </div>
              )}
            </div>

            {/* 5. Amount */}
            <div className="card-animated rounded-3xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground font-['Montserrat'] mb-4">
                Withdrawal Amount
              </h3>
              <div className="relative flex items-center rounded-xl border border-border bg-background/50 focus-within:border-primary-glow/60 transition-colors px-4 py-2.5">
                <span className="text-sm font-medium text-muted-foreground mr-1.5">
                  $
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent text-base font-semibold text-foreground outline-none border-none p-0"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Right summary */}
          <div className="space-y-6 lg:sticky lg:top-36">
            <div className="card-animated rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground font-['Montserrat']">
                  Request Summary
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-emerald-500 uppercase">
                  <ShieldCheck className="h-3.5 w-3.5" /> Secure Desk
                </div>
              </div>

              {(() => {
                const grossAmt = Number(amount || 0);
                const feePct = grossAmt >= 1000 ? 0.05 : 0;
                const wFee = +(grossAmt * feePct).toFixed(2);
                const netPayout = +(grossAmt - wFee).toFixed(2);
                return (
                  <>
                    <div className="space-y-3.5 text-xs border-b border-border/60 pb-5">
                      <Row label="Source Broker" value={selectedBroker} capitalize />
                      <Row
                        label="Payout Via"
                        value={selectedMethod.replace("_", " ")}
                        uppercase
                      />
                      <Row
                        label="Gross Withdraw"
                        value={`$${grossAmt.toLocaleString()}.00`}
                        mono
                      />
                      {feePct > 0 && (
                        <div className="flex justify-between items-center text-muted-foreground">
                          <span>Desk Fee (5% · $1k+)</span>
                          <span className="font-mono text-rose-400">- ${wFee.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" /> ETA
                        </span>
                        <span className="font-mono text-foreground">~15 min</span>
                      </div>
                      <div className="pt-3 flex justify-between items-baseline">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                          Net Payout
                        </span>
                        <span className="text-xl font-bold tracking-tight text-primary-glow font-mono">
                          ${netPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Flashing protocol */}
                    <div className="mt-5 p-4 rounded-2xl protocol-flash text-xs">
                      <p className="text-[10px] font-bold uppercase tracking-wider font-['Montserrat'] mb-3 flex items-center gap-1.5 protocol-flash-title">
                        <Zap className="h-3.5 w-3.5" />
                        Withdrawal Instructions
                      </p>
                      {selectedBroker === "deriv" ? (
                        <DerivWithdrawalProtocol />
                      ) : (
                        <StandardWithdrawalProtocol />
                      )}
                    </div>

                    {(() => {
                      const walletLine = requiresWalletDetails
                        ? `*Wallet Number:* ${walletNumber}\n*Name on Account:* ${walletName}\n`
                        : "";
                      const bankLine = requiresBankDetails
                        ? `*Bank:* ${bankName}\n*Account Holder:* ${bankAccountName}\n*Account #:* ${bankAccountNumber}\n${bankBranchCode ? `*Branch Code:* ${bankBranchCode}\n` : ""}`
                        : "";
                      const reminder =
                        selectedBroker === "deriv"
                          ? `*Reminder:* attach your Deriv withdrawal POP screenshot.`
                          : `*Reminder:* attach (1) proof of your Binance transfer to our wallet.`;
                      const feeLine =
                        feePct > 0
                          ? `*Desk Fee (5%):* -$${wFee.toFixed(2)}\n*Net Payout:* $${netPayout.toFixed(2)}\n`
                          : "";

                      const buildMsg = () =>
                        encodeURIComponent(
                          `*NEW WITHDRAWAL REQUEST — ChainForge*\n` +
                            `─────────────────────\n` +
                            `*Client:* ${formData.firstName} ${formData.lastName}\n` +
                            `*Email:* ${formData.email}\n` +
                            `*WhatsApp:* ${formData.whatsapp}\n` +
                            `─────────────────────\n` +
                            `*Source Broker:* ${selectedBroker.toUpperCase()}\n` +
                            `*Payout Method:* ${selectedMethod
                              .replace("_", " ")
                              .toUpperCase()}\n` +
                            walletLine +
                            bankLine +
                            `*Amount:* $${grossAmt.toLocaleString()}\n` +
                            feeLine +
                            `─────────────────────\n` +
                            reminder,
                        );

                      const dispatch = () => {
                        if (!isFormValid) return;
                        const msg = buildMsg();
                        
                        // Conditional WhatsApp routing based on the selected broker
                        const targetNumber = (selectedBroker === "weltrade" || selectedBroker === "other") 
                          ? "+263784293089" 
                          : "+263782048523";

                        window.open(`https://wa.me/${targetNumber}?text=${msg}`, "_blank", "noopener,noreferrer");
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
                          <span>Request Liquidation</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      );
                    })()}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------- helpers ---------- */

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
      className="inline-flex items-center gap-1.5 rounded-md bg-black/40 px-2 py-1 font-mono text-[11px] text-white hover:bg-black/60 transition-colors w-full justify-between sm:w-auto"
    >
      <span className="truncate">{label ?? value}</span>
      {copied ? (
        <Check className="h-3 w-3 text-emerald-400 shrink-0" />
      ) : (
        <Copy className="h-3 w-3 text-muted-foreground shrink-0" />
      )}
    </button>
  );
}

function StandardWithdrawalProtocol() {
  return (
    <div className="space-y-3 text-amber-100/90">
      <p>To receive your funds from the academy, please follow this process:</p>
      <ol className="space-y-3 list-decimal pl-3.5">
        <li>
          <span className="font-semibold text-white">Request Withdrawal</span> —
          initiate the withdrawal through your member dashboard.
        </li>
        <li>
          <span className="font-semibold text-white">Provide Destination Details</span>{" "}
          — ensure banking details (Account Name, Number, Bank) are saved
          correctly in your profile.
        </li>
        <li>
          <span className="font-semibold text-white">Wait for Processing</span>{" "}
          — our team transfers the funds from:
          <div className="mt-1.5 grid gap-2 rounded-lg bg-black/40 p-2 text-[11px] text-white">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
              <span className="text-muted-foreground">Company Name:</span>
              <CopyChip value="MAZ FX (PVT) LTD" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
              <span className="text-muted-foreground">Account Number:</span>
              <CopyChip value="63051409861" />
            </div>
          </div>
        </li>
        <li>
          <span className="font-semibold text-white">Confirm Receipt</span> —
          once the status is "Complete", check your banking app for the balance.
        </li>
        <li>
          <span className="font-semibold text-white">Record Keeping</span> —
          screenshot the incoming transaction for your records.
        </li>
      </ol>
      <p className="mt-2 rounded-lg bg-amber-500/15 border border-amber-400/40 p-2 text-white">
        IMPORTANT: don't forget to attach your proof of transfer image once
        redirected to WhatsApp.
      </p>
    </div>
  );
}

function DerivWithdrawalProtocol() {
  return (
    <div className="space-y-3 text-amber-100/90">
      <p className="font-semibold text-white">Deriv Withdrawal Process</p>
      <p>To withdraw from Deriv, please follow these steps:</p>
      <ol className="space-y-3 list-decimal pl-3.5">
        <li>
          <span className="font-semibold text-white">Step 1:</span> log in to
          your Deriv account and initiate a withdrawal to:
          <div className="mt-1.5 flex items-center gap-2">
            <CopyChip value="The Forex Mafia" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/70">
              Tap to copy agent
            </span>
          </div>
        </li>
        <li>
          <span className="font-semibold text-white">Step 2:</span> once the
          withdrawal to the agent is complete, screenshot the confirmation as
          your Proof of Payment (POP).
        </li>
        <li>
          <span className="font-semibold text-white">Step 3:</span> upload the
          POP when redirected to WhatsApp, enter your Deriv CR number, and
          select how you want to receive your funds.
        </li>
      </ol>
      <p className="mt-2 rounded-lg bg-amber-500/15 border border-amber-400/40 p-2 text-white">
        IMPORTANT: don't forget to attach your Deriv POP screenshot once
        redirected to WhatsApp.
      </p>
    </div>
  );
}