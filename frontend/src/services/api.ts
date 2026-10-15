const API_ORIGIN = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
const BASE_URL = `${API_ORIGIN}/api/v1`;

export class ApiError extends Error {
  statusCode: number;
  errors?: any;

  constructor(message: string, statusCode = 400, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

const TOKEN_KEY = 'kictamc_access_token';
const REFRESH_TOKEN_KEY = 'kictamc_refresh_token';

let storedToken: string | null = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
let storedRefreshToken: string | null = typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;

export const setAuthToken = (token: string | null, refreshToken?: string | null) => {
  storedToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    if (refreshToken !== undefined) {
      storedRefreshToken = refreshToken;
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      } else {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    }
  }
};

export const getAuthToken = () => storedToken;
export const getRefreshToken = () => storedRefreshToken;

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  const currentRefresh = storedRefreshToken || (typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null);
  if (!currentRefresh) return null;

  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: currentRefresh }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Refresh failed');
      const json = await res.json();
      const newAccess = json.data?.accessToken;
      const newRefresh = json.data?.refreshToken;
      if (newAccess) {
        setAuthToken(newAccess, newRefresh || currentRefresh);
        return newAccess;
      }
      return null;
    } catch {
      setAuthToken(null, null);
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (storedToken) {
    headers.set('Authorization', `Bearer ${storedToken}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Include HttpOnly cookies
  });

  const contentType = response.headers.get('content-type') || '';
  let data: any = null;

  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    // If token expired, try automatic refresh once before failing
    if (
      response.status === 401 &&
      !endpoint.startsWith('/auth/login') &&
      !endpoint.startsWith('/auth/register') &&
      !endpoint.startsWith('/auth/refresh')
    ) {
      const newToken = await tryRefreshToken();
      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`);
        const retryRes = await fetch(`${BASE_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: 'include',
        });
        const retryContentType = retryRes.headers.get('content-type') || '';
        let retryData: any = null;
        if (retryContentType.includes('application/json')) {
          try {
            retryData = await retryRes.json();
          } catch {
            retryData = null;
          }
        }
        if (retryRes.ok) {
          return retryData?.data !== undefined ? retryData.data : retryData;
        }
      }
    }

    const errorMsg =
      data?.message ||
      (contentType.includes('text/html')
        ? `API endpoint returned HTML (HTTP ${response.status}). Verify VITE_API_URL points to your backend web service.`
        : `Request failed with status ${response.status}`);
    throw new ApiError(errorMsg, response.status, data?.errors);
  }

  if (!contentType.includes('application/json') || data === null) {
    throw new ApiError(
      'Received non-JSON response from API server. Check your backend deployment and VITE_API_URL setting.',
      response.status
    );
  }

  return data?.data !== undefined ? data.data : data;
}

export const api = {
  get: <T>(url: string, options?: RequestInit) => request<T>(url, { ...options, method: 'GET' }),
  post: <T>(url: string, body?: any, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: <T>(url: string, body?: any, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T>(url: string, body?: any, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T>(url: string, options?: RequestInit) => request<T>(url, { ...options, method: 'DELETE' }),
};
