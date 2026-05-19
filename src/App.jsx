import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/layout/Sidebar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import PartsPage from "./pages/admin/PartsPage";
import VendorsPage from "./pages/admin/VendorsPage";
import StaffPage from "./pages/admin/StaffPage";
import ReportsPage from "./pages/admin/ReportsPage";

// Staff pages
import StaffDashboard from "./pages/staff/Dashboard";
import CustomersPage from "./pages/staff/CustomersPage";
import SalesInvoicePage from "./pages/staff/SalesInvoicePage";

// Customer pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import HistoryPage from "./pages/customer/HistoryPage";
import AiPredictorPage from "./pages/customer/AiPredictorPage";
import PartsListPage from "./pages/customer/PartsListPage";
import ProfilePage from "./pages/customer/ProfilePage";
import MyVehiclesPage from "./pages/customer/MyVehiclesPage";

// Shared pages
import AppointmentsPage from "./pages/shared/AppointmentsPage";
import ReviewsPage from "./pages/shared/ReviewsPage";
import PartRequestsPage from "./pages/shared/PartRequestsPage";

// Admin purchase invoice page (inline)
import PurchaseInvoicePage from "./pages/admin/PurchaseInvoicePage";
import NotificationsPage from "./pages/admin/NotificationsPage";
import StaffReportsPage from "./pages/staff/StaffReportsPage";

import "./styles/global.css";

function AppInner() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState("dashboard");
  const [pageState, setPageState] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  // navigate(key) or navigate(key, state)
  const navigate = (key, state = null) => {
    setPageState(state);
    setPage(key);
  };

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "var(--text-muted)" }}>Loading...</div>;

  if (!user) {
    return showRegister
      ? <RegisterPage onBack={() => setShowRegister(false)} />
      : <LoginPage onRegister={() => setShowRegister(true)} />;
  }

  const renderPage = () => {
    const role = user.role;

    if (role === "Admin") {
      switch (page) {
        case "dashboard":    return <AdminDashboard onNavigate={setPage} />;
        case "parts":        return <PartsPage />;
        case "vendors":      return <VendorsPage />;
        case "purchase":     return <PurchaseInvoicePage />;
        case "staff":        return <StaffPage />;
        case "customers":    return <CustomersPage />;
        case "invoices":     return <SalesInvoicePage />;
        case "reports":      return <ReportsPage />;
        case "notifications":return <NotificationsPage />;
        case "appointments": return <AppointmentsPage />;
        default:             return <AdminDashboard onNavigate={setPage} />;
      }
    }

    if (role === "Staff") {
      switch (page) {
        case "dashboard":    return <StaffDashboard onNavigate={setPage} />;
        case "customers":    return <CustomersPage />;
        case "invoices":     return <SalesInvoicePage />;
        case "parts":        return <PartsPage />;
        case "appointments": return <AppointmentsPage />;
        case "requests":     return <PartRequestsPage />;
        case "reports":      return <StaffReportsPage />;
        default:             return <CustomersPage />;
      }
    }

    if (role === "Customer") {
      switch (page) {
        case "dashboard":    return <CustomerDashboard onNavigate={navigate} />;
        case "history":      return <HistoryPage />;
        case "appointments": return <AppointmentsPage />;
        case "ai":           return <AiPredictorPage />;
        case "reviews":      return <ReviewsPage />;
        case "requests":     return <PartRequestsPage prefillPartName={pageState?.partName} />;
        case "parts":        return <PartsListPage onNavigate={navigate} />;
        case "profile":      return <ProfilePage />;
        case "vehicles":     return <MyVehiclesPage />;
        default:             return <CustomerDashboard onNavigate={navigate} />;
      }
    }

    return <div>Unknown role</div>;
  };

  return (
    <div className="layout">
      <Sidebar activePage={page} onNavigate={navigate} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
