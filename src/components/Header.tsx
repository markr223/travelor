"use client";

import Link from "next/link";
import { Plane, Menu, X, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/flights", label: "Flights" },
  { href: "/premium", label: "Premium", premium: true },
  { href: "/hotels", label: "Hotels" },
  { href: "/destinations", label: "Destinations" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Plane className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold tracking-tight">Travelor</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                link.premium
                  ? "text-amber-500 hover:text-amber-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.premium && <Crown className="h-3.5 w-3.5" />}
              {link.label}
            </Link>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  link.premium
                    ? "text-amber-500 hover:bg-amber-500/10"
                    : "hover:bg-accent"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.premium && <Crown className="h-3.5 w-3.5" />}
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
