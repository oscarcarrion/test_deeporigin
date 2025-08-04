export interface Url {
  id: string;
  original_url: string;
  short_code: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  visit_count: number;
  is_active: boolean;
  custom_slug?: boolean;
}

export interface UrlVisit {
  id: string;
  url_id: string;
  visited_at: string;
  ip_address?: string;
  user_agent?: string;
  referer?: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUrlRequest {
  original_url: string;
  custom_slug?: string;
  user_id?: string;
}

export interface CreateUrlResponse {
  id: string;
  original_url: string;
  short_code: string;
  short_url: string;
  visit_count: number;
  created_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AnalyticsData {
  total_visits: number;
  daily_visits: Array<{
    date: string;
    visits: number;
  }>;
  top_referrers: Array<{
    referer: string;
    visits: number;
  }>;
  browsers: Array<{
    browser: string;
    visits: number;
  }>;
}
