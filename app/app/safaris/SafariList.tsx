"use client";

import { useData } from "@/contexts/data/DataContext";
import React, { useContext, useEffect, useState } from "react";
import { SafariPageContext, SafariPageMode } from "./SafarisSection";
import { Button } from "@/components/ui/button";
import { getErrorMessage, truncateString } from "@/utils/common";
import SafariStatusBadge from "./SafariStatusBadge";
import SafariCard from "./SafariCard";
import { Safari, SafariSpot } from "@/type";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { config, databases } from "@/lib/appwrite";

export default function SafariList() {
  const { safaris, publicSafaris, friendSafaris } = useData();

  const { setPageMode, setSelectedSafari } = useContext(SafariPageContext);
  const { toast } = useToast();

  const [safariToDelete, setSafariToDelete] = useState<Safari | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDelete = async () => {
    if (safariToDelete) {
      try {
        setIsDeleting(true);

        await databases.deleteDocument(
          config.dbId,
          config.safariCollectionId,
          safariToDelete.$id
        );

        safaris.setData((prev) => ({
          ...prev,
          data: prev.data.filter((s) => s.$id !== safariToDelete.$id),
        }));
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error deleting Safari",
          description: getErrorMessage(error),
        });
      } finally {
        setSafariToDelete(null);
        setIsDeleting(false);
      }
    }
  };
  return (
    <div className="space-y-4">
      <div className="">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase">Your Safaris</h2>
          <Button
            onClick={() => {
              setSelectedSafari(null);
              setPageMode(SafariPageMode.CREATE);
            }}
          >
            Create Safari
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {safaris.data.map((s) => (
            <SafariCard
              safari={s}
              key={s.$id}
              loading={safaris.isLoading}
              handleDelete={() => {
                setSafariToDelete(s);
              }}
            />
          ))}
        </div>
      </div>

      <div className="">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase">
            Friends&apos; Safaris
          </h2>
        </div>
        {!friendSafaris.isLoading && friendSafaris.data.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {friendSafaris.data.map((s) => (
              <SafariCard
                safari={s}
                key={s.$id}
                loading={friendSafaris.isLoading}
              />
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-center">
            Your friends&apos; Safaris will show up here if they&apos;ve set is
            in Friends mode.
          </div>
        )}
      </div>

      <div className="">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase">Public Safaris</h2>
        </div>
        {!publicSafaris.isLoading && publicSafaris.data.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {publicSafaris.data.map((s) => (
              <SafariCard
                safari={s}
                key={s.$id}
                loading={publicSafaris.isLoading}
              />
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-center">
            People&apos;s Safaris which have been set as public will show up
            here
          </div>
        )}
      </div>
      <AlertDialog
        open={!!safariToDelete}
        onOpenChange={(val: boolean) => {
          if (!val) setSafariToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this Safari. You and other allowed
              users will not be able to see this Safari again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
