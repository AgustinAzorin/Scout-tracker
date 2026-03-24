"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { User } from "@scout/shared-types";

interface AuthContextShape {
  user: User | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextShape | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}