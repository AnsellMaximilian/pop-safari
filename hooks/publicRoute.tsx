import Loader from "@/components/Loader";
import { useUser } from "@/contexts/user/UserContext";
import { useRouter } from "next/navigation";
import { ComponentType, useEffect } from "react";

const publicRoute = <P extends object>(
  WrappedComponent: ComponentType<P>
): ComponentType<P> => {
  const ComponentWithPublicRoute = (props: P) => {
    const { isLoading, currentUser } = useUser();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && currentUser) {
        router.push("/app/dashboard");
      }
    }, [isLoading, currentUser, router]);

    if (isLoading || currentUser) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return ComponentWithPublicRoute;
};

export default publicRoute;
