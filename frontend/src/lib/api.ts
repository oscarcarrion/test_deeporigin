const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
const API_BASE_URL = `${BASE_URL}/api`;

// export base URL for use in components
export { BASE_URL };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.apiBaseUrl}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP error! status: ${response.status}`,
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  // Auth methods
  async shortenUrl(originalUrl: string, customSlug?: string, token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return this.request("/shorten", {
      method: "POST",
      headers,
      body: JSON.stringify({
        original_url: originalUrl,
        custom_slug: customSlug,
      }),
    });
  }

  async getUrls(token?: string): Promise<any[]> {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await this.request("/urls", {
      method: "GET",
      headers,
    });

    // Return the data array directly, or empty array if failed
    return response.success && Array.isArray(response.data)
      ? response.data
      : [];
  }

  async updateUrlSlug(id: string, slug: string, token: string) {
    return this.request(`/urls/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ slug }),
    });
  }

  async deleteUrl(id: string, token: string) {
    return this.request(`/urls/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getAnalytics(slug: string, token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return this.request(`/analytics/${slug}`, {
      method: "GET",
      headers,
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
