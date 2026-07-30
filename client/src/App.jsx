import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Directory from "./pages/directory/Directory";
import StartupDetail from "./pages/directory/StartupDetail";
import FounderDashboard from "./pages/founder/FounderDashboard";
import InvestorDashboard from "./pages/investor/InvestorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

function ProtectedRoute({ children, roles }) {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/directory" element={<Directory />} />
          <Route path="/directory/:id" element={<StartupDetail />} />

          <Route
            path="/founder"
            element={
              <ProtectedRoute roles={["founder"]}>
                <FounderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investor"
            element={
              <ProtectedRoute roles={["investor"]}>
                <InvestorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}