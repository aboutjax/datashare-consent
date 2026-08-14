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
