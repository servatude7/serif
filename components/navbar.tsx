import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Menu } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

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
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/icon.png"
              alt="Serif"
              width={24}
              height={24}
              className={cn("h-6 w-6", transparent && "brightness-0 invert")}
            />
            <span className={cn("font-serif text-xl sm:text-2xl font-bold tracking-tight", transparent && "text-white")}>Serif</span>
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
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link href="/auth/login" className="hidden sm:inline-flex">
            <Button variant="ghost" className={cn("h-9 px-3 sm:px-4", transparent && "text-white hover:bg-white/10 hover:text-white")}>Log in</Button>
          </Link>
          <Link href="/auth/sign-up" className="hidden sm:inline-flex">
            <Button className={cn("h-9 px-3 sm:px-4 font-medium transition-colors", transparent ? "bg-white hover:bg-white/90 text-black" : "bg-black text-white hover:bg-primary")}>
              Sign up
            </Button>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={cn("md:hidden", transparent && "text-white hover:bg-white/10 hover:text-white")}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[350px] pr-0 sm:pr-6">
              <SheetHeader className="px-6 sm:px-0 mt-2">
                <SheetTitle className="text-left font-serif text-2xl font-bold tracking-tight">Serif</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 mt-8 px-6 sm:px-0">
                <div className="flex flex-col space-y-4">
                  <Link href="#" className="text-lg font-medium transition-colors hover:text-primary text-muted-foreground hover:text-foreground">
                    Features
                  </Link>
                  <Link href="#" className="text-lg font-medium transition-colors hover:text-primary text-muted-foreground hover:text-foreground">
                    Pricing
                  </Link>
                  <Link href="#" className="text-lg font-medium transition-colors hover:text-primary text-muted-foreground hover:text-foreground">
                    Blog
                  </Link>
                </div>
                
                <div className="h-px bg-border w-full" />
                
                <div className="flex flex-col gap-3 w-full pr-6 sm:pr-0">
                  <Link href="/auth/login" className="w-full">
                    <Button variant="outline" className="w-full h-12 text-base justify-center font-medium">Log in</Button>
                  </Link>
                  <Link href="/auth/sign-up" className="w-full">
                    <Button className="w-full h-12 text-base justify-center font-medium bg-black text-white hover:bg-black/90">Sign up</Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  )
}
