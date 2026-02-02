import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, ArrowRight, Instagram, X, ShieldCheck } from "lucide-react";
import { CypherLogo } from "./home/icons";

/* --- COMPONENT: Terms of Service Modal --- */
const TermsModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md h-[80vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300 border border-zinc-200"
        onClick={(e) => e.stopPropagation()} 
      >
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-zinc-900" size={20} />
            <h3 className="text-xl font-bold text-gray-900">Terms of Service</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-zinc-200 rounded-full transition-colors"
          >
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-zinc-600 leading-relaxed custom-scrollbar">
          <section>
            <h4 className="font-bold text-zinc-900 mb-2">1. Acceptance of Terms</h4>
            <p>By accessing and using Cipher Wallet, you accept and agree to be bound by the terms and provision of this agreement.</p>
          </section>

          <section>
            <h4 className="font-bold text-zinc-900 mb-2">2. Non-Custodial Service</h4>
            <p>Cipher Wallet is a non-custodial interface. You retain full control of your private keys and funds. We do not have access to your wallet, nor can we recover your funds if you lose your secret phrase.</p>
          </section>

          <section>
            <h4 className="font-bold text-zinc-900 mb-2">3. User Responsibility</h4>
            <p>You are solely responsible for maintaining the security of your device and backing up your recovery phrase. We accept no liability for funds lost due to user error, theft, or forgotten credentials.</p>
          </section>

          <section>
            <h4 className="font-bold text-zinc-900 mb-2">4. Transaction Irreversibility</h4>
            <p>Cryptocurrency transactions are irreversible. Once confirmed on the blockchain, they cannot be cancelled. Please verify all details before sending.</p>
          </section>
          
          <section>
            <h4 className="font-bold text-zinc-900 mb-2">5. No Financial Advice</h4>
            <p>Information provided by Cipher Wallet is for informational purposes only and does not constitute financial or investment advice.</p>
          </section>
        </div>

        {/* Footer Action */}
        <div className="p-6 border-t border-zinc-100 bg-zinc-50/50">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-lg"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

/* --- MAIN PAGE --- */
export default function StartupPage() {
  const navigate = useNavigate();
  // State to control the modal visibility
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background flex flex-col lg:flex-row font-sans selection:bg-zinc-800 selection:text-white relative">
      
      {/* RENDER TERMS MODAL IF TRUE */}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}

      {/* LEFT COLUMN - Brand & Aesthetics */}
      <div className="relative w-full lg:w-[52%] bg-zinc-950 text-white flex flex-col justify-between p-8 pt-12 md:p-16 lg:p-24 min-h-[45vh] lg:min-h-screen overflow-hidden border-b lg:border-b-0 lg:border-r border-zinc-800">
        
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-125 h-125 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-75 h-75 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              {/* Logo / Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 w-fit">
                 <CypherLogo className="scale-100"></CypherLogo>
                <span className="text-xs font-medium text-zinc-400 tracking-wide uppercase">Hello MATE </span>
              </div>

              <div>
                <h1 className="text-4xl mt-6 md:text-6xl lg:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-linear-to-br from-white via-zinc-200 to-zinc-500 pb-2">
                  Cipher Wallet
                </h1>
                <p className="text-zinc-400 text-lg md:text-xl mt-10 leading-relaxed max-w-lg font-light">
                  A secure, non-custodial crypto wallet built for speed, privacy,
                  and full ownership. Multi-chain support with zero compromise.
                </p>
              </div>
            </div>

            {/* Footer / Socials */}
            <div className="pt-12 lg:pt-0 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              <div className="border-t border-zinc-800/50 pt-8">
                <p className="text-xs uppercase tracking-widest text-zinc-600 font-semibold">
                  Architected by
                </p>
                <p className="text-lg md:text-xl font-medium mt-1 text-zinc-200">
                  Harshit Masiwal
                </p>

                <div className="flex items-center gap-5 mt-6">
                  {[
                      { icon: Github, href: "https://github.com/harshitmasiwal/" }, 
                      { icon: Instagram, href: "https://www.instagram.com/harshit.masiwal/" }, 
                      { icon: Linkedin, href: "https://www.linkedin.com/in/harshit-masiwal/" }
                  ].map((Social, index) => (
                    <a
                      key={index}
                      href={Social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-500 hover:text-white hover:scale-110 transition-all duration-300"
                    >
                      <Social.icon className="h-5 w-5 md:h-6 md:w-6" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* RIGHT COLUMN - Actions */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center bg-white dark:bg-zinc-950 p-8 md:p-12 lg:p-24 min-h-[50vh] lg:min-h-screen">
        <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          
          <div className="text-center space-y-3">
            <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-2xl w-fit mx-auto mb-6">
              <CypherLogo className="scale-200"></CypherLogo>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Get Started with Cipher
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-base">
              Join the ecosystem securely.
            </p>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            <Button
              size="lg"
              className="group w-full h-14 rounded-xl text-base font-semibold shadow-xl shadow-zinc-200/50 hover:shadow-zinc-300/50 transition-all duration-300 bg-zinc-900 text-white hover:bg-zinc-800"
              onClick={() => navigate("/create-wallet")}
            >
              Create New Wallet
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>

            <div className="relative flex items-center gap-4 py-2">
                <div className="h-px bg-zinc-200 w-full"></div>
                <span className="text-xs text-zinc-400 uppercase font-medium">Or</span>
                <div className="h-px bg-zinc-200 w-full"></div>
            </div>

            <Button
              size="lg"
              variant="outline"
              className="w-full h-14 rounded-xl text-base font-semibold border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-900"
              onClick={() => navigate("/import-wallet")}
            >
              Import Existing Wallet
            </Button>
          </div>
          
          {/* UPDATED TERMS FOOTER */}
          <p className="text-center text-xs text-zinc-400 pt-6">
            By continuing, you agree to our{' '}
            <button 
                onClick={() => setShowTerms(true)} 
                className="underline hover:text-zinc-900 cursor-pointer bg-transparent border-none p-0 inline font-medium"
            >
                Terms of Service
            </button>.
          </p>
        </div>
      </div>

    </div>
  );
}