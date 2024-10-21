import { account, config, databases } from "@/lib/appwrite";
import { ReactNode, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { User, UserProfile } from "@/type";
import Loader from "@/components/Loader";
import { useToast } from "@/hooks/use-toast";

export const UserContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const { toast } = useToast();

  const getAccount = async () => {
    let user: User | null = null;
    try {
      setIsLoading(true);
      const acc = await account.get();

      user = { ...acc, profile: null };
    } catch (error) {
      setCurrentUser(null);
    } finally {
      setCurrentUser(user);
      setIsLoading(false);
    }

    if (user) {
      try {
        const userProfile: UserProfile = await databases.getDocument(
          config.dbId,
          config.userProfileCollectionId,
          user.$id
        );
        setCurrentUser({ ...user, profile: userProfile });
      } catch (error) {}
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsProcessing(true);
      const session = await account.createEmailPasswordSession(email, password);
      await getAccount();
    } catch (error) {
      let errorMsg = "Unkown Error";

      if (error instanceof Error) errorMsg = error.message;
      toast({
        variant: "destructive",
        title: "Login Error",
        description: errorMsg,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const logout = async () => {
    setIsProcessing(true);
    await account.deleteSession("current");
    setCurrentUser(null);
    setIsProcessing(false);
  };

  useEffect(() => {
    getAccount();
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isLoading,
        isProcessing,
        setCurrentUser,
        login,
        logout,
      }}
    >
      {isLoading && <Loader />}
      {isLoading === false && <>{children}</>}
    </UserContext.Provider>
  );
};
