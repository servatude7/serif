import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <Navbar />
      
      <main className="flex-1">
        <section className="w-full py-24 md:py-32 lg:py-48 xl:py-56">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4 max-w-3xl">
                <h1 className="font-serif text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Where ideas take shape.
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-2xl/relaxed">
                  Serif is a modern publishing platform for thinkers, writers, and creators. 
                  Share your stories with a beautiful, distraction-free reading experience.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 min-w-[200px] sm:min-w-0">
                <Link href="/auth/sign-up">
                  <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                    Start writing
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8">
                    Read stories
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Distraction-free</h3>
                <p className="text-muted-foreground">
                  A clean, minimalist editor that lets you focus entirely on your words and thoughts.
                </p>
              </div>
              <div className="flex flex-col space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Built for readers</h3>
                <p className="text-muted-foreground">
                  Typography and layout designed to provide the best reading experience across all devices.
                </p>
              </div>
              <div className="flex flex-col space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Fast & performant</h3>
                <p className="text-muted-foreground">
                  Lightning-fast page loads ensure your audience never has to wait to read your content.
                </p>
              </div>
            </div>
          </div>
        </section>
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
  );
}
