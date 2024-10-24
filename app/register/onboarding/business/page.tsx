"use client";

import { useUser } from "@/contexts/user/UserContext";
import { useRouter } from "next/navigation";
import { z } from "zod";
import defaultBusiness from "@/assets/default-business.svg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import React, { useEffect, useRef, useState } from "react";
import Map3D from "@/components/Map3D";
import { Coordinate, Map3dEvent, MarkerPlaceMode } from "@/type/maps";
import { initAutocomplete, loader } from "@/lib/maps";
import {
  BUSINESS_REGIS_POLY_POINT,
  BUSINESS_REGIS_POLYGON,
  BUSINESS_REGISTRATION_MARKER,
  polygonOptions,
} from "@/const/maps";
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
import { config, databases, storage } from "@/lib/appwrite";
import { UserProfile } from "@/type";
import { Permission, Role } from "appwrite";
import Image from "next/image";
import Point from "@/components/Point";
import { removeElementsWithClass } from "@/utils/maps";
const formSchema = z.object({
  name: z.string().min(5).max(500),
  description: z.string().max(500),
});
export default function BusinessOnboarding() {
  const [map, setMap] = useState<google.maps.maps3d.Map3DElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // precise point
  const [preferredPosition, setPreferredPosition] = useState<Omit<
    Coordinate,
    "altitude"
  > | null>(null);

  // Polygon
  const [polygonPositions, setPolygonPositions] = useState<Coordinate[]>([]);
  const [hasSetPolygon, setHasSetPolygon] = useState(false);

  // Polygon OR precise point mode
  const [markerMode, setMarkerMode] = useState<MarkerPlaceMode>(
    MarkerPlaceMode.POINT
  );

  // Business Profile picture
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
    if (map) initAutocomplete(map);
  }, [map]);

  useEffect(() => {
    const handleMapClick: EventListenerOrEventListenerObject = (basicE) => {
      loader.load().then(async () => {
        // @ts-ignore
        const { Marker3DElement } = (await google.maps.importLibrary(
          "maps3d"
        )) as google.maps.Maps3DLibrary;
        const e: Map3dEvent = basicE as Map3dEvent;
        if (markerMode === MarkerPlaceMode.POINT) {
          const marker = new Marker3DElement({
            position: { lat: e.position.lat, lng: e.position.lng },
            label: form.getValues("name") || "Your Business",
          });

          if (map) {
            const oldMarkers = document.querySelectorAll(
              `.${BUSINESS_REGISTRATION_MARKER}`
            );

            oldMarkers.forEach((m) => m.remove());
            marker.classList.add(BUSINESS_REGISTRATION_MARKER);
            map.append(marker);
            setPreferredPosition({ lat: e.position.lat, lng: e.position.lng });
          }
        } else {
          const marker = new Marker3DElement({
            position: { lat: e.position.lat, lng: e.position.lng },
            label: "Point",
          });

          if (map) {
            marker.classList.add(BUSINESS_REGIS_POLY_POINT);
            map.append(marker);
            setPolygonPositions((prev) => [
              ...prev,
              {
                lat: e.position.lat,
                lng: e.position.lng,
                altitude: e.position.altitude,
              },
            ]);
          }
        }
      });
    };
    if (map) {
      map.addEventListener("gmp-click", handleMapClick);
    }

    return () => {
      map?.removeEventListener("gmp-click", handleMapClick);
    };
  }, [map, markerMode]);

  const handleProfileChange: React.ChangeEventHandler<
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
            <div className="space-y-4 grow">
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
            </div>

            <FormItem className="">
              <FormLabel>Thumbnail</FormLabel>
              <div className="flex flex-col gap-4">
                <Image
                  className="w-72 h-72 border-border border-4 rounded-md"
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

          <div className="flex gap-4">
            <div className="grow">
              <FormLabel>Business Location</FormLabel>
              <FormDescription>
                TODO: Change this form description.
              </FormDescription>

              <Tabs
                defaultValue={MarkerPlaceMode.POINT}
                className="w-full"
                onValueChange={(val) => {
                  setMarkerMode(val as MarkerPlaceMode);
                }}
              >
                <TabsList>
                  <TabsTrigger value={MarkerPlaceMode.POINT}>Point</TabsTrigger>
                  <TabsTrigger value={MarkerPlaceMode.POLY}>Poly</TabsTrigger>
                </TabsList>
                <TabsContent value={MarkerPlaceMode.POINT}>
                  <div> Place a precise point for your business.</div>
                  <div className="py-4">
                    {preferredPosition ? (
                      <Point coord={{ ...preferredPosition, altitude: 0 }} />
                    ) : (
                      <div>Place a marker</div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value={MarkerPlaceMode.POLY}>
                  <div>Mark an area for your business.</div>
                  <div className="flex gap-2">
                    <Button
                      className=""
                      variant="outline"
                      type="button"
                      disabled={polygonPositions.length < 2}
                      onClick={() => {
                        if (map && polygonPositions.length > 2) {
                          removeElementsWithClass(BUSINESS_REGIS_POLYGON);

                          const polygon =
                            new google.maps.maps3d.Polygon3DElement(
                              polygonOptions
                            );
                          polygon.outerCoordinates = polygonPositions.map(
                            (c) => ({
                              ...c,
                              altitude: 300,
                            })
                          );
                          polygon.classList.add(BUSINESS_REGIS_POLYGON);
                          removeElementsWithClass(BUSINESS_REGIS_POLY_POINT);
                          map.append(polygon);
                          setHasSetPolygon(true);
                          setPolygonPositions([]);
                        }
                      }}
                    >
                      Mark
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      disabled={polygonPositions.length <= 0}
                      onClick={() => {
                        removeElementsWithClass(BUSINESS_REGIS_POLY_POINT);
                        setPolygonPositions([]);
                      }}
                    >
                      Remove Markers
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      disabled={!hasSetPolygon}
                      onClick={() => {
                        removeElementsWithClass(BUSINESS_REGIS_POLYGON);
                        setHasSetPolygon(false);
                      }}
                    >
                      Remove Area
                    </Button>
                  </div>
                  <div className="flex gap-2 flex-col">
                    {polygonPositions.map((p, i) => (
                      <Point key={i} coord={p} />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
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
