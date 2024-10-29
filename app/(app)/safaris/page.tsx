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

  const { toast } = useToast();
  const { currentUser } = useUser();
  const [safariImage, setSafariImage] = useState<File | null>(null);
  const [safariImagePreviewURL, setSafariImagePreviewURL] = useState<
    string | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSafariCreationLoading, setIsSafariCreationLoading] = useState(false);

  const handleSafariImageChange: React.ChangeEventHandler<
    HTMLInputElement
  > = async (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes

    if (file) {
      if (file.size > maxSize) {
        toast({
          variant: "destructive",
          title: "Image Error",
          description: "Currently, the image should not be bigger than 10mb",
        });
        return;
      }
      setSafariImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setSafariImagePreviewURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const createSafariForm = useForm<z.infer<typeof safariFormSchema>>({
    resolver: zodResolver(safariFormSchema),
    defaultValues: {
      title: "",
      description: "",
      visibility: SafariVisibility.PRIVATE,
    },
  });

  async function onCreateSafari(values: z.infer<typeof safariFormSchema>) {
    let errorMsg = "Something went wrong.";
    let hasError = false;
    if (currentUser === null) return;
    try {
      const { title, description, visibility } = values;
      const safariId = ID.unique();
      setIsSafariCreationLoading(true);
      // upload picture first
      let imageId: null | string = null;
      if (safariImage) {
        const picture = await storage.createFile(
          config.bucketId,
          safariId,
          safariImage
        );
        imageId = picture.$id;
      }
      const createdSafari = (await databases.createDocument(
        config.dbId,
        config.safariCollectionId,
        safariId,
        {
          title,
          description,
          visibility,
          imageId,
          userId: currentUser.$id,
          memberIds: [],
        },
        [
          Permission.update(Role.user(currentUser.$id)),
          Permission.delete(Role.user(currentUser.$id)),
        ]
      )) as Safari;
    } catch (error) {
      if (error instanceof Error) errorMsg = error.message;
      hasError = true;
    } finally {
      if (hasError)
        toast({
          title: "Safari Creation Failed",
          variant: "destructive",
          description: errorMsg,
        });
      setIsSafariCreationLoading(false);
    }
  }
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
            <Button onClick={() => setPageMode(SafariPageMode.CREATE)}>
              Create Safari
            </Button>
          </div>
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
          <Form {...createSafariForm}>
            <form
              onSubmit={createSafariForm.handleSubmit(onCreateSafari)}
              className="space-y-4"
            >
              <FormItem className="flex flex-col items-center">
                <div className="w-full">
                  <Image
                    className="w-full h-64 border-border border object-cover"
                    width={500}
                    height={500}
                    alt="business picture"
                    onClick={() => fileInputRef?.current?.click()}
                    src={safariImagePreviewURL ?? defBusiness}
                  ></Image>
                  <FormControl>
                    <Input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleSafariImageChange}
                      ref={fileInputRef}
                    />
                  </FormControl>
                </div>
                <FormLabel>Safari Image</FormLabel>
              </FormItem>
              <FormField
                control={createSafariForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Safari Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createSafariForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us a little about this safari"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex">
                <Button
                  type="submit"
                  className="ml-auto"
                  disabled={isSafariCreationLoading}
                >
                  Create
                </Button>
              </div>
            </form>
          </Form>
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
