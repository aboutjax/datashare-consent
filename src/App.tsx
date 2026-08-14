import { ConsentCard } from "@/components/consent-card"

export function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-10 sm:px-6 lg:flex-row lg:gap-8 lg:px-8 lg:py-16">
      <div className="mx-auto w-full max-w-240">
        <ConsentCard />
      </div>
    </div>
  )
}

export default App
