import React, { useState } from "react";
import { useNavigate } from "react-router";
import { walletSetup } from "../core/functions/wallet";
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
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  Loader2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const ImportWalletPage = () => {
  // Store words as an array of 12 strings
  const [words, setWords] = useState(Array(12).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saved, setSaved] = useState(false);
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Validation
  const isMnemonicValid = words.every(w => w.trim().length > 0);
  const isPasswordValid = password.length >= 8 && password === confirmPassword;
  const isValid = isMnemonicValid && isPasswordValid && saved;

  const handleImport = async () => {
    setIsLoading(true);
    setTimeout(async () => {
      try {
        const mnemonicString = words.join(" ");
        const secret = await walletSetup(password, mnemonicString);
        localStorage.setItem("secret", secret);
        navigate("/");
          setTimeout(() => {
        window.location.reload();
      }, 50);
      } catch (error) {
        console.error("Import failed", error);
      } finally {
        setIsLoading(false);
      }
    }, 500);
  };

  const handleWordChange = (index, value) => {
    const newWords = [...words];
    newWords[index] = value;
    setWords(newWords);
  };

  // Smart Paste Functionality
  const handlePaste = (e, index) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    if (!pastedData) return;

    // Split by space, newline, or comma
    const pastedWords = pastedData.trim().split(/[\s,]+/);

    // If user pasted multiple words, fill the grid starting from current index
    if (pastedWords.length > 1) {
        const newWords = [...words];
        pastedWords.forEach((word, i) => {
            if (index + i < 12) {
                newWords[index + i] = word.toLowerCase();
            }
        });
        setWords(newWords);
    } else {
        // Just single word paste
        handleWordChange(index, pastedWords[0]);
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

      {/* Header / Back Button */}
      <div className="absolute top-8 left-2 z-50 animate-in slide-in-from-left-8 fade-in duration-700">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
      </div>
      
      <div className="relative z-10 w-full max-w-2xl">
      
        {/* Main Card */}
        <Card className="bg-white border-gray-100 mt-15 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-700">
          <CardHeader className="space-y-1 ">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">
                    Secure Setup
                </span>
            </div>
            <CardTitle className="text-2xl font-bold text-zinc-900">
              Import Wallet
            </CardTitle>
            <CardDescription className="text-zinc-500 font-medium">
              Enter your 12-word recovery phrase to restore your wallet.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            
            {/* STEP 1: Grid Input */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <Label className="text-xs uppercase text-zinc-400 font-bold tracking-wider">
                        1. Secret Recovery Phrase
                    </Label>
                    <div className="flex items-center gap-2">
                        {isMnemonicValid ? (
                            <span className="text-xs text-emerald-600 flex items-center gap-1 font-bold animate-in fade-in">
                                <Check className="w-3 h-3" /> Valid Phrase
                            </span>
                        ) : (
                            <span className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
                                <AlertCircle className="w-3 h-3" /> Fill all 12 words
                            </span>
                        )}
                    </div>
                </div>
                
                {/* THE GRID INPUTS */}
                <div className="grid grid-cols-3 gap-3">
                    {words.map((word, index) => (
                        <div key={index} className="relative group">
                            {/* Number Overlay */}
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-xs select-none group-focus-within:text-emerald-600 font-medium transition-colors">
                                {index + 1}.
                            </span>
                            
                            {/* The Input */}
                            <input
                                type="text"
                                value={word}
                                onChange={(e) => handleWordChange(index, e.target.value)}
                                onPaste={(e) => handlePaste(e, index)}
                                className={cn(
                                    "w-full bg-gray-50 border border-gray-200 rounded-md py-3 pl-8 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 font-medium transition-all outline-none",
                                    "focus:border-black focus:ring-1 focus:ring-black",
                                    "hover:border-zinc-300"
                                )}
                                placeholder={`Word ${index + 1}`}
                            />
                        </div>
                    ))}
                </div>
                <p className="text-xs text-zinc-400 text-center pt-2 font-medium">
                    Tip: You can paste your entire phrase into the first box.
                </p>
            </div>

            <div className="h-px bg-gray-100 w-full" />

            {/* STEP 2: Password */}
            <div className="space-y-4">
              <Label className="text-xs uppercase text-zinc-400 font-bold tracking-wider">
                2. Create New Password
              </Label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 bg-gray-50 border-gray-200 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-black focus-visible:border-black transition-all"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                    type="button"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={cn(
                      "bg-gray-50 border-gray-200 text-zinc-900 placeholder:text-zinc-400 transition-all",
                      isPasswordValid 
                        ? "border-emerald-500 focus-visible:ring-emerald-500" 
                        : "focus-visible:ring-black focus-visible:border-black"
                    )}
                  />
                </div>
              </div>
            </div>

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
                  I understand this wallet is restored locally
                </Label>
            </div>

          </CardContent>

          <CardFooter>
            <Button
              className="w-full h-11 text-base bg-black text-white hover:bg-zinc-800 font-bold transition-all shadow-lg shadow-black/10"
              disabled={!isValid || isLoading}
              onClick={handleImport}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing Wallet...
                </>
              ) : (
                "Import Wallet"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ImportWalletPage;