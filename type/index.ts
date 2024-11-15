import { Models } from "appwrite";
import { LucideProps } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { LatLng } from "./maps";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
};

export type UserProfile = Models.Document & {
  bio?: string;
  preferredLat?: number;
  preferredLng?: number;
  username: string;
  profileImageId?: string;
  friendIds: string[];
  name: string;
};

export type User = Models.User<Models.Preferences> & {
  profile: UserProfile | null;
  business: Business | null;
};

export type RemoteData<T> = {
  data: T;
  isLoading: boolean;
};

export type RemoteDataWithSetter<T> = RemoteData<T> & {
  setData: Dispatch<SetStateAction<RemoteData<T>>>;
};

export type Business = Models.Document & {
  name: string;
  description?: string;
  positionLat?: number;
  positionLng?: number;
  polygonPositions: string[];
  profileImageId?: string;
};

export enum SafariVisibility {
  FRIENDS = "FRND",
  PRIVATE = "PRVT",
  PUBLIC = "PBLC",
}

export enum SafariStatus {
  DRAFT = "DRFT",
  DONE = "DONE",
}

export type Safari = Models.Document & {
  title: string;
  description?: string;
  imageId?: string;
  visibility: SafariVisibility;
  userId: string;
  status: SafariStatus;
  username: string;
  name: string;
};

export type SafariSpot = Models.Document & {
  name: string;
  description?: string;
  lat: number;
  lng: number;
  placeId?: string;
  order: number;
  startTime?: string;
  endTime?: string;
};

export type SafariPolygon = Models.Document & {
  title: string;
  description?: string;
  points: string[];
  altitude: number;
  strokeColor: string;
  fillColor: string;
  opacity: number;
};

export type LucideIcon = React.ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
>;

export interface NearbyItemInfo {
  id: string;
  type: NearbyItemType;
  title: string;
  description: string;
  latLng: LatLng;
  placeId?: string;
}

export enum NearbyItemType {
  COMMENT = "COMMENT",
  SPOT = "SPOT",
  POLYGON = "POLYGON",
}

export type Comment = Models.Document & {
  content: string;
  lat: number;
  lng: number;
  username: string;
  name: string;
  userId: string;
  safariId: string;
};
