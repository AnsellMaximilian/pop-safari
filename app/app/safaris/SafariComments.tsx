"use client";

import React, { useContext, useState } from "react";
import { SafariPageContext } from "./SafarisSection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import { useUser } from "@/contexts/user/UserContext";
import { config, databases } from "@/lib/appwrite";
import { ID, Permission, Role } from "appwrite";
import { Comment } from "@/type";
import { removeElementsWithClass } from "@/utils/maps";
import { COMMENT_MARKER } from "@/const/maps";
import { getErrorMessage, timeSince } from "@/utils/common";

export default function SafariComments({ close }: { close?: () => void }) {
  const {
    commentPoint,
    setCommentPoint,
    setComments,
    selectedSafari,
    comments,
  } = useContext(SafariPageContext);

  const { currentUser } = useUser();

  const [commentContent, setCommentContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { toast } = useToast();

  const handleCreate = async () => {
    if (commentContent.trim().length < 5) {
      toast({ description: "Comments need to be at least 5 characters long" });
      return;
    }

    if (currentUser?.profile && selectedSafari && commentPoint) {
      try {
        setIsCreating(true);
        const createdComment = (await databases.createDocument(
          config.dbId,
          config.commentCollectionId,
          ID.unique(),
          {
            username: currentUser.profile.username,
            name: currentUser.name,
            safariId: selectedSafari.$id,
            lat: commentPoint.latitude,
            lng: commentPoint.longitude,
            content: commentContent,
            userId: currentUser.$id,
          },
          [
            Permission.update(Role.user(currentUser.$id)),
            Permission.delete(Role.user(currentUser.$id)),
          ]
        )) as Comment;

        setCommentContent("");
        setCommentPoint(null);
        removeElementsWithClass(COMMENT_MARKER);

        setComments((prev) => [...prev, createdComment]);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error Creating Comment",
          description: getErrorMessage(error),
        });
      } finally {
        setIsCreating(false);
      }
    }
  };
  return (
    <div className="bg-white rounded-md shadow-md min-w-[500px] grow flex flex-col overflow-y-auto">
      <header className="p-4 flex items-center justify-between">
        <h2 className="text-sm font-bold">Comments</h2>
        <Button variant="outline" size="icon" onClick={close}>
          <X />
        </Button>
      </header>
      <Separator />
      <div className="p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Your comment"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
          />
          <Button
            onClick={handleCreate}
            className="ml-auto"
            size="sm"
            disabled={!commentPoint || isCreating}
          >
            Create
          </Button>
        </div>
      </div>
      <div className="grow overflow-y-auto space-y-2 px-4">
        {comments.map((c) => (
          <div
            key={c.$id}
            className="p-2 border-border border rounded-md cursor-pointer hover:bg-muted"
          >
            <div className="flex gap-2 items-center">
              <div className="text-sm font-bold">{c.name}</div>
              <div className="text-xs text-muted-foreground">
                {timeSince(c.$createdAt)}
              </div>
            </div>
            <div className="text-sm">{c.content}</div>
            <div className="flex flex-col items-end">
              <div>
                <div className="text-xs text-muted-foreground">
                  @{c.username}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
