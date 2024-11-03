import { Models } from "appwrite";
import { LucideProps } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
};

export type UserProfile = Models.Document & {
  bio?: string;
  preferredLat?: number;
  preferredLng?: number;
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
};

export type SafariSpot = Models.Document & {
  name: string;
  description?: string;
  lat: number;
  lng: number;
  placeId?: string;
  order: number;
};

export type LucideIcon = React.ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
>;
