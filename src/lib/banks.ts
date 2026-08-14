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
  /** Institution logo, drawn into the rounded tile that stands next to the name. */
  logo: string
  /**
   * Marks that ship with their own brand-coloured field fill the tile edge to
   * edge; marks that ship transparent sit inset on a white plate instead.
   */
  logoFit: "cover" | "contain"
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

export const banks: Bank[] = [
  {
    id: "chase",
    name: "Chase",
    logo: "/assets/banks/chase.png",
    logoFit: "cover",
    accounts: businessAccounts,
  },
  {
    id: "td-bank",
    name: "TD Bank",
    logo: "/assets/banks/td-bank.png",
    logoFit: "cover",
    accounts: businessAccounts,
  },
  {
    id: "wells-fargo",
    name: "Wells Fargo",
    logo: "/assets/banks/wells-fargo.png",
    logoFit: "cover",
    accounts: businessAccounts,
  },
  {
    id: "citibank",
    name: "Citibank",
    logo: "/assets/banks/citibank.png",
    logoFit: "contain",
    accounts: businessAccounts,
  },
  {
    id: "capital-one",
    name: "Capital One",
    logo: "/assets/banks/capital-one.png",
    logoFit: "contain",
    accounts: businessAccounts,
  },
]
