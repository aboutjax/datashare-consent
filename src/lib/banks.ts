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
  /** Initials shown in place of a logo we are not licensed to ship. */
  mark: string
  /** Brand tint for the mark tile. */
  tint: string
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
    mark: "CH",
    tint: "bg-[#117aca]",
    accounts: businessAccounts,
  },
  {
    id: "bank-of-america",
    name: "Bank of America",
    mark: "BA",
    tint: "bg-[#e31837]",
    accounts: businessAccounts,
  },
  {
    id: "wells-fargo",
    name: "Wells Fargo",
    mark: "WF",
    tint: "bg-[#b31b1b]",
    accounts: businessAccounts,
  },
  {
    id: "citibank",
    name: "Citibank",
    mark: "CI",
    tint: "bg-[#056dae]",
    accounts: businessAccounts,
  },
  {
    id: "capital-one",
    name: "Capital One",
    mark: "C1",
    tint: "bg-[#004977]",
    accounts: businessAccounts,
  },
  {
    id: "us-bank",
    name: "U.S. Bank",
    mark: "US",
    tint: "bg-[#0c2074]",
    accounts: businessAccounts,
  },
  {
    id: "pnc",
    name: "PNC Bank",
    mark: "PN",
    tint: "bg-[#f58025]",
    accounts: businessAccounts,
  },
  {
    id: "mercury",
    name: "Mercury",
    mark: "ME",
    tint: "bg-[#5b4bd6]",
    accounts: businessAccounts,
  },
]
