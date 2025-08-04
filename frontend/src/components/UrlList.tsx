"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  ClipboardIcon,
  CheckIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  EyeIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { apiClient } from "@/lib/api";
import { Url } from "@/types";
import { useAuth } from "@/hooks/useAuth";

export default function UrlList() {
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSlug, setEditSlug] = useState("");
  const { user, getToken } = useAuth();

  useEffect(() => {
    fetchUrls();
  }, [user]);

  const fetchUrls = async () => {
    try {
      const token = await getToken();
      const urlData = await apiClient.getUrls(token || undefined);
      setUrls(urlData);
    } catch (error) {
      console.error("Error fetching URLs:", error);
      toast.error("Failed to load URLs");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (shortUrl: string, id: string) => {
    try {
      const fullUrl = shortUrl.startsWith("http")
        ? shortUrl
        : `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
          }/${shortUrl}`;

      await navigator.clipboard.writeText(fullUrl);
      setCopiedId(id);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleEdit = (url: Url) => {
    setEditingId(url.id);
    setEditSlug(url.short_code);
  };

  const handleSaveEdit = async (id: string) => {
    if (!user) return;

    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication required");

      await apiClient.updateUrlSlug(id, editSlug, token);
      setEditingId(null);
      setEditSlug("");
      toast.success("URL updated successfully!");
      fetchUrls(); // Refresh the list
    } catch (error) {
      console.error("Error updating URL:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update URL"
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditSlug("");
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    if (!confirm("Are you sure you want to delete this URL?")) return;

    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication required");

      await apiClient.deleteUrl(id, token);
      toast.success("URL deleted successfully!");
      fetchUrls(); // Refresh the list
    } catch (error) {
      console.error("Error deleting URL:", error);
      toast.error("Failed to delete URL");
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-zinc-700 rounded mb-4 w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-zinc-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (urls.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded shadow-lg p-8 text-center">
        <div className="text-zinc-600 mb-4">
          <LinkIcon className="mx-auto h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium text-zinc-100 mb-2">No URLs yet</h3>
        <p className="text-zinc-400">
          {user
            ? "Start by shortening your first URL above!"
            : "Sign in to manage your shortened URLs and view analytics."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded shadow-lg">
      <div className="p-6 border-b border-zinc-700">
        <h2 className="text-xl font-semibold text-zinc-100">
          {user ? "Your URLs" : "Recent URLs"}
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          {urls.length} {urls.length === 1 ? "URL" : "URLs"} total
        </p>
      </div>

      <div className="divide-y divide-zinc-700">
        {urls.map((url) => (
          <div
            key={url.id}
            className="p-6 hover:bg-zinc-800/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {/* Short URL */}
                <div className="flex items-center space-x-2 mb-2">
                  {editingId === url.id ? (
                    <div className="flex items-center space-x-2 flex-1">
                      <span className="text-sm text-zinc-400">
                        {process.env.NEXT_PUBLIC_API_URL ||
                          "http://localhost:3001"}
                        /
                      </span>
                      <input
                        type="text"
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value)}
                        className="px-2 py-1 border border-zinc-600 bg-zinc-800 text-zinc-100 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(url.id);
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(url.id)}
                        className="text-emerald-400 hover:text-emerald-300 text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-zinc-400 hover:text-zinc-300 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <code className="text-blue-400 font-mono text-sm bg-blue-900/30 border border-blue-800 px-2 py-1 rounded">
                        {url.short_code}
                      </code>
                      <button
                        onClick={() => copyToClipboard(url.short_code, url.id)}
                        className="text-zinc-400 hover:text-zinc-200 transition-colors"
                      >
                        {copiedId === url.id ? (
                          <CheckIcon className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <ClipboardIcon className="h-4 w-4" />
                        )}
                      </button>
                    </>
                  )}
                </div>

                {/* Original URL */}
                <p className="text-sm text-zinc-400 truncate mb-2">
                  {url.original_url}
                </p>

                {/* Stats */}
                <div className="flex items-center space-x-4 text-xs text-zinc-500">
                  <span className="flex items-center space-x-1">
                    <EyeIcon className="h-3 w-3" />
                    <span>{url.visit_count} visits</span>
                  </span>
                  <span>
                    Created {new Date(url.created_at).toLocaleDateString()}
                  </span>
                  {url.custom_slug && (
                    <span className="bg-purple-900/50 border border-purple-800 text-purple-300 px-2 py-0.5 rounded-full text-xs">
                      Custom
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              {user && user.id === url.user_id && (
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(url)}
                    className="text-zinc-500 hover:text-blue-400 transition-colors"
                    title="Edit slug"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(url.id)}
                    className="text-zinc-500 hover:text-red-400 transition-colors"
                    title="Delete URL"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                  <button
                    className="text-zinc-500 hover:text-emerald-400 transition-colors"
                    title="View analytics (coming soon)"
                    disabled
                  >
                    <ChartBarIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
