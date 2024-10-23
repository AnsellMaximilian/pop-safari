"use client";

import { useUser } from "@/contexts/user/UserContext";
import { useRouter } from "next/navigation";
import { z } from "zod";
import defaultBusiness from "@/assets/default-business.svg";

import React, { useEffect, useRef, useState } from "react";
import Map3D from "@/components/Map3D";
import { Coordinate, Map3dEvent } from "@/type/maps";
import { initAutocomplete, loader } from "@/lib/maps";
import { USER_REGISTRATION_MARKER } from "@/const/maps";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { config, databases } from "@/lib/appwrite";
import { UserProfile } from "@/type";
import { Permission, Role } from "appwrite";
import Image from "next/image";
const formSchema = z.object({
  name: z.string().min(5).max(500),
  description: z.string().max(500),
});
export default function BusinessOnboarding() {
  const [map, setMap] = useState<google.maps.maps3d.Map3DElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preferredPosition, setPreferredPosition] = useState<Omit<
    Coordinate,
    "altitude"
  > | null>(null);

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreviewURL, setProfilePicturePreviewURL] = useState<
    string | null
  >(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const { currentUser, setCurrentUser } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (currentUser?.profile) router.push("/maps");
  }, [currentUser]);

  useEffect(() => {
    loader.load().then(async () => {
      // @ts-ignore
      const { Marker3DElement } = (await google.maps.importLibrary(
        "maps3d"
      )) as google.maps.Maps3DLibrary;
      if (map) initAutocomplete(map);

      const handleMapClick: EventListenerOrEventListenerObject = (basicE) => {
        const e: Map3dEvent = basicE as Map3dEvent;

        const marker = new Marker3DElement({
          position: { lat: e.position.lat, lng: e.position.lng },
        });

        if (map) {
          const oldMarkers = document.querySelectorAll(
            `.${USER_REGISTRATION_MARKER}`
          );

          oldMarkers.forEach((m) => m.remove());
          marker.classList.add(USER_REGISTRATION_MARKER);
          map.append(marker);
          setPreferredPosition({ lat: e.position.lat, lng: e.position.lng });
        }
      };
      if (map) {
        map.addEventListener("gmp-click", handleMapClick);
      }

      // Places

      return () => {
        map?.removeEventListener("gmp-click", handleMapClick);
      };
    });
  }, [map]);

  const handleProfileChange: React.ChangeEventHandler<
    HTMLInputElement
  > = async (e) => {
    const file = e.target.files ? e.target.files[0] : null;

    if (file) {
      setProfilePicture(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreviewURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let errorMsg = "Something went wrong.";
    let hasError = false;

    if (!currentUser) return;

    try {
      setIsLoading(true);
      const createdProfile = (await databases.createDocument(
        config.dbId,
        config.userProfileCollectionId,
        currentUser.$id,
        {
          bio: values.description,
          preferredLat: preferredPosition ? preferredPosition.lat : null,
          preferredLng: preferredPosition ? preferredPosition.lng : null,
        },
        [
          Permission.update(Role.user(currentUser.$id)),
          Permission.delete(Role.user(currentUser.$id)),
        ]
      )) as UserProfile;
      console.log({ createdProfile });

      setCurrentUser({ ...currentUser, profile: createdProfile });

      router.push("/maps");
    } catch (error) {
      if (error instanceof Error) errorMsg = error.message;
      hasError = true;
    } finally {
      if (hasError)
        toast({
          title: "User Onboarding Failed",
          variant: "destructive",
          description: errorMsg,
        });
      setIsLoading(false);
    }
  }
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-semibold">Setup Your Business</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grow">
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your business name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem className="">
              <FormLabel>Thumbnail</FormLabel>
              <div className="flex flex-col gap-4">
                <Image
                  className="w-56 h-56 border-border border-4 rounded-md"
                  width={500}
                  height={500}
                  alt="business picture"
                  onClick={() => fileInputRef?.current?.click()}
                  src={profilePicturePreviewURL ?? defaultBusiness}
                ></Image>
                <FormControl>
                  <Input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfileChange}
                    ref={fileInputRef}
                  />
                </FormControl>
              </div>
            </FormItem>
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Your description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-4">
            <div className="grow">
              <FormLabel>Preferred Location</FormLabel>
              <FormDescription>
                Choose your location. It doesn&apos;t have to be where you live.
                It could be places where you frequent, like a hangout spot.
              </FormDescription>

              <div className="py-4">
                {preferredPosition ? (
                  <div>
                    Selected Position{" "}
                    <span>
                      {preferredPosition.lat}, {preferredPosition.lng}
                    </span>
                  </div>
                ) : (
                  <div>Place a marker</div>
                )}
              </div>
            </div>
            <div>
              <Input
                placeholder="Search"
                className="rounded-none"
                id="pac-input"
              />
              <Map3D
                mapRef={mapRef}
                setMap={setMap}
                className="h-96 w-[500px] relative"
              ></Map3D>
            </div>
          </div>

          <div className="flex">
            <Button type="submit" className="ml-auto" disabled={isLoading}>
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
