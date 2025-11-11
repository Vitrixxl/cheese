import { auth } from "@/lib/auth";

export const useOptionalUser = () => {
  const { data: authData, isPending } = auth.useSession();
  return { user: authData?.user, isPending };
};
/**
 * When using this hook, please make sur to have a protected componenent higher in the tree to garantee that user is defined
 */
export const useUser = () => {
  const { data: authData } = auth.useSession();
  if (!authData)
    throw new Error("useUser must be used inside a <Protected/> componenent");
  return authData.user;
};
