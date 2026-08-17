/**
 * Stand-in data for the fake Plaid connection. Nothing here talks to a bank:
 * the institutions, balances and masks are invented so the flow can be walked
 * through end to end in a prototype.
 */

export type BankAccount = {
  id: string
  name: string
  mask: string
  balance: string
}

export type Bank = {
  id: string
  name: string
  /**
   * Institution logo, drawn into the rounded tile that stands next to the
   * name. Every mark is a square that carries its own brand-coloured field,
   * so the tiles all hold the same weight down the list.
   */
  logo: string
  accounts: BankAccount[]
}

/** What the user walked away with: the institution and the accounts shared. */
export type BankConnection = {
  bank: Bank
  accounts: BankAccount[]
}

const businessAccounts: BankAccount[] = [
  {
    id: "checking",
    name: "Business Checking",
    mask: "4821",
    balance: "$18,240.65",
  },
  {
    id: "savings",
    name: "Business Savings",
    mask: "9014",
    balance: "$42,100.00",
  },
  {
    id: "card",
    name: "Business Credit Card",
    mask: "3376",
    balance: "-$2,318.44",
  },
]

/**
 * What the flow shows connected when a reader lands past `connect` without
 * actually walking Plaid — a deep link straight to `consent` or
 * `reviewing`, or the step jumped from the dev dial. That step is
 * skippable, so this is what fills the gap it leaves rather than the card
 * showing a step that talks about a connection nobody made.
 *
 * All of the matched bank's accounts, not a subset: the point is a stand-in
 * that looks like a finished connection, not a choice for the reader to
 * revisit.
 */
export function defaultConnection(bankId?: string | null): BankConnection {
  const bank = banks.find((each) => each.id === bankId) ?? banks[0]
  return { bank, accounts: bank.accounts }
}

export const banks: Bank[] = [
  {
    id: "chase",
    name: "Chase",
    logo: "/assets/banks/chase.png",
    accounts: businessAccounts,
  },
  {
    id: "td-bank",
    name: "TD Bank",
    logo: "/assets/banks/td-bank.png",
    accounts: businessAccounts,
  },
  {
    id: "wells-fargo",
    name: "Wells Fargo",
    logo: "/assets/banks/wells-fargo.png",
    accounts: businessAccounts,
  },
  {
    id: "citibank",
    name: "Citibank",
    logo: "/assets/banks/citibank.png",
    accounts: businessAccounts,
  },
  {
    id: "capital-one",
    name: "Capital One",
    logo: "/assets/banks/capital-one.png",
    accounts: businessAccounts,
  },
]
