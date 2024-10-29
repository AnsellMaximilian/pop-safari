"use client";
import logo from "@/assets/pop-safari-logo.svg";
import { z } from "zod";
import defBusiness from "@/assets/default-business.svg";

import Map3D from "@/components/Map3D";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React, { useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { NavItem } from "../layout";
import UserMenu from "@/components/UserMenu";
import emptySafari from "@/assets/empty-safari.svg";
import { Safari, SafariVisibility } from "@/type";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/user/UserContext";
import { config, databases, storage } from "@/lib/appwrite";
import { ID, Permission, Role } from "appwrite";
import { useData } from "@/contexts/data/DataContext";
import SafariList from "./SafariList";
import CreateSafari from "./CreateSafari";

export enum SafariPageMode {
  CREATE = "CREATE",
  VIEW = "VIEW",
  DETAILS = "DETAILS",
}

const safariFormSchema = z.object({
  title: z.string().min(5).max(50),
  description: z.string().max(500),
  visibility: z.enum([
    SafariVisibility.FRIENDS,
    SafariVisibility.PRIVATE,
    SafariVisibility.PUBLIC,
  ]),
});

export default function Page() {
  const [map, setMap] = useState<google.maps.maps3d.Map3DElement | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [pageMode, setPageMode] = useState<SafariPageMode>(SafariPageMode.VIEW);

  const { safaris } = useData();

  return (
    <Map3D mapRef={mapRef} setMap={setMap} className="fixed inset-0">
      <Card
        className={cn(
          "absolute top-4 left-4 z-10 bottom-4 md:w-[500px] max-w-full transition-all duration-500",
          pageMode === SafariPageMode.VIEW
            ? "translate-x-0"
            : "-translate-x-[1000px]"
        )}
      >
        <CardHeader className="text-center">
          <CardTitle className="">Safaris</CardTitle>
        </CardHeader>
        <CardContent>
          {safaris.data.length > 0 ? (
            <div>
              <Button onClick={() => setPageMode(SafariPageMode.CREATE)}>
                Create Safari
              </Button>
              <SafariList />
            </div>
          ) : (
            <div className="flex flex-col gap-4 items-center mt-16">
              <Image
                src={emptySafari}
                width={500}
                height={500}
                alt="empty safari"
                className="w-64"
              />
              <p className="mt-8">
                Start your own adventures by creating your first{" "}
                <strong>Safari</strong>
              </p>
              <Button onClick={() => setPageMode(SafariPageMode.CREATE)}>
                Create Safari
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card
        className={cn(
          "absolute top-4 left-4 z-10 bottom-4 md:w-[500px] max-w-full transition-all duration-500",
          pageMode === SafariPageMode.CREATE
            ? "translate-x-0"
            : "-translate-x-[1000px]"
        )}
      >
        <CardHeader className="text-center">
          <CardTitle className="">Create Safari</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateSafari
            onFinishCreate={async () => setPageMode(SafariPageMode.VIEW)}
          />
        </CardContent>
      </Card>

      <header className="absolute right-4 top-4 z-10 bg-white p-4 rounded-md shadow-md">
        <nav className="flex gap-8 items-center">
          <Image
            src={logo}
            width={300}
            height={200}
            alt="logo"
            className="w-24"
          />
          <ul className="flex items-center gap-4 text-sm">
            <NavItem label="Dashboard" href="/app/dashboard" />
            <NavItem label="Profile" href="/app/profile" />
          </ul>
          <div className="ml-auto">
            <UserMenu />
          </div>
        </nav>
      </header>
    </Map3D>
  );
}
