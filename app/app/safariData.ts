import { createContext } from "react";

export enum AppMenuType {
  SAFARIS = "SAFARIS",
  PROFILE = "PROFILE",
  FRIENDS = "FRIENDS",
  EXTRAS = "EXTRAS",
}

export interface AppPageContextData {
  selectedMenu: AppMenuType;
  setSelectedMenu: React.Dispatch<React.SetStateAction<AppMenuType>>;
  mapRef: React.RefObject<HTMLDivElement>;
  map: google.maps.maps3d.Map3DElement | null;
  setMap: React.Dispatch<
    React.SetStateAction<google.maps.maps3d.Map3DElement | null>
  >;
}

export const AppPageContext = createContext<AppPageContextData | undefined>(
  undefined
);
