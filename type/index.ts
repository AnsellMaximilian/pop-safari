import { Models } from "appwrite";
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
};

export type RemoteData<T> = {
  data: T;
  isLoading: boolean;
};

export type RemoteDataWithSetter<T> = RemoteData<T> & {
  setData: Dispatch<SetStateAction<RemoteData<T>>>;
};
