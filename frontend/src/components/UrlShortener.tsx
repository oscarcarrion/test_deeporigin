"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  LinkIcon,
  ClipboardIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { apiClient, BASE_URL } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { CreateUrlResponse } from "@/types";

interface UrlShortenerProps {
  onUrlCreated: (url: CreateUrlResponse) => void;
}

export default function UrlShortener({ onUrlCreated }: UrlShortenerProps) {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shortenedUrl, setShortenedUrl] = useState<CreateUrlResponse | null>(
    null
  );
  const [copied, setCopied] = useState(false);
  const { user, getToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!originalUrl.trim()) {
      toast.error("Please enter a URL to shorten");
      return;
    }

    // Basic URL validation
    try {
      new URL(originalUrl);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsLoading(true);

    try {
      const token = user ? await getToken() : undefined;

      const response = await apiClient.shortenUrl(
        originalUrl.trim(),
        customSlug.trim() || undefined,
        token || undefined
      );

      if (response.success && response.data) {
        const urlData = response.data as CreateUrlResponse;
        setShortenedUrl(urlData);
        onUrlCreated(urlData);
        toast.success("URL shortened successfully!");

        // Reset form for authenticated users, keep URL for anonymous users
        if (user) {
          setOriginalUrl("");
          setCustomSlug("");
        }
      } else {
        toast.error(response.error || "Failed to shorten URL");
      }
    } catch (error) {
      console.error("Error shortening URL:", error);
      toast.error("Failed to shorten URL");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shortenedUrl) return;

    try {
      await navigator.clipboard.writeText(shortenedUrl.short_url);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleNewUrl = () => {
    setShortenedUrl(null);
    setOriginalUrl("");
    setCustomSlug("");
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded shadow-lg p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900/50 border border-blue-800 rounded-full mb-4">
          <LinkIcon className="w-8 h-8 text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">URL Shortener</h1>
        <p className="text-zinc-400 max-w-md mx-auto">
          Transform your long URLs into short, memorable links that are easy to
          share
        </p>
      </div>

      {!shortenedUrl ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-zinc-300 mb-2"
            >
              Original URL
            </label>
            <input
              type="url"
              id="url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="https://example.com/very-long-url"
              className="w-full px-4 py-3 border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder-zinc-500 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              required
              disabled={isLoading}
            />
          </div>

          {user && (
            <div>
              <label
                htmlFor="customSlug"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Custom Slug (Optional)
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-zinc-700 bg-zinc-800 text-zinc-400 text-sm rounded-l">
                  {BASE_URL}/
                </span>
                <input
                  type="text"
                  id="customSlug"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  placeholder="my-custom-slug"
                  pattern="[a-zA-Z0-9_-]{3,20}"
                  title="3-20 characters, letters, numbers, hyphens, and underscores only"
                  className="flex-1 px-4 py-3 border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder-zinc-500 rounded-r focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                3-20 characters, letters, numbers, hyphens, and underscores only
              </p>
            </div>
          )}

          {!user && (
            <div className="bg-blue-900/20 border border-blue-800 rounded p-4">
              <p className="text-sm text-blue-300">
                <strong>Sign in</strong> to create custom short URLs and track
                analytics!
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !originalUrl.trim()}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Shortening...</span>
              </>
            ) : (
              <>
                <LinkIcon className="w-5 h-5" />
                <span>Shorten URL</span>
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="text-center space-y-6">
          <div className="bg-emerald-900/20 border border-emerald-800 rounded p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-emerald-900/50 border border-emerald-800 rounded-full mx-auto mb-4">
              <CheckIcon className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">
              URL Shortened Successfully!
            </h3>
            <p className="text-zinc-400 text-sm mb-4">
              Your short URL is ready to use
            </p>

            <div className="bg-zinc-800 rounded border border-zinc-700 p-4 mb-4">
              <div className="text-sm text-zinc-400 mb-1">Short URL:</div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-blue-400 text-lg break-all">
                  {shortenedUrl.short_url}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="ml-2 p-2 text-zinc-400 hover:text-blue-400 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <CheckIcon className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <ClipboardIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-sm text-zinc-400">
              <div>
                Original URL:{" "}
                <span className="break-all">{shortenedUrl.original_url}</span>
              </div>
              <div>
                Created: {new Date(shortenedUrl.created_at).toLocaleString()}
              </div>
              <div>Clicks: {shortenedUrl.visit_count}</div>
            </div>
          </div>

          <button
            onClick={handleNewUrl}
            className="bg-zinc-700 text-white py-2 px-6 rounded font-medium hover:bg-zinc-600 transition-colors border border-zinc-600"
          >
            Shorten Another URL
          </button>
        </div>
      )}
    </div>
  );
}
