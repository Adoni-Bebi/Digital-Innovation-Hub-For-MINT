import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const API_URL = "http://localhost:5000/api/auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("dih_user");
    const savedToken = localStorage.getItem("dih_token");

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch {
        localStorage.removeItem("dih_user");
        localStorage.removeItem("dih_token");
      }
    }
    setLoading(false);
  }, []);

  // ====================== LOGIN ======================
  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("dih_user", JSON.stringify(data.user));
    localStorage.setItem("dih_token", data.token);

    return data.user;
  };

  // ====================== REGISTER ======================
  const register = async (fullName, email, password, role) => {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Registration failed");
    }

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("dih_user", JSON.stringify(data.user));
    localStorage.setItem("dih_token", data.token);

    return data.user;
  };

  // ====================== LOGOUT ======================
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("dih_user");
    localStorage.removeItem("dih_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}