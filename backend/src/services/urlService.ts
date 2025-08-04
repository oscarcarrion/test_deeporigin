import { supabase } from "../config/database";
import { createClient } from "@supabase/supabase-js";
import {
  Url,
  CreateUrlRequest,
  CreateUrlResponse,
  UrlVisit,
  AnalyticsData,
} from "../types";
import {
  generateUniqueShortCode,
  isShortCodeTaken,
  isValidCustomSlug,
  sanitizeCustomSlug,
} from "../utils/slugGenerator";
import { isValidUrl, normalizeUrl, isSafeUrl } from "../utils/urlValidator";

export class UrlService {
  /**
   * Create an authenticated Supabase client if access token is provided
   */
  private getSupabaseClient(accessToken?: string) {
    if (accessToken) {
      const supabaseUrl = process.env["SUPABASE_URL"];
      const supabaseKey = process.env["SUPABASE_ANON_KEY"];

      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Missing Supabase environment variables");
      }

      const authenticatedClient = createClient(supabaseUrl, supabaseKey, {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      });

      return authenticatedClient;
    }

    return supabase; // Fall back to anonymous client
  }

  /**
   * Create a shortened URL
   */
  async createShortUrl(
    request: CreateUrlRequest,
    accessToken?: string
  ): Promise<CreateUrlResponse> {
    const { original_url, custom_slug, user_id } = request;

    // Validate the original URL
    if (!isValidUrl(original_url)) {
      throw new Error("Invalid URL provided");
    }

    if (!isSafeUrl(original_url)) {
      throw new Error("URL appears to be malicious or unsafe");
    }

    const normalizedUrl = normalizeUrl(original_url);
    let shortCode: string;

    // Handle custom slug
    if (custom_slug) {
      if (!isValidCustomSlug(custom_slug)) {
        throw new Error(
          "Invalid custom slug format. Use 3-20 alphanumeric characters, hyphens, or underscores."
        );
      }

      const sanitizedSlug = sanitizeCustomSlug(custom_slug);
      const isTaken = await isShortCodeTaken(sanitizedSlug);

      if (isTaken) {
        throw new Error("Custom slug is already taken");
      }

      shortCode = sanitizedSlug;
    } else {
      shortCode = await generateUniqueShortCode();
    }

    // Get the appropriate Supabase client (authenticated if user token provided)
    const supabaseClient = this.getSupabaseClient(accessToken);

    // Insert into database
    const { data, error } = await supabaseClient
      .from("urls")
      .insert({
        original_url: normalizedUrl,
        short_code: shortCode,
        user_id: user_id || null,
        custom_slug: !!custom_slug,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create short URL: ${error.message}`);
    }

    const baseUrl = process.env["BASE_URL"] || "http://localhost:3001";

    return {
      id: data.id,
      original_url: data.original_url,
      short_code: data.short_code,
      short_url: `${baseUrl}/${data.short_code}`,
      visit_count: data.visit_count,
      created_at: data.created_at,
    };
  }

  /**
   * Get original URL by short code and record visit
   */
  async getUrlByShortCode(
    shortCode: string,
    visitorInfo?: Partial<UrlVisit>
  ): Promise<string | null> {
    // Get the URL
    const { data: urlData, error } = await supabase
      .from("urls")
      .select("*")
      .eq("short_code", shortCode)
      .eq("is_active", true)
      .single();

    if (error || !urlData) {
      return null;
    }

    // Record the visit
    try {
      await supabase.from("url_visits").insert({
        url_id: urlData.id,
        ip_address: visitorInfo?.ip_address,
        user_agent: visitorInfo?.user_agent,
        referer: visitorInfo?.referer,
      });
    } catch (visitError) {
      // Log error but don't fail the redirect
      console.error("Failed to record visit:", visitError);
    }

    return urlData.original_url;
  }

  /**
   * Get all URLs for a user
   */
  async getUserUrls(userId: string, accessToken?: string): Promise<Url[]> {
    // use authenticated client when token is provided
    const supabaseClient = this.getSupabaseClient(accessToken);

    const { data, error } = await supabaseClient
      .from("urls")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch URLs: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get all URLs (for anonymous users or admin)
   */
  async getAllUrls(limit: number = 100): Promise<Url[]> {
    const { data, error } = await supabase
      .from("urls")
      .select("*")
      .is("user_id", null)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch URLs: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Update URL slug
   */
  async updateUrlSlug(
    urlId: string,
    newSlug: string,
    userId?: string,
    accessToken?: string
  ): Promise<Url> {
    if (!isValidCustomSlug(newSlug)) {
      throw new Error("Invalid slug format");
    }

    const sanitizedSlug = sanitizeCustomSlug(newSlug);
    const isTaken = await isShortCodeTaken(sanitizedSlug);

    if (isTaken) {
      throw new Error("Slug is already taken");
    }

    const updateData: any = {
      short_code: sanitizedSlug,
      custom_slug: true,
      updated_at: new Date().toISOString(),
    };

    // use authenticated client when token is provided
    const supabaseClient = this.getSupabaseClient(accessToken);
    let query = supabaseClient.from("urls").update(updateData).eq("id", urlId);

    // If userId provided, ensure user owns the URL
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query.select().single();

    if (error) {
      throw new Error(`Failed to update URL: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete URL
   */
  async deleteUrl(
    urlId: string,
    userId?: string,
    accessToken?: string
  ): Promise<void> {
    // same as above, use authenticated client when token is provided
    const supabaseClient = this.getSupabaseClient(accessToken);
    let query = supabaseClient.from("urls").delete().eq("id", urlId);

    // If userId provided, ensure user owns the URL
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { error } = await query;

    if (error) {
      throw new Error(`Failed to delete URL: ${error.message}`);
    }
  }

  /**
   * Get analytics for a URL
   */
  async getUrlAnalytics(
    shortCode: string,
    userId?: string
  ): Promise<AnalyticsData> {
    // First get the URL to ensure it exists and user has access
    let urlQuery = supabase
      .from("urls")
      .select("id, user_id")
      .eq("short_code", shortCode);

    if (userId) {
      urlQuery = urlQuery.eq("user_id", userId);
    }

    const { data: urlData, error: urlError } = await urlQuery.single();

    if (urlError || !urlData) {
      throw new Error("URL not found or access denied");
    }

    // Get total visits
    const { count: totalVisits } = await supabase
      .from("url_visits")
      .select("*", { count: "exact", head: true })
      .eq("url_id", urlData.id);

    // Get daily visits for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: dailyVisitsData } = await supabase
      .from("url_visits")
      .select("visited_at")
      .eq("url_id", urlData.id)
      .gte("visited_at", thirtyDaysAgo.toISOString())
      .order("visited_at", { ascending: true });

    // Process daily visits
    const dailyVisits = this.processDailyVisits(dailyVisitsData || []);

    // Get top referrers
    const { data: referrersData } = await supabase
      .from("url_visits")
      .select("referer")
      .eq("url_id", urlData.id)
      .not("referer", "is", null)
      .limit(1000);

    const topReferrers = this.processReferrers(referrersData || []);

    // Get browser data from user agents
    const { data: userAgentsData } = await supabase
      .from("url_visits")
      .select("user_agent")
      .eq("url_id", urlData.id)
      .not("user_agent", "is", null)
      .limit(1000);

    const browsers = this.processBrowsers(userAgentsData || []);

    return {
      total_visits: totalVisits || 0,
      daily_visits: dailyVisits,
      top_referrers: topReferrers,
      browsers: browsers,
    };
  }

  private processDailyVisits(
    visits: Array<{ visited_at: string }>
  ): Array<{ date: string; visits: number }> {
    const visitsByDate: Record<string, number> = {};

    visits.forEach((visit) => {
      const date = new Date(visit.visited_at).toISOString().split("T")[0];
      if (date) {
        visitsByDate[date] = (visitsByDate[date] || 0) + 1;
      }
    });

    return Object.entries(visitsByDate)
      .map(([date, visits]) => ({ date, visits }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private processReferrers(
    referrers: Array<{ referer: string }>
  ): Array<{ referer: string; visits: number }> {
    const referrerCounts: Record<string, number> = {};

    referrers.forEach(({ referer }) => {
      if (referer) {
        referrerCounts[referer] = (referrerCounts[referer] || 0) + 1;
      }
    });

    return Object.entries(referrerCounts)
      .map(([referer, visits]) => ({ referer, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);
  }

  private processBrowsers(
    userAgents: Array<{ user_agent: string }>
  ): Array<{ browser: string; visits: number }> {
    const browserCounts: Record<string, number> = {};

    userAgents.forEach(({ user_agent }) => {
      if (user_agent) {
        const browser = this.extractBrowser(user_agent);
        browserCounts[browser] = (browserCounts[browser!] || 0) + 1;
      }
    });

    return Object.entries(browserCounts)
      .map(([browser, visits]) => ({ browser, visits }))
      .sort((a, b) => b.visits - a.visits);
  }

  private extractBrowser(userAgent: string): string {
    if (userAgent.includes("Chrome/")) return "Chrome";
    if (userAgent.includes("Firefox/")) return "Firefox";
    if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/"))
      return "Safari";
    if (userAgent.includes("Edge/")) return "Edge";
    if (userAgent.includes("Opera/")) return "Opera";
    return "Other";
  }
}
