import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

/**
 * The full legal disclosure behind the consent checkbox's underlined link.
 * Opens as a modal so the reader can read it without leaving the step, and
 * closes without side effects — reading it does not check the box.
 */
export function ConsentDisclosureDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[calc(100svh-2rem)] flex-col gap-0 overflow-hidden rounded-[12px] bg-surface-container p-0 ring-black/10 md:min-w-200"
      >
        {/* Close on the left, title centered — the way the design reads the
            header as a single bar rather than a title with a control tacked
            onto its corner. */}
        <div className="relative flex h-18 shrink-0 items-center border-b border-border px-4">
          <DialogClose
            render={
              <Button
                variant="ghost"
                className="absolute left-4 size-12 text-on-surface-variant [&_svg]:size-6"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogClose>
          <DialogTitle className="w-full text-center type-title-3 text-foreground">
            Consent to share data with Parafin
          </DialogTitle>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-8 py-4">
          <div className="flex flex-col gap-4 py-4">
            <p className="type-caption-1 text-balance text-on-surface-variant">
              Nav Technologies, Inc. (&ldquo;Nav&rdquo;) works with Parafin,
              Inc. (&ldquo;Parafin&rdquo;), a service provider that performs
              eligibility evaluation on Nav&rsquo;s behalf, to provide the Nav
              Credit Builder Card. By enabling bank data sharing, you authorize
              Nav to share information from the bank accounts you have
              connected, including your Plaid access token, with Parafin so that
              Parafin can evaluate your eligibility for the Nav Credit Builder
              Card.
            </p>

            <DisclosureSection label="Information shared.">
              The information shared may include account details (such as
              account type, account holder name, and account numbers in masked
              form), balances, and transaction history from the accounts you
              have connected. This includes your Plaid access token &mdash; a
              credential that allows ongoing access to your connected bank
              account data. Nav treats this token as sensitive personal
              information under California law. Parafin uses this information to
              verify your identity, assess your eligibility, and provide and
              maintain the Nav Credit Builder Card.
            </DisclosureSection>

            <DisclosureSection label="How your information is used.">
              Parafin will use the information it receives in accordance with
              its Privacy Policy and Terms of Service. Under our agreement with
              Parafin, Parafin may use your information only to verify your
              identity, assess your eligibility, and provide and maintain the
              Nav Credit Builder Card &mdash; and may not use it for
              Parafin&rsquo;s own independent business purposes. Parafin may
              retain this information as required to provide its services and to
              comply with applicable legal, regulatory, and recordkeeping
              obligations. Nav shares this information under the terms of its
              agreement with Parafin and its own Privacy Policy. You have the
              right to know what personal information Nav has collected about
              you, to request access to or deletion of that information, to
              correct inaccurate information, and to not be discriminated
              against for exercising these rights. To exercise these rights, see{" "}
              <PrivacyLink />.
            </DisclosureSection>

            <DisclosureSection label="Your choices.">
              Bank data sharing is optional. You may turn off sharing at any
              time before you activate a Nav Credit Builder Card by visiting
              your Account settings. If you turn off sharing before activation,
              Parafin will stop receiving new information from your connected
              accounts, though information already shared may be retained as
              described above. After you activate a card, continued sharing may
              be necessary to maintain the product, and different terms may
              apply.
            </DisclosureSection>

            <DisclosureSection label="Authorization.">
              By clicking &ldquo;Share my data and check my eligibility,&rdquo;
              you confirm that you have read and understood this disclosure and
              that you authorize the sharing of access to your connected bank
              account data, including your Plaid access token, with Parafin for
              the purposes described above. You represent that you are
              authorized to share information about the connected accounts.
            </DisclosureSection>

            <p className="type-caption-1 text-balance text-on-surface-variant">
              This authorization is governed by the Nav Terms of Service, the
              Nav Privacy Policy, and Parafin&rsquo;s Terms of Service and
              Privacy Policy. For more information about how your data is
              handled, see <PrivacyLink />.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 justify-end border-t border-border p-4">
          <DialogClose
            render={
              <Button className="h-12 rounded-[6px] brand-sheen px-4 type-body-1-emphasized shadow-brand-raised hover:bg-primary hover:brightness-105" />
            }
          >
            I understand
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** A bold lead-in followed by the body it introduces, the way a legal
 *  disclosure uses a label to say what each paragraph is about before it
 *  says it. */
function DisclosureSection({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <p className="type-caption-1 text-balance text-on-surface-variant">
      <span className="font-bold">{label}</span>
      {children}
    </p>
  )
}

/** The privacy policy link, kept as one element so both occurrences read the
 *  same. */
function PrivacyLink() {
  return (
    <a
      href="https://nav.com/privacy"
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-2"
    >
      nav.com/privacy
    </a>
  )
}
