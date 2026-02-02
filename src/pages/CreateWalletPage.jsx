import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { generateMnemonic, walletSetup } from "../core/functions/wallet";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Copy,
  Download,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  Check,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export default function CreateWalletPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const [mnemonic, setMnemonic] = useState("");

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const mn = generateMnemonic();
    setMnemonic(mn);
  }, []);

  const valid = password.length >= 8 && password === confirmPassword;

  const handleContinue = async () => {
    setIsLoading(true);

    setTimeout(async () => {
      const secret = await walletSetup(password, mnemonic);
      localStorage.setItem("secret", secret);

      setIsLoading(false);
      navigate("/home");

      // refresh AFTER navigation
      setTimeout(() => {
        window.location.reload();
      }, 50);
    }, 500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMnemonic = () => {
    const element = document.createElement("a");
    const file = new Blob([mnemonic], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "cipher-wallet-recovery.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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

      {/* Header / Back Button */}
      <div className="absolute top-8 left-2 z-10 animate-in slide-in-from-left-8 fade-in duration-700">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>

      <div className="relative z-10 mt-15 w-full max-w-lg">
        {/* Main Card - White Style */}
        <Card className="bg-white border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-700">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
               <div className="p-2 bg-emerald-500/10 rounded-lg">
                 <ShieldCheck className="w-5 h-5 text-emerald-600" />
               </div>
               <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">
                 Secure Setup
               </span>
            </div>
            <CardTitle className="text-2xl font-bold text-zinc-900">
              Create your Wallet
            </CardTitle>
            <CardDescription className="text-zinc-500 font-medium">
              Set a strong password and secure your recovery phrase.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* STEP 1: Password */}
            <div className="space-y-4">
              <Label className="text-xs uppercase text-zinc-400 font-bold tracking-wider">
                1. Create Password
              </Label>

              <div className="space-y-3">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password (min 8 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 bg-gray-50 border-gray-200 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-black focus-visible:border-black transition-all"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={cn(
                      "pr-10 bg-gray-50 border-gray-200 text-zinc-900 placeholder:text-zinc-400 transition-all",
                      valid
                        ? "focus-visible:ring-emerald-500 border-emerald-500"
                        : "focus-visible:ring-red-500"
                    )}
                  />
                  {password && confirmPassword && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {password === confirmPassword ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100 w-full" />

            {/* STEP 2: Mnemonic */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase text-zinc-400 font-bold tracking-tight">
                  2. Secret Recovery Phrase
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    onClick={downloadMnemonic}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <Check className="w-3 h-3 mr-1" />
                    ) : (
                      <Copy className="w-3 h-3 mr-1" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              <div className="relative group">
                {/* Mnemonic Grid - Light Gray background */}
                <div className="grid grid-cols-3 gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200 relative shadow-inner">
                  {mnemonic.split(" ").map((word, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-white p-2 rounded text-sm border border-gray-200 shadow-sm"
                    >
                      <span className="text-zinc-400 select-none text-xs w-4 font-medium">
                        {index + 1}.
                      </span>
                      <span className="text-zinc-800 font-mono font-semibold">
                        {word}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Alert
                className="bg-red-50 text-red-600 border-red-100"
              >
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertTitle className="text-red-700 font-bold">Warning</AlertTitle>
                <AlertDescription className="text-xs text-red-600/90 font-medium">
                  Never share this phrase. Anyone with these words can steal
                  your assets forever.
                </AlertDescription>
              </Alert>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="saved"
                  checked={saved}
                  onCheckedChange={(checked) => setSaved(checked)}
                  className="border-zinc-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 data-[state=checked]:text-white"
                />
                <Label
                  htmlFor="saved"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-600 cursor-pointer"
                >
                  I have saved my recovery phrase securely
                </Label>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              className="w-full h-11 text-base bg-black text-white hover:bg-zinc-800 font-bold transition-all shadow-lg shadow-black/10"
              disabled={!valid || !saved || isLoading}
              onClick={handleContinue}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Encrypting...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}