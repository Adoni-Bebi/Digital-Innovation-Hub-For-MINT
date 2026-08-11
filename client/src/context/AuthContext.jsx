import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const API_BASE = "https://digital-innovation-hub-for-mint.onrender.com/api";
const API_URL = `${API_BASE}/auth`;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const updateProfile = async (profileData) => {
    const res = await fetch(`${API_URL}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || localStorage.getItem("dih_token")}`,
      },
      body: JSON.stringify(profileData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to update profile");
    }

    setUser(data.user);
    localStorage.setItem("dih_user", JSON.stringify(data.user));

    return data.user;
  };

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
        updateProfile,
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