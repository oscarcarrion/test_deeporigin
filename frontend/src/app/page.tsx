"use client";

import { useState } from "react";
import { Toaster } from "react-hot-toast";
import UrlShortener from "@/components/UrlShortener";
import AuthModal from "@/components/AuthModal";
import UrlList from "@/components/UrlList";
import Header from "@/components/Header";
import { CreateUrlResponse } from "@/types";

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [refreshUrls, setRefreshUrls] = useState(0);

  const handleUrlCreated = (url: CreateUrlResponse) => {
    // Trigger refresh of URL list
    setRefreshUrls((prev) => prev + 1);
  };

  const openAuthModal = (mode: "signin" | "signup" = "signin") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1a1a1a",
            color: "#f5f5f5",
            border: "1px solid #333333",
          },
        }}
      />

      <Header onAuthClick={openAuthModal} />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-12">
          {/* URL Shortener Section */}
          <section>
            <UrlShortener onUrlCreated={handleUrlCreated} />
          </section>

          {/* URLs List Section */}
          <section>
            <UrlList key={refreshUrls} />
          </section>
        </div>
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
