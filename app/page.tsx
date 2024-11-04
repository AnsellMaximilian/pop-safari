"use client";

import Map3D from "@/components/Map3D";
import { useRef, useState } from "react";
import logo from "@/assets/pop-safari-logo.svg";
import Image from "next/image";

export default function Home() {
  const [map, setMap] = useState<google.maps.maps3d.Map3DElement | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  return (
    <Map3D mapRef={mapRef} setMap={setMap} className="fixed inset-0">
      <div className="bg-white/70 p-4 rounded-md z-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Image src={logo} width={300} height={300} alt="logo" />
        optionstest
      </div>
    </Map3D>
  );
}
