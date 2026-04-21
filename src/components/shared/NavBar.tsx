"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NavBar() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold text-lg">
          Form Builder
        </Link>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Esci
        </Button>
      </div>
    </header>
  );
}
