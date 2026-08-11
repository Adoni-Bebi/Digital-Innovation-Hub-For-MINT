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
import CreateStartup from "./pages/founder/CreateStartup";
import DataRoom from "./pages/founder/DataRoom";
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import Profile from "./pages/Profile";
import AdminUsers from "./pages/admin/AdminUsers";
import Opportunities from "./pages/Opportunities";
import AdminOpportunities from "./pages/admin/AdminOpportunities";
import InvestorOpportunities from "./pages/investor/InvestorOpportunities";

// ====================== PROTECTED ROUTE ======================
function ProtectedRoute({ children, roles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    if (user.role === "founder") return <Navigate to="/founder" replace />;
    if (user.role === "investor") return <Navigate to="/investor" replace />;
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "citizen") return <Navigate to="/citizen" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

// ====================== PUBLIC ONLY ROUTE ======================
function PublicOnlyRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    if (user.role === "founder") return <Navigate to="/founder" replace />;
    if (user.role === "investor") return <Navigate to="/investor" replace />;
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "citizen") return <Navigate to="/citizen" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
}

// ====================== APP LAYOUT ======================
function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/directory" element={<Directory />} />
          <Route path="/directory/:id" element={<StartupDetail />} />

          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />

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
            path="/investor/opportunities"
            element={
              <ProtectedRoute roles={["investor"]}>
                <InvestorOpportunities />
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
          <Route
            path="/citizen"
            element={
              <ProtectedRoute roles={["citizen"]}>
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/founder/create"
            element={
              <ProtectedRoute roles={["founder"]}>
                <CreateStartup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/founder/data-room"
            element={
              <ProtectedRoute roles={["founder"]}>
                <DataRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/opportunities"
            element={
              <ProtectedRoute>
                <Opportunities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/opportunities"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminOpportunities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminUsers />
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