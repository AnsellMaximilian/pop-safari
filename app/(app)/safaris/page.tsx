"use client";
import logo from "@/assets/pop-safari-logo.svg";

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

export enum SafariPageMode {
  CREATE = "CREATE",
  VIEW = "VIEW",
}

export default function Page() {
  const [map, setMap] = useState<google.maps.maps3d.Map3DElement | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  return (
    <Map3D mapRef={mapRef} setMap={setMap} className="fixed inset-0">
      <Card className="absolute top-4 left-4 z-10 bottom-4 md:w-[500px] max-w-full">
        <CardHeader className="text-center">
          <CardTitle className="">Safaris</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 items-center mt-16">
            <Image
              src={emptySafari}
              width={500}
              height={500}
              alt="empty safari"
              className="w-64"
            />
            {/* <div>Empty...</div> */}
            <p className="mt-8">
              Start your own adventures by creating your first{" "}
              <strong>Safari</strong>
            </p>
            <Button>Create Safari</Button>
          </div>
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
