import { useEffect, useState, type ComponentProps, type ReactNode } from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  EyeOffIcon,
  LockIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"

import { BankMark } from "@/components/bank-mark"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { banks, type Bank, type BankConnection } from "@/lib/banks"
import { cn } from "@/lib/utils"

const navIcon = "/assets/nav-icon.svg"

/** How long the fake handshake with the bank appears to take. */
const CONNECTING_MS = 2200

type Stage =
  | "intro"
  | "institution"
  | "credentials"
  | "connecting"
  | "accounts"
  | "success"

/** The stage each one steps back to; absent means the back arrow is hidden. */
const previous: Partial<Record<Stage, Stage>> = {
  institution: "intro",
  credentials: "institution",
}

/**
 * A stand-in for Plaid Link, so the connection step can be walked through in
 * the prototype. It authenticates nothing — any credentials are accepted and
 * the institutions are invented — but it keeps the shape of the real flow:
 * consent, pick a bank, sign in, wait, choose accounts, done.
 *
 * It is deliberately styled as someone else's product rather than in the Nav
 * type ramp: the handoff to a third party is part of what is being tested.
 */
export function PlaidLinkDialog({
  open,
  onOpenChange,
  onComplete,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (connection: BankConnection) => void
}) {
  const [stage, setStage] = useState<Stage>("intro")
  const [bank, setBank] = useState<Bank | null>(null)
  const [selected, setSelected] = useState<string[]>([])

  // Reopening starts a fresh connection rather than resuming a half-finished
  // one, which is what Link does when it is dismissed.
  useEffect(() => {
    if (open) return
    const reset = window.setTimeout(() => {
      setStage("intro")
      setBank(null)
      setSelected([])
    }, 200)
    return () => window.clearTimeout(reset)
  }, [open])

  useEffect(() => {
    if (stage !== "connecting") return
    const advance = window.setTimeout(() => setStage("accounts"), CONNECTING_MS)
    return () => window.clearTimeout(advance)
  }, [stage])

  const back = previous[stage]

  function complete() {
    if (!bank) return
    onComplete({
      bank,
      accounts: bank.accounts.filter((account) =>
        selected.includes(account.id)
      ),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[620px] max-h-[calc(100svh-2rem)] w-[400px] flex-col gap-0 overflow-hidden rounded-lg p-0 ring-black/10 sm:max-w-[400px]"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-3">
          {back ? (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setStage(back)}
            >
              <ChevronLeftIcon />
              <span className="sr-only">Back</span>
            </Button>
          ) : (
            <span className="size-7" />
          )}

          <span className="text-sm font-medium text-foreground">
            {stage === "intro" ? "" : bank?.name}
          </span>

          <DialogClose render={<Button variant="ghost" size="icon-sm" />}>
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        {/* Keyed so each stage mounts fresh and replays its entrance. */}
        <div
          key={stage}
          className="flex min-h-0 flex-1 animate-in flex-col duration-300 ease-out fade-in slide-in-from-right-3 motion-reduce:animate-none"
        >
          {stage === "intro" && (
            <IntroStage onContinue={() => setStage("institution")} />
          )}

          {stage === "institution" && (
            <InstitutionStage
              onSelect={(next) => {
                setBank(next)
                setSelected(next.accounts.map((account) => account.id))
                setStage("credentials")
              }}
            />
          )}

          {stage === "credentials" && bank && (
            <CredentialsStage
              bank={bank}
              onSubmit={() => setStage("connecting")}
            />
          )}

          {stage === "connecting" && bank && <ConnectingStage bank={bank} />}

          {stage === "accounts" && bank && (
            <AccountsStage
              bank={bank}
              selected={selected}
              onToggle={(id) =>
                setSelected((current) =>
                  current.includes(id)
                    ? current.filter((each) => each !== id)
                    : [...current, id]
                )
              }
              onContinue={() => setStage("success")}
            />
          )}

          {stage === "success" && bank && (
            <SuccessStage
              bank={bank}
              count={selected.length}
              onDone={complete}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Body and action area share one column so every stage sits the same way. */
function Stage({
  children,
  action,
}: {
  children: ReactNode
  action: ReactNode
}) {
  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">{children}</div>
      {action ? <div className="shrink-0 px-6 pt-2 pb-6">{action}</div> : null}
    </>
  )
}

function PrimaryAction({ children, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      className="h-12 w-full rounded-md bg-foreground text-sm font-semibold text-background hover:bg-foreground/90"
      {...props}
    >
      {children}
    </Button>
  )
}

/** A stand-in for the Plaid logo: four blades set around an empty centre. */
function PlaidMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-6", className)}>
      <path
        fill="currentColor"
        d="M12 2.2 8.6 5.6 12 9l3.4-3.4zM5.6 8.6 2.2 12l3.4 3.4L9 12zm12.8 0L15 12l3.4 3.4L21.8 12zM12 15l-3.4 3.4L12 21.8l3.4-3.4z"
      />
    </svg>
  )
}

function IntroStage({ onContinue }: { onContinue: () => void }) {
  return (
    <Stage
      action={
        <div className="flex flex-col gap-4">
          <p className="text-center text-xs text-muted-foreground">
            By selecting Continue you agree to the Plaid{" "}
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="underline underline-offset-2"
            >
              End User Privacy Policy
            </a>
            .
          </p>
          <PrimaryAction onClick={onContinue}>Continue</PrimaryAction>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-6 pt-4">
        <div className="flex items-center gap-3">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-surface">
            <img src={navIcon} alt="" className="size-6" />
          </span>
          <span className="flex gap-1" aria-hidden>
            {[0, 1, 2].map((dot) => (
              <span key={dot} className="size-1 rounded-full bg-outline" />
            ))}
          </span>
          <span className="flex size-14 items-center justify-center rounded-2xl bg-foreground text-background">
            <PlaidMark />
          </span>
        </div>

        <div className="flex flex-col gap-2 text-center">
          <DialogTitle className="text-xl leading-7 font-semibold text-balance">
            Nav uses Plaid to connect your bank
          </DialogTitle>
          <DialogDescription className="text-sm">
            Connecting takes about a minute.
          </DialogDescription>
        </div>

        <ul className="flex w-full flex-col gap-5 pt-2">
          {[
            {
              icon: LockIcon,
              title: "Secure",
              copy: "Your data is encrypted end to end and sent over a private connection.",
            },
            {
              icon: EyeOffIcon,
              title: "Private",
              copy: "Your credentials are never shared with Nav or stored by them.",
            },
          ].map(({ icon: Icon, title, copy }) => (
            <li key={title} className="flex gap-3">
              <Icon className="mt-0.5 size-5 shrink-0 text-foreground" />
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-sm text-muted-foreground">{copy}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Stage>
  )
}

function InstitutionStage({ onSelect }: { onSelect: (bank: Bank) => void }) {
  const [query, setQuery] = useState("")
  const matches = banks.filter((bank) =>
    bank.name.toLowerCase().includes(query.trim().toLowerCase())
  )

  return (
    <Stage action={null}>
      <div className="flex flex-col gap-4">
        <DialogTitle className="text-xl leading-7 font-semibold">
          Select your bank
        </DialogTitle>

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for your bank"
            aria-label="Search for your bank"
            className="h-11 rounded-md pl-9 text-sm"
          />
        </div>

        {matches.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No banks match &ldquo;{query.trim()}&rdquo;.
          </p>
        ) : (
          <ul className="flex flex-col">
            {matches.map((bank) => (
              <li key={bank.id}>
                <button
                  type="button"
                  onClick={() => onSelect(bank)}
                  className="flex w-full items-center gap-3 rounded-md px-2 py-3 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                >
                  <BankMark bank={bank} />
                  <span className="flex-1 text-sm font-medium text-foreground">
                    {bank.name}
                  </span>
                  <ChevronRightIcon className="size-4 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Stage>
  )
}

function CredentialsStage({
  bank,
  onSubmit,
}: {
  bank: Bank
  onSubmit: () => void
}) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const ready = username.trim() !== "" && password.trim() !== ""

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(e) => {
        e.preventDefault()
        if (ready) onSubmit()
      }}
    >
      <Stage
        action={
          <div className="flex flex-col gap-4">
            <p className="text-center text-xs text-muted-foreground">
              By submitting you authorize Plaid to retrieve your account data.
              Any credentials work here — nothing is sent anywhere.
            </p>
            <PrimaryAction type="submit" disabled={!ready}>
              Submit
            </PrimaryAction>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <BankMark bank={bank} className="size-14 rounded-2xl" />
            <DialogTitle className="text-xl leading-7 font-semibold">
              Enter your {bank.name} credentials
            </DialogTitle>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plaid-username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="plaid-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                className="h-11 rounded-md text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plaid-password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="plaid-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
                className="h-11 rounded-md text-sm"
              />
            </div>
          </div>
        </div>
      </Stage>
    </form>
  )
}

function ConnectingStage({ bank }: { bank: Bank }) {
  return (
    <Stage action={null}>
      <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
        <span className="relative flex size-14 items-center justify-center">
          <BankMark bank={bank} className="size-14 rounded-2xl" />
          <span className="absolute -inset-3 rounded-full border-2 border-foreground/10 border-t-foreground/60 motion-safe:animate-spin" />
        </span>
        <div className="flex flex-col gap-1">
          <DialogTitle className="text-lg font-semibold">
            Connecting to {bank.name}
          </DialogTitle>
          <DialogDescription className="text-sm">
            This usually takes a few seconds.
          </DialogDescription>
        </div>
      </div>
    </Stage>
  )
}

function AccountsStage({
  bank,
  selected,
  onToggle,
  onContinue,
}: {
  bank: Bank
  selected: string[]
  onToggle: (id: string) => void
  onContinue: () => void
}) {
  return (
    <Stage
      action={
        <PrimaryAction disabled={selected.length === 0} onClick={onContinue}>
          Continue
        </PrimaryAction>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <DialogTitle className="text-xl leading-7 font-semibold">
            Select accounts
          </DialogTitle>
          <DialogDescription className="text-sm">
            Choose which {bank.name} accounts to share with Nav.
          </DialogDescription>
        </div>

        <ul className="flex flex-col gap-2">
          {bank.accounts.map((account) => {
            const checked = selected.includes(account.id)
            return (
              <li key={account.id}>
                <Label
                  htmlFor={`account-${account.id}`}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors",
                    checked
                      ? "border-foreground/40 bg-muted/60"
                      : "border-border hover:bg-muted/40"
                  )}
                >
                  <Checkbox
                    id={`account-${account.id}`}
                    checked={checked}
                    onCheckedChange={() => onToggle(account.id)}
                  />
                  <span className="flex flex-1 flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {account.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      &bull;&bull;&bull;&bull; {account.mask}
                    </span>
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {account.balance}
                  </span>
                </Label>
              </li>
            )
          })}
        </ul>
      </div>
    </Stage>
  )
}

function SuccessStage({
  bank,
  count,
  onDone,
}: {
  bank: Bank
  count: number
  onDone: () => void
}) {
  return (
    <Stage action={<PrimaryAction onClick={onDone}>Continue</PrimaryAction>}>
      <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-success text-on-success motion-safe:animate-in motion-safe:zoom-in-50">
          <CheckIcon className="size-7" />
        </span>
        <div className="flex flex-col gap-1">
          <DialogTitle className="text-xl font-semibold">Success</DialogTitle>
          <DialogDescription className="text-sm text-balance">
            {count === 1 ? "1 account" : `${count} accounts`} at {bank.name}{" "}
            {count === 1 ? "is" : "are"} now connected to Nav.
          </DialogDescription>
        </div>
      </div>
    </Stage>
  )
}
