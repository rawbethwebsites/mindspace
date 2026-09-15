"use client";
import { useNavigate } from "react-router-dom";
import { auth } from "../ConvexClientProvider";

export function useAuth() {
  const navigate = useNavigate();

  const userId = auth.getUserId();
  const isAuthenticated = !!userId;
  const loading = false;

  const logout = () => {
    auth.clear();
    navigate("/login");
  };

  return { userId, isAuthenticated, loading, logout };
}
