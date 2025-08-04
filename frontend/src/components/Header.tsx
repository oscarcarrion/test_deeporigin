"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  LinkIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  onAuthClick: (mode?: "signin" | "signup") => void;
}

export default function Header({ onAuthClick }: Props) {
  const { user, signOut, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <header className="bg-zinc-900 border-b border-zinc-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <LinkIcon className="h-8 w-8 text-blue-400" />
            <h1 className="text-xl font-bold text-zinc-100">Short.ly</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm text-zinc-300">
                      <UserIcon className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-2 rounded text-sm font-medium transition-colors border border-zinc-600"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onAuthClick("signin")}
                      className="text-zinc-300 hover:text-zinc-100 text-sm font-medium transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => onAuthClick("signup")}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-zinc-700">
            {!loading && (
              <>
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-zinc-300 px-2">
                      <UserIcon className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-2 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 rounded"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        onAuthClick("signin");
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-2 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 rounded"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        onAuthClick("signup");
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-2 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
