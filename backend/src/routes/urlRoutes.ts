import { Router } from "express";
import { UrlService } from "../services/urlService";
import {
  authenticateToken,
  optionalAuth,
  AuthenticatedRequest,
} from "../middleware/auth";
import { shortenRateLimit, apiRateLimit } from "../middleware/rateLimiter";
import { ApiResponse, CreateUrlRequest } from "../types";

const router = Router();
const urlService = new UrlService();

/**
 * POST /api/shorten - Create a shortened URL
 */
router.post(
  "/shorten",
  shortenRateLimit,
  optionalAuth,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { original_url, custom_slug }: CreateUrlRequest = req.body;

      if (!original_url) {
        res.status(400).json({
          success: false,
          error: "Original URL is required",
        } as ApiResponse);
        return;
      }

      const createUrlRequest: CreateUrlRequest = {
        original_url,
      };

      // Only add user_id if user is authenticated
      if (req.user?.id) {
        createUrlRequest.user_id = req.user.id;
      }

      // Only add custom_slug if it's provided and not undefined
      if (custom_slug !== undefined) {
        createUrlRequest.custom_slug = custom_slug;
      }

      // Extract access token from Authorization header
      const authHeader = req.headers.authorization;
      const accessToken = authHeader && authHeader.split(" ")[1];

      const urlData = await urlService.createShortUrl(
        createUrlRequest,
        accessToken
      );

      res.status(201).json({
        success: true,
        data: urlData,
        message: "URL shortened successfully",
      } as ApiResponse);
    } catch (error) {
      console.error("Error shortening URL:", error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to shorten URL",
      } as ApiResponse);
    }
  }
);

/**
 * GET /api/urls - Get all URLs for the authenticated user or public URLs
 */
router.get(
  "/urls",
  apiRateLimit,
  optionalAuth,
  async (req: AuthenticatedRequest, res) => {
    try {
      let urls;

      if (req.user?.id) {
        // extract access token for authenticated users
        const authHeader = req.headers.authorization;
        const accessToken = authHeader && authHeader.split(" ")[1];
        urls = await urlService.getUserUrls(req.user.id, accessToken);
      } else {
        urls = await urlService.getAllUrls();
      }

      res.json({
        success: true,
        data: urls,
      } as ApiResponse);
    } catch (error) {
      console.error("Error fetching URLs:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch URLs",
      } as ApiResponse);
    }
  }
);

/**
 * PUT /api/urls/:id - Update URL slug (authenticated users only)
 */
router.put(
  "/urls/:id",
  apiRateLimit,
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { slug } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          error: "URL ID is required",
        } as ApiResponse);
        return;
      }

      if (!slug) {
        res.status(400).json({
          success: false,
          error: "New slug is required",
        } as ApiResponse);
        return;
      }

      // req.user is guaranteed to exist after authenticateToken middleware
      const userId = req.user!.id;
      const authHeader = req.headers.authorization;
      const accessToken = authHeader && authHeader.split(" ")[1];
      const updatedUrl = await urlService.updateUrlSlug(
        id,
        slug,
        userId,
        accessToken
      );

      res.json({
        success: true,
        data: updatedUrl,
        message: "URL updated successfully",
      } as ApiResponse);
    } catch (error) {
      console.error("Error updating URL:", error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to update URL",
      } as ApiResponse);
    }
  }
);

/**
 * DELETE /api/urls/:id - Delete URL (authenticated users only)
 */
router.delete(
  "/urls/:id",
  apiRateLimit,
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: "URL ID is required",
        } as ApiResponse);
        return;
      }

      // req.user is guaranteed to exist after authenticateToken middleware
      const userId = req.user!.id;
      const authHeader = req.headers.authorization;
      const accessToken = authHeader && authHeader.split(" ")[1];
      await urlService.deleteUrl(id, userId, accessToken);

      res.json({
        success: true,
        message: "URL deleted successfully",
      } as ApiResponse);
    } catch (error) {
      console.error("Error deleting URL:", error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete URL",
      } as ApiResponse);
    }
  }
);

/**
 * GET /api/analytics/:slug - Get analytics for a URL
 */
router.get(
  "/analytics/:slug",
  apiRateLimit,
  optionalAuth,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { slug } = req.params;

      if (!slug) {
        res.status(400).json({
          success: false,
          error: "URL slug is required",
        } as ApiResponse);
        return;
      }

      const analytics = await urlService.getUrlAnalytics(slug, req.user?.id);

      res.json({
        success: true,
        data: analytics,
      } as ApiResponse);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(400).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch analytics",
      } as ApiResponse);
    }
  }
);

export { router as urlRoutes };
