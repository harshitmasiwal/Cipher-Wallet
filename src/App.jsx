import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router"; 
import StartupPage from "./pages/StartupPage";
import CreateWalletPage from "./pages/CreateWalletPage";
import HomePage from "./pages/home/HomePage";
import ImportWalletPage from "./pages/ImportWalletPage";


const ProtectedRoute = () => {
  const secret = localStorage.getItem("secret");
  
  // Only redirect to start if there is NO wallet created/imported
  if (!secret) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

const PublicRoute = () => {
  const secret = localStorage.getItem("secret");

  if (secret) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default function App() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/" element={<StartupPage />} />
        <Route path="/create-wallet" element={<CreateWalletPage />} />
        <Route path="/import-wallet" element={<ImportWalletPage />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<HomePage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}