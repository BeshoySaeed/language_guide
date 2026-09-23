import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="grid min-h-screen place-items-center bg-background px-5 text-foreground">
      <section className="max-w-md text-center"><p className="text-sm font-bold text-progress">Page not found</p><h1 className="font-display mt-2 text-4xl font-bold tracking-[-0.05em]">This lesson isn’t on the path.</h1><p className="mt-3 text-muted-foreground">Return to your dashboard and continue from the next recommended activity.</p><Button asChild className="mt-6 h-11 rounded-xl"><Link href="/">Go to dashboard</Link></Button></section>
    </main>
  );
}
