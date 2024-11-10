import { Client, Account, Databases, Functions, Storage } from "appwrite";

export const config = {
  projectId: String(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID),
  dbId: String(process.env.NEXT_PUBLIC_DB_ID),
  bucketId: String(process.env.NEXT_PUBLIC_BUCKET_ID),
  registerFuncId: String(process.env.NEXT_PUBLIC_REGISTER_FUNC_ID),

  userProfileCollectionId: String(
    process.env.NEXT_PUBLIC_USER_PROFILE_COLLECTION_ID
  ),
  businessCollectionId: String(process.env.NEXT_PUBLIC_BUSINESS_COLLECTION_ID),
  safariCollectionId: String(process.env.NEXT_PUBLIC_SAFARI_COLLECTION_ID),
  safariStopCollectionId: String(
    process.env.NEXT_PUBLIC_SAFARI_STOP_COLLECTION_ID
  ),
  polygonCollectionId: String(process.env.NEXT_PUBLIC_POLYGON_COLLECTION_ID),
  commentCollectionId: String(process.env.NEXT_PUBLIC_COMMENT_COLLECTION_ID),
};

export const client = new Client();

client.setEndpoint("https://cloud.appwrite.io/v1").setProject(config.projectId);

export const account = new Account(client);

export const databases = new Databases(client);

export const functions = new Functions(client);
export const storage = new Storage(client);
