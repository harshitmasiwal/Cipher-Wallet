import { Routes, Route, Navigate } from "react-router";
import StartupPage from "./pages/StartupPage";
import CreateWalletPage from "./pages/CreateWalletPage";
import HomePage from "./pages/home/HomePage";
import ImportWalletPage from "./pages/ImportWalletPage";

export default function App() {
  const secret = localStorage.getItem("secret");

  return (
    <Routes>
      <Route path="/" element={secret ? <Navigate to="/home" /> : <StartupPage />} />
      <Route path="/create-wallet" element={<CreateWalletPage />} />
      <Route path="/import-wallet" element={<ImportWalletPage></ImportWalletPage>} />
      <Route path="/home" element={secret ? <HomePage /> : <Navigate to="/" />} />
    </Routes>
  );
}
