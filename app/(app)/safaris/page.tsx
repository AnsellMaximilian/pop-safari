import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

export default function Page() {
  return (
    <div>
      <div className="flex justify-between gap-4 items-center">
        <h1 className="text-xl font-bold">Safaris</h1>
        <Link href="/safaris/create" className={cn(buttonVariants())}>
          Create Safari
        </Link>
      </div>
    </div>
  );
}
