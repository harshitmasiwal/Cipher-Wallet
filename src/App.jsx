// 


import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router"; 
import StartupPage from "./pages/StartupPage";
import CreateWalletPage from "./pages/CreateWalletPage";
import HomePage from "./pages/home/HomePage";
import ImportWalletPage from "./pages/ImportWalletPage";
// We don't need useWallet here anymore for the route logic
// to prevent the infinite loop.


const ProtectedRoute = () => {
  const secret = localStorage.getItem("secret");
  
  // Only redirect to start if there is NO wallet created/imported
  if (!secret) {
    return <Navigate to="/" replace />;
  }

  // REMOVED: The check for isWalletLocked.
  // We let the <HomePage> handle showing the Lock Screen.
  // This prevents the PublicRoute <-> ProtectedRoute conflict.

  return <Outlet />;
};

const PublicRoute = () => {
  const secret = localStorage.getItem("secret");

  // If a wallet exists, don't let them see startup pages
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