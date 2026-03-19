import Link from "next/link";
import { MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <MapPin className="h-16 w-16 text-muted-foreground mb-6" />
      <h1 className="text-4xl font-bold mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist. It may have been moved or
        the URL might be incorrect.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium h-9 px-4 hover:bg-primary/80 transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-background text-sm font-medium h-9 px-4 hover:bg-muted transition-colors"
        >
          Search Hotels
        </Link>
      </div>
    </div>
  );
}
