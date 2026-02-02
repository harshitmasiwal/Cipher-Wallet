import React, { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { decodeSecret } from "../core/functions/wallet";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  LockKeyhole, 
  Loader2, 
  AlertCircle, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function InputPassword() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const { setIsWalletLocked } = useWallet();

  const unlock = async () => {
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      try {
        const secret = localStorage.getItem("secret");
        const wallet = decodeSecret(secret, password);

        if (!wallet) {
          setError("Incorrect password. Please try again.");
          setIsLoading(false);
          return;
        }

        sessionStorage.setItem("wallet_pwd", password);
        setIsWalletLocked(false);
      } catch (err) {
        setError("An unexpected error occurred.");
        setIsLoading(false);
      }
    }, 500);
  };

 const handleLogout = () => {
  const confirmed = window.confirm(
    "Are you sure? This will remove the wallet from this device. Make sure you have your recovery phrase saved."
  );

  if (!confirmed) return;

  localStorage.clear();

  // redirect to root and reload
  window.location.href = "/";
};


  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      unlock();
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-zinc-900">
      
      {/* 1. Grid Pattern with Fade Out (Mask) */}
      <div 
        className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"
        style={{
            maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
        }}
      ></div>
      
      {/* 2. Top Right Logout Button */}
      <div className="absolute top-6 right-6 z-20">
        <button 
            onClick={handleLogout}
            className="group flex items-center gap-2 text-zinc-400 hover:text-zinc-600 transition-colors text-xs font-bold tracking-widest uppercase"
        >
            Reset / Logout
            <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="relative z-10 w-full max-w-100 flex flex-col items-center">
        
        {/* 3. Floating Badge (Light) */}
        <div className="mb-8 animate-in slide-in-from-top-4 fade-in duration-700">
            <div className="bg-white px-5 py-2.5 rounded-full border border-gray-100 flex items-center gap-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="p-1 bg-black rounded-full">
                    <LockKeyhole className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-bold text-zinc-800 tracking-wider uppercase">
                   Cipher Wallet
                </span>
            </div>
        </div>

        {/* 4. Main Card (White) */}
        <Card className="w-full bg-white border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-700 delay-100">
          <CardHeader className="text-center space-y-3 pb-2">
            <CardTitle className="text-xl font-bold text-zinc-900 tracking-tight">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-zinc-500 text-sm font-medium">
              Enter your password to unlock your wallet
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            <div className="space-y-3">
              <div className="relative group">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(""); 
                  }}
                  onKeyDown={handleKeyDown}
                  className={cn(
                    "pr-10 h-11 bg-gray-50 border-gray-200 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-black focus-visible:border-black transition-all",
                    error && "border-red-500 focus-visible:ring-red-500 bg-red-50"
                  )}
                />
                 <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                    type="button"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center justify-center gap-2 text-red-500 text-xs font-medium animate-in slide-in-from-top-1 fade-in duration-300">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-5 pt-2 pb-8">
            <Button
              className="w-full h-11 text-sm bg-black text-white hover:bg-zinc-800 font-bold transition-all shadow-lg shadow-black/10"
              onClick={unlock}
              disabled={isLoading || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Unlocking...
                </>
              ) : (
                <>
                  Unlock Wallet <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
            
            <p className="text-center text-[10px] text-zinc-400 font-medium leading-relaxed px-4">
                Forgot password? You will need to import your wallet again using your seed phrase.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}