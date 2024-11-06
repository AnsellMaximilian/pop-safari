"use client";

import { getVariants } from "@/components/CollapsibleController";
import Map3D from "@/components/Map3D";
import { useUser } from "@/contexts/user/UserContext";
import { cn } from "@/lib/utils";
import { FlyCameraOptions } from "@/type/maps";
import { AnimatePresence, motion } from "framer-motion";
import React, {
  createContext,
  Dispatch,
  useEffect,
  useRef,
  useState,
} from "react";
import defUser from "@/assets/default-user.svg";
import Image from "next/image";
import UserProfile from "./UserProfile";
enum ProfileMenuType {
  PROFILE = "PROFILE",
  FRIENDS = "FRIENDS",
  EXTRAS = "EXTRAS",
}

interface ProfilePageContextData {
  selectedMenu: ProfileMenuType;
  setSelectedMenu: React.Dispatch<React.SetStateAction<ProfileMenuType>>;
}

export const ProfilePageContext = createContext<ProfilePageContextData>({
  selectedMenu: ProfileMenuType.PROFILE,
  setSelectedMenu: () => {},
});
function ProfileMenu({
  label,
  value,
  onClick,
  selected,
}: {
  value: string;
  label: string;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-sm p-2 rounded-md hover:opacity-90 bg-white w-24 border border-border transition-all duration-200",
        selected ? "bg-primary border-white text-primary-foreground" : ""
      )}
    >
      {label}
    </button>
  );
}

export default function ProfilePage() {
  const [map, setMap] = useState<google.maps.maps3d.Map3DElement | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const { currentUser } = useUser();

  const [selectedMenu, setSelectedMenu] = useState<ProfileMenuType>(
    ProfileMenuType.PROFILE
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
        case ProfileMenuType.PROFILE:
          break;
        case ProfileMenuType.FRIENDS:
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
        case ProfileMenuType.EXTRAS:
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
  }, [selectedMenu]);
  return (
    <ProfilePageContext.Provider value={{ setSelectedMenu, selectedMenu }}>
      <Map3D
        setMap={setMap}
        mapRef={mapRef}
        options={{
          center: {
            lat: 41.89055365508961,
            lng: 12.491525668209857,
            altitude: 44.15254789334291,
          },
          tilt: 55.213468690585785,
          range: 331.5639259548698,
          heading: 0.5274332925695666,
        }}
        className="inset-0 fixed"
      >
        <div className="absolute top-4 left-4 right-4 h-12 z-10 flex gap-4 items-center">
          <ProfileMenu
            value={ProfileMenuType.PROFILE}
            selected={selectedMenu === ProfileMenuType.PROFILE}
            label="Profile"
            onClick={() => setSelectedMenu(ProfileMenuType.PROFILE)}
          />
          <ProfileMenu
            value={ProfileMenuType.FRIENDS}
            selected={selectedMenu === ProfileMenuType.FRIENDS}
            label="Friends"
            onClick={() => setSelectedMenu(ProfileMenuType.FRIENDS)}
          />
          <ProfileMenu
            value={ProfileMenuType.EXTRAS}
            selected={selectedMenu === ProfileMenuType.EXTRAS}
            label="Extras"
            onClick={() => setSelectedMenu(ProfileMenuType.EXTRAS)}
          />
        </div>

        <AnimatePresence>
          {selectedMenu === ProfileMenuType.PROFILE && (
            <motion.div
              initial={getVariants().initial}
              animate={getVariants().animate}
              exit={getVariants().exit}
              transition={{ duration: 0.25 }}
              className="absolute z-10 left-4 top-[5rem] bottom-4 overflow-y-auto rounded-md bg-white p-4 shadow-md w-[500px] flex flex-col"
            >
              <UserProfile />
            </motion.div>
          )}
        </AnimatePresence>
      </Map3D>
    </ProfilePageContext.Provider>
  );
}
