"use client";

import Map3D from "@/components/Map3D";
import { useUser } from "@/contexts/user/UserContext";
import { FlyCameraOptions } from "@/type/maps";
import React, { useEffect, useRef, useState } from "react";
import ProfileSection from "./profile/ProfileSection";
import SafariSection from "./safaris/SafarisSection";
import privateRoute from "@/hooks/privateRoute";
import { AppMenuType, AppPageContext } from "./safariData";

function AppPage() {
  const [map, setMap] = useState<google.maps.maps3d.Map3DElement | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const [selectedMenu, setSelectedMenu] = useState<AppMenuType>(
    AppMenuType.SAFARIS
  );

  useEffect(() => {
    if (map) {
      let flyOptions: FlyCameraOptions = {
        endCamera: {
          center: {
            lat: 41.89055365508961,
            lng: 12.491525668209857,
            altitude: 44.15254789334291,
          },
          tilt: 55.213468690585785,
          range: 331.5639259548698,
          heading: 0.5274332925695666,
        },
        durationMillis: 5000,
      };

      switch (selectedMenu) {
        case AppMenuType.SAFARIS:
          flyOptions = {
            endCamera: {
              center: {
                lat: 43.72242982852751,
                lng: 10.395638672330737,
                altitude: 7.164099814111666,
              },
              tilt: 79.6272253861062,
              range: 212.85384783557674,
              heading: -122.63861298416958,
            },
            durationMillis: 5000,
          };
          break;
        case AppMenuType.PROFILE:
          flyOptions = {
            endCamera: {
              center: {
                lat: 41.89055365508961,
                lng: 12.491525668209857,
                altitude: 44.15254789334291,
              },
              tilt: 55.213468690585785,
              range: 331.5639259548698,
              heading: 0.5274332925695666,
            },
            durationMillis: 5000,
          };
          break;
        case AppMenuType.FRIENDS:
          flyOptions = {
            endCamera: {
              center: {
                lat: 29.979811191925506,
                lng: 31.13486342863226,
                altitude: 112.33691506032096,
              },
              tilt: 87.82882772597556,
              range: 481.93599545556935,
              heading: -177.1009354611321,
            },
            durationMillis: 5000,
          };
          break;
        case AppMenuType.EXTRAS:
          flyOptions = {
            endCamera: {
              center: {
                lat: 43.72242982852751,
                lng: 10.395638672330737,
                altitude: 7.164099814111666,
              },
              tilt: 79.6272253861062,
              range: 212.85384783557674,
              heading: -122.63861298416958,
            },
            durationMillis: 5000,
          };
          break;
        default:
          break;
      }
      // @ts-ignore
      map.flyCameraTo(flyOptions);
    }
  }, [selectedMenu, map]);

  return (
    <AppPageContext.Provider
      value={{ setSelectedMenu, selectedMenu, map, mapRef, setMap }}
    >
      <Map3D
        setMap={setMap}
        mapRef={mapRef}
        options={{
          center: {
            lat: 43.72242982852751,
            lng: 10.395638672330737,
            altitude: 7.164099814111666,
          },
          tilt: 79.6272253861062,
          range: 212.85384783557674,
          heading: -122.63861298416958,
        }}
        className="inset-0 fixed"
      >
        {[
          AppMenuType.PROFILE,
          AppMenuType.FRIENDS,
          AppMenuType.EXTRAS,
        ].includes(selectedMenu) && <ProfileSection />}
        {selectedMenu === AppMenuType.SAFARIS && <SafariSection />}
      </Map3D>
    </AppPageContext.Provider>
  );
}

export default privateRoute(AppPage);
