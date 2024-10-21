import { cn } from "@/lib/utils";
import Link from "next/link";
import React, { HTMLAttributes } from "react";
import { IconType } from "react-icons/lib";
import { IOnboardType } from "./page";

interface Props extends HTMLAttributes<HTMLDivElement> {
  name: string;
  icon: IconType;
  selected?: boolean;
  type: IOnboardType;
}

export default function OnboardType({
  icon: Icon,
  name,
  selected = false,
  type,
  ...props
}: Props) {
  return (
    <div
      {...props}
      className={cn(
        "cursor-pointer border-2 border-primary rounded-md overflow-hidden text-primary transition-all duration-100 flex flex-col items-center justify-center gap-8 hover:scale-95",

        selected && "bg-primary text-primary-foreground"
      )}
    >
      <div className="text-5xl">
        <Icon />
      </div>
      <div className="text-3xl font-bold">{name}</div>
    </div>
  );
}
