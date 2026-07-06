import { SignUpForm } from '@/components/sign-up-form'
import { Navbar } from '@/components/navbar'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <SignUpForm />
        </div>
      </main>
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:h-24 md:flex-row md:px-6">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <span className="font-serif text-lg font-bold">Serif</span>
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              © {new Date().getFullYear()} Serif. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
