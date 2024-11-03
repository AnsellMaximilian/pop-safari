"use client";

import React, { HTMLAttributes, ReactNode, useState } from "react";
import { Button } from "./ui/button";
import { Eye, EyeClosed, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type SlideDirection = "LEFT" | "RIGHT" | "TOP" | "BOTTOM";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  OpenIcon?: LucideIcon;
  direction?: SlideDirection;
}

const getVariants = (direction: SlideDirection) => {
  switch (direction) {
    case "LEFT":
      return {
        initial: { x: "-100%", opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: "-100%", opacity: 0 },
      };
    case "RIGHT":
      return {
        initial: { x: "100%", opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: "100%", opacity: 0 },
      };
    case "TOP":
      return {
        initial: { y: "-100%", opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: "-100%", opacity: 0 },
      };
    case "BOTTOM":
      return {
        initial: { y: "100%", opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: "100%", opacity: 0 },
      };
    default:
      return {
        initial: { x: "-100%", opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: "-100%", opacity: 0 },
      };
  }
};

export default function CollapsibleController({
  children,
  OpenIcon,
  direction = "RIGHT",
  ...props
}: Props) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div
      {...props}
      className={cn("flex flex-col gap-2 items-end", props.className)}
    >
      <Button
        variant={"outline"}
        size="icon"
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
        className={cn(isOpen ? "" : "opacity-70")}
      >
        {OpenIcon ? <OpenIcon /> : <Eye />}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={getVariants(direction).initial}
            animate={getVariants(direction).animate}
            exit={getVariants(direction).exit}
            transition={{ duration: 0.25 }}
            className="flex flex-col grow"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
