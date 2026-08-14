import { DialRoot } from "dialkit"
import "dialkit/styles.css"

import { ConsentCard } from "@/components/consent-card"

export function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-10 sm:px-6 lg:flex-row lg:gap-8 lg:px-8 lg:py-16">
      <div className="mx-auto w-full max-w-240">
        <ConsentCard />
      </div>

      {/* Renders nothing in a production build unless asked to, so the tuning
          panel can live in the tree rather than behind a flag. */}
      <DialRoot position="top-right" />
    </div>
  )
}

export default App
