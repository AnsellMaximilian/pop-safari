"use client";
import logo from "@/assets/pop-safari-logo.svg";
import { z } from "zod";
import defBusiness from "@/assets/default-business.svg";

import Map3D from "@/components/Map3D";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React, { useContext, useRef, useState } from "react";
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
import { SafariPageContext, SafariPageMode } from "./SafarisSection";
export const safariFormSchema = z.object({
  title: z.string().min(5).max(50),
  description: z.string().max(500),
  visibility: z.enum([
    SafariVisibility.FRIENDS,
    SafariVisibility.PRIVATE,
    SafariVisibility.PUBLIC,
  ]),
});
export default function CreateSafari({
  onFinishCreate,
}: {
  onFinishCreate?: () => Promise<void>;
}) {
  const { toast } = useToast();
  const { currentUser } = useUser();
  const [safariImage, setSafariImage] = useState<File | null>(null);
  const [safariImagePreviewURL, setSafariImagePreviewURL] = useState<
    string | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { safaris } = useData();

  const { setPageMode } = useContext(SafariPageContext);

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

      safaris.setData((prev) => ({
        ...prev,
        data: [...prev.data, createdSafari],
      }));

      if (onFinishCreate) await onFinishCreate();
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

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPageMode(SafariPageMode.VIEW)}
          >
            Cancel
          </Button>
          <Button type="submit" className="" disabled={isSafariCreationLoading}>
            Create
          </Button>
        </div>
      </form>
    </Form>
  );
}
