"use client";

import React, { useContext, useState } from "react";
import { SafariPageContext } from "./SafarisSection";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CommentForm() {
  const { commentPoint, setCommentPoint, setComments } =
    useContext(SafariPageContext);

  const [commentContent, setCommentContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { toast } = useToast();

  const handleCreate = async () => {};

  return (
    <div className="p-4 bg-white rounded-md shadow-md left-4 top-44 z-10 absolute">
      <div className="text-sm font-bold">Create Comment</div>

      <div className="flex flex-col gap-4 mt-4">
        <Input
          placeholder="Your comment"
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
        />
        <Button className="ml-auto" size="sm">
          Create
        </Button>
      </div>
    </div>
  );
}
