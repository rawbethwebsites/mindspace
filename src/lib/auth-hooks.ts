import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const { signIn, signOut } = useAuthActions();
  const navigate = useNavigate();

  const logout = async () => {
    await signOut();
    navigate("/login");
  };

  return {
    signIn,
    signOut: logout,
  };
}