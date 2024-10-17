import Image from "next/image";
import React from "react";
import icon from "@/assets/pop-safari-logo.svg";

export default function Loader() {
  return (
    <div className="fixed inset-0 p-16 flex items-center justify-center animate-pulse">
      <Image
        src={icon}
        width={500}
        height={500}
        alt="loader"
        className="w-96"
      />
    </div>
  );
}
