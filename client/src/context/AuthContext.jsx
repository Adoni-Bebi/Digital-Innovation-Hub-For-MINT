import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const DEMO_USERS = {
  founder: {
    id: "u1",
    fullName: "Abebe Kebede",
    email: "abebe@agrilink.et",
    role: "founder",
    companyName: "AgriLink Ethiopia",
  },
  investor: {
    id: "u2",
    fullName: "Sarah Johnson",
    email: "sarah@eastafricavc.com",
    role: "investor",
    organization: "East Africa Ventures",
  },
  admin: {
    id: "u3",
    fullName: "MinT Administrator",
    email: "admin@mint.gov.et",
    role: "admin",
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("dih_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem("dih_user");
      }
    }
    setLoading(false);
  }, []);

  const login = (email, password, role) => {
    const demoUser = DEMO_USERS[role] || {
      id: "u" + Date.now(),
      fullName: email.split("@")[0],
      email,
      role,
    };
    setUser(demoUser);
    localStorage.setItem("dih_user", JSON.stringify(demoUser));
    return demoUser;
  };

  const register = (fullName, email, password, role) => {
    const newUser = {
      id: "u" + Date.now(),
      fullName,
      email,
      role,
    };
    setUser(newUser);
    localStorage.setItem("dih_user", JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("dih_user");
  };

  const switchDemoRole = (role) => {
    const demoUser = DEMO_USERS[role];
    setUser(demoUser);
    localStorage.setItem("dih_user", JSON.stringify(demoUser));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, switchDemoRole, isAuthenticated: !!user }}
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