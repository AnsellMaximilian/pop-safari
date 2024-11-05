"use client";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useUser } from "@/contexts/user/UserContext";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SafariPageContext } from "./page";
import { config, databases } from "@/lib/appwrite";
import { ID, Permission, Role } from "appwrite";
import { SafariSpot } from "@/type";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Point, { GroundPoint } from "@/components/Point";
import { removeElementsWithClass } from "@/utils/maps";
import { ROUTE_MARKER } from "@/const/maps";

const safariSpotFormSchema = z.object({
  name: z.string().min(5).max(50),
  description: z.string().max(500),
});
export default function SafariCreateForm() {
  const {
    setPageMode,
    setSelectedSafari,
    points,
    map,
    selectedSafari,
    safariViewMode,
    setSafariViewMode,
    extraSpotData,
    place,
    currentPoint,
    setCurrentPoint,
    safariSpots,
    setSafariSpots,
    setExtraSpotData,
    setPlace,
  } = useContext(SafariPageContext);
  const { currentUser } = useUser();

  const { toast } = useToast();

  const [spotCreateLoading, setSpotCreateLoading] = useState(false);

  const [activityStart, setActivityStart] = useState("");
  const [activityEnd, setActivityEnd] = useState("");

  const safariSpotForm = useForm<z.infer<typeof safariSpotFormSchema>>({
    resolver: zodResolver(safariSpotFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof safariSpotFormSchema>) {
    let errorMsg = "Something went wrong.";
    let hasError = false;

    if (!currentUser || !selectedSafari || !currentPoint) return;

    try {
      setSpotCreateLoading(true);

      const createdSpot = (await databases.createDocument(
        config.dbId,
        config.safariStopCollectionId,
        ID.unique(),
        {
          name: values.name,
          description: values.description,
          safariId: selectedSafari.$id,
          placeId: extraSpotData?.placeId ? extraSpotData.placeId : null,
          lat: currentPoint.latitude,
          lng: currentPoint.longitude,
          order:
            safariSpots.length > 0
              ? safariSpots[safariSpots.length - 1].order + 1
              : 1,
        },
        [
          Permission.update(Role.user(currentUser.$id)),
          Permission.delete(Role.user(currentUser.$id)),
        ]
      )) as SafariSpot;

      setSafariSpots((prev) => [...prev, createdSpot]);
      setCurrentPoint(null);
      setPlace(null);
      removeElementsWithClass(ROUTE_MARKER);
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
      setSpotCreateLoading(false);
    }
  }

  return (
    <div className="absolute top-44 left-4 bg-white rounded-md shadow-md z-10 p-4 bottom-4 w-[500px] overflow-auto">
      <h2 className="font-semibold">Create a Stop in Your Journey</h2>

      <div className="p-4 rounded-md border border-border mt-2 bg-secondary text-secondary-foreground">
        {currentPoint ? (
          <GroundPoint point={currentPoint} className="justify-center" />
        ) : (
          <div className="text-center text-gray-400">
            Click where you want to go.
          </div>
        )}

        {place && extraSpotData?.placeId && (
          <div className="text-center mt-2">
            <div>
              <span className="text-sm">Connected:</span>{" "}
              <span className="font-bold text-sm">
                {place?.displayName?.text || "Unnamed Place"}
              </span>
            </div>
          </div>
        )}
      </div>
      <Form {...safariSpotForm}>
        <form
          onSubmit={safariSpotForm.handleSubmit(onSubmit)}
          className="space-y-4 mt-4"
        >
          <div className="flex gap-4">
            <div className="space-y-4 grow">
              <FormField
                control={safariSpotForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grow">
                    <FormLabel>Activity Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="What do you plan to do here?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={safariSpotForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your activity"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <FormField
                  name="contributeStart"
                  render={({ field }) => (
                    <FormItem className="grow">
                      <FormLabel>Start</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          onChange={(e) => setActivityStart(e.target.value)}
                          value={activityStart}
                          className="w-auto"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="contributeEnd"
                  render={({ field }) => (
                    <FormItem className="grow">
                      <FormLabel>End</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          onChange={(e) => setActivityEnd(e.target.value)}
                          value={activityEnd}
                          className="w-auto"
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex">
            <Button
              type="submit"
              className="ml-auto"
              disabled={spotCreateLoading}
            >
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
