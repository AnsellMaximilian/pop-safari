"use client";

import React, { useContext } from "react";
import { SafariPageContext } from "./SafarisSection";

export default function SafariComments() {
  const { comments, setCommentPoint, commentPoint, setComments } =
    useContext(SafariPageContext);
  return (
    <div className="bg-white rounded-md shadow-md p-4">SafariComments</div>
  );
}
