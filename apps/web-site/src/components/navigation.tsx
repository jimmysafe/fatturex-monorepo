"use client";

import { useState } from "react";

import { Button } from "@repo/ui/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@repo/ui/components/ui/navigation-menu";
import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";

import { getAppUrl } from "@/lib/app-url";
import { container } from "@/lib/container";

import { Logo } from "./common/logo";

const ITEMS = [
  { label: "Funzionalità", href: "#flow" },
  { label: "Prezzi", href: "#pricing" },
  // { label: "FAQ", href: "#faq" },
];

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="sticky top-6 z-10 px-4">
      <section className={cn("rounded-lg border border-gray-100 bg-card shadow-fade", container)}>
        <div className="flex items-center justify-between py-3 lg:px-6">
          <Logo iconOnly={false} />

          <div className="flex items-center gap-6">
            {/* Desktop Navigation */}
            <NavigationMenu className="max-lg:hidden">
              <NavigationMenuList>
                {ITEMS.map(link =>
                  (
                    <NavigationMenuItem key={link.label} className="">
                      <a
                        href={link.href}
                        className={cn(
                          "relative bg-transparent px-1.5 text-sm font-medium text-muted-foreground",
                        )}
                      >
                        {link.label}
                      </a>
                    </NavigationMenuItem>
                  ),
                )}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Auth Buttons */}
            <div className="flex items-center gap-2.5">
              <Link href={getAppUrl()} className="max-lg:hidden">
                <Button>
                  <span className="relative z-10">Inizia Ora</span>
                </Button>
              </Link>

              {/* Hamburger Menu Button (Mobile Only) */}
              <button
                className="relative flex size-8 text-muted-foreground lg:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                <div className="absolute left-1/2 top-1/2 block w-[18px] -translate-x-1/2 -translate-y-1/2">
                  <span
                    aria-hidden="true"
                    className={`absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out ${isMenuOpen ? "rotate-45" : "-translate-y-1.5"}`}
                  >
                  </span>
                  <span
                    aria-hidden="true"
                    className={`absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out ${isMenuOpen ? "opacity-0" : ""}`}
                  >
                  </span>
                  <span
                    aria-hidden="true"
                    className={`absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out ${isMenuOpen ? "-rotate-45" : "translate-y-1.5"}`}
                  >
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/*  Mobile Menu Navigation */}
        <div
          className={cn(
            "fixed inset-x-0 top-[calc(66px+1.5rem)] mx-4 bg-card flex flex-col rounded-lg border border-gray-100 p-6 transition-all duration-300 ease-in-out lg:hidden z-50",
            isMenuOpen
              ? "visible translate-y-0 opacity-100"
              : "invisible -translate-y-4 opacity-0",
          )}
        >
          <nav className="flex flex-1 flex-col divide-y divide-border">
            {ITEMS.map(link =>
              (
                <a
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "py-4 text-base font-medium text-primary transition-colors first:pt-0 last:pb-0 hover:text-primary/80",
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ),
            )}
          </nav>
        </div>
      </section>
    </div>
  );
}
