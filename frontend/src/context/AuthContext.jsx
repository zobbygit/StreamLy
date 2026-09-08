import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../lib/api";
import { getSocket } from "../lib/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      const socket = getSocket();
      if (!socket.connected) socket.connect();
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data.user);
    const socket = getSocket();
    if (!socket.connected) socket.connect();
    return data.user;
  };

  const signup = async (payload) => {
    const { data } = await api.post("/auth/signup", payload);
    setUser(data.user);
    const socket = getSocket();
    if (!socket.connected) socket.connect();
    return data.user;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    const socket = getSocket();
    if (socket.connected) socket.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
