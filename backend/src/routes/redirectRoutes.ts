import { Router } from "express";
import { UrlService } from "../services/urlService";
import { redirectRateLimit } from "../middleware/rateLimiter";

const router = Router();
const urlService = new UrlService();

/**
 * GET /:slug - Redirect to original URL or show 404
 */
router.get("/:slug", redirectRateLimit, async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      res.status(404).json({
        success: false,
        error: "Short URL not found",
        message: "Invalid or missing slug parameter",
      });
      return;
    }

    // Get visitor information for analytics
    const visitorInfo: any = {};
    if (req.ip) visitorInfo.ip_address = req.ip;
    if (req.get("User-Agent")) visitorInfo.user_agent = req.get("User-Agent");
    if (req.get("Referer")) visitorInfo.referer = req.get("Referer");

    const originalUrl = await urlService.getUrlByShortCode(slug, visitorInfo);

    if (!originalUrl) {
      // Return 404 for invalid slugs
      res.status(404).json({
        success: false,
        error: "Short URL not found",
        message:
          "The requested short URL does not exist or has been deactivated",
      });
      return;
    }

    // Redirect to the original URL
    res.redirect(301, originalUrl);
  } catch (error) {
    console.error("Error redirecting:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

export { router as redirectRoutes };
