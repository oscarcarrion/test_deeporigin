import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

// Rate limiter for URL shortening
export const shortenRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    error: "Too many URL shortening requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// Rate limiter for general API requests
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for redirect requests (more lenient)
export const redirectRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 redirects per minute
  message: {
    success: false,
    error: "Too many redirect requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Custom rate limiter that allows authenticated users higher limits
export const createAuthAwareRateLimit = (
  anonymousMax: number,
  authenticatedMax: number,
  windowMs: number = 15 * 60 * 1000
) => {
  return rateLimit({
    windowMs,
    max: (req: Request) => {
      // Check if user is authenticated (you'll need to implement this logic)
      const userId = req.headers.authorization;
      return userId ? authenticatedMax : anonymousMax;
    },
    message: {
      success: false,
      error: "Rate limit exceeded. Sign in for higher limits.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};
