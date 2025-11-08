import { useOptionalUser } from "@/hooks/use-user";
import type { PropsWithChildren } from "react";
import React from "react";
import { useNavigate } from "react-router";

export default function Protected({ children }: PropsWithChildren) {
  const user = useOptionalUser();
  const navigate = useNavigate();
  React.useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user]);

  if (!user) return null;
  return children;
}
