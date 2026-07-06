import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NavbarProps {
  transparent?: boolean
}

export function Navbar({ transparent = false }: NavbarProps) {
  return (
    <header 
      className={cn(
        "top-0 z-50 w-full",
        transparent 
          ? "absolute bg-transparent" 
          : "sticky bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      )}
    >
      <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
        <div className="flex flex-1 items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/icon.png"
              alt="Serif"
              width={24}
              height={24}
              className={cn("h-6 w-6", transparent && "brightness-0 invert")}
            />
            <span className={cn("font-serif text-2xl font-bold tracking-tight", transparent && "text-white")}>Serif</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#" className={cn("text-sm font-medium transition-colors hover:text-primary", transparent ? "text-white/80 hover:text-white" : "text-foreground")}>
            Features
          </Link>
          <Link href="#" className={cn("text-sm font-medium transition-colors hover:text-primary", transparent ? "text-white/80 hover:text-white" : "text-foreground")}>
            Pricing
          </Link>
          <Link href="#" className={cn("text-sm font-medium transition-colors hover:text-primary", transparent ? "text-white/80 hover:text-white" : "text-foreground")}>
            Blog
          </Link>
        </nav>
        <nav className="flex flex-1 items-center justify-end gap-4">
          <Link href="/auth/login">
            <Button variant="ghost" className={cn(transparent && "text-white hover:bg-white/10 hover:text-white")}>Log in</Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button className={cn("h-9 font-medium transition-colors", transparent ? "bg-white hover:bg-white/90" : "bg-black text-white hover:bg-primary")}>
              {transparent ? (
                <span className="bg-[url('/background.jpg')] bg-fixed bg-cover bg-center bg-clip-text text-transparent">
                  Sign up
                </span>
              ) : (
                "Sign up"
              )}
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
