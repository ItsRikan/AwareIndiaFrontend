import {
  ImageKitAuthResponse,
  MockUploadResponse,
  ScanRequest,
  ScanResult,
  MOCK_SCAN_RESULT,
  LoginCredentials,
  SignupCredentials,
  AuthResponse,
  RefreshTokenRequest,
  HistoryItem,
  CompareRequest,
  CompareResult
} from '@/types';
import ImageKit from "imagekit-javascript";
import { authTokenService } from './authTokenService';

// API base URL - configurable via environment variable
const API_BASE = import.meta.env.VITE_API_BASE || 'https://aware-india-backend-nogs.vercel.app';

// ImageKit Configuration
const IMAGEKIT_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_URL_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;

// Initialize ImageKit instance if keys are available
let imageKitInstance: ImageKit | null = null;
if (IMAGEKIT_PUBLIC_KEY && IMAGEKIT_URL_ENDPOINT) {
  imageKitInstance = new ImageKit({
    publicKey: IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: IMAGEKIT_URL_ENDPOINT,
  } as any);
}

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 60000;

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Mutex to prevent concurrent token refresh requests
let isRefreshing = false;
let refreshPromise: Promise<AuthResponse> | null = null;

/**
 * Creates a fetch request with timeout support and CORS handling
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = REQUEST_TIMEOUT,
  credentials: RequestCredentials = 'omit'
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      credentials,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Enhanced fetch with automatic token refresh on 401/403
 */
async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  timeout: number = REQUEST_TIMEOUT,
  retryOnAuthFailure: boolean = true
): Promise<Response> {
  // Attach access token if available
  const accessToken = authTokenService.getAccessToken();
  if (accessToken) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    };
  }

  const response = await fetchWithTimeout(url, options, timeout, 'omit');

  // If 401/403 and we have a refresh token, try to refresh
  if ((response.status === 401 || response.status === 403) && retryOnAuthFailure) {
    const refreshToken = authTokenService.getRefreshToken();

    if (refreshToken) {
      try {
        // Use mutex to prevent concurrent refresh requests
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = apiClient.refresh(refreshToken);
        }

        // Wait for refresh to complete
        const refreshResponse = await refreshPromise!;

        // Store new tokens
        authTokenService.setTokens(
          refreshResponse.access_token,
          refreshResponse.refresh_token,
          refreshResponse.expires_in,
          refreshResponse.user_id
        );

        isRefreshing = false;
        refreshPromise = null;

        // Retry original request with new token (prevent infinite loop)
        return fetchWithAuth(url, options, timeout, false);
      } catch (refreshError) {
        isRefreshing = false;
        refreshPromise = null;

        // Refresh failed - clear tokens and force logout
        authTokenService.clearTokens();

        // Dispatch custom event for AuthContext to handle logout
        window.dispatchEvent(new CustomEvent('auth:token-expired'));

        throw new ApiError('Session expired. Please login again.', 401);
      }
    }
  }

  return response;
}

/**
 * API Client for Aware India backend
 */
export const apiClient = {
  /**
    * Login to the backend
    */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetchWithTimeout(`${API_BASE}/auth/login`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.detail || 'Login failed',
          response.status,
          response.status === 401 ? 'AUTH_FAILED' : 'API_ERROR'
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Unable to connect. Please check your internet connection.', undefined, 'NETWORK_ERROR');
    }
  },

  /**
   * Signup to the backend
   */
  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    try {
      const response = await fetchWithTimeout(`${API_BASE}/auth/sign_up`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.detail || 'Signup failed',
          response.status,
          response.status === 401 ? 'AUTH_FAILED' : 'API_ERROR'
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Unable to connect. Please check your internet connection.', undefined, 'NETWORK_ERROR');
    }
  },

  /**
   * Refresh access token using refresh token
   */
  async refresh(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await fetchWithTimeout(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(errorData.detail || 'Token refresh failed', response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error during token refresh');
    }
  },

  /**
   * Confirm email verification
   */
  async confirm(token: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE}/auth/confirm`,
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        },
        REQUEST_TIMEOUT,
        'omit'
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('Email confirmation failed:', errorData);
        return { success: false, message: errorData.detail || 'Confirmation failed' };
      }

      return await response.json();
    } catch (error) {
      console.warn('Network error during email confirmation', error);
      return { success: false, message: 'Network error during confirmation' };
    }
  },

  /**
   * Logout from the backend
   */
  async logout(token: string): Promise<{ success: boolean }> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE}/auth/logout`,
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        },
        REQUEST_TIMEOUT,
        'omit'
      );

      if (!response.ok) {
        console.warn('Logout failed on server');
        return { success: false };
      }

      return await response.json();
    } catch (error) {
      console.warn('Network error during logout', error);
      return { success: false };
    }
  },

  /**
   * Get ImageKit authentication parameters
   */
  async getImageKitAuth(): Promise<ImageKitAuthResponse> {
    try {
      const response = await fetchWithTimeout(`${API_BASE}/imagekit/auth`, {
        method: 'GET',
        mode: 'cors',
      }, REQUEST_TIMEOUT, 'omit');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(errorData.detail || 'Failed to get ImageKit auth', response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error during ImageKit auth');
    }
  },

  /**
   * Upload image using ImageKit SDK with retry logic and fallback to backend endpoint
   * 
   * Flow:
   * 1. Try to upload directly to ImageKit using credentials from /imagekit/auth
   * 2. Retry once if network error occurs
   * 3. If direct upload fails, fallback to /imagekit/upload backend endpoint
   */
  async uploadImage(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      // Fetch auth params from backend
      const authParams = await this.getImageKitAuth();

      // Try to upload directly to ImageKit (with 1 retry for network errors)
      let lastError: Error | null = null;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          if (attempt === 2 && onProgress) {
            onProgress(5); // Reset progress for retry
          }
          const imageUrl = await this.uploadToImageKit(file, authParams, onProgress);
          return imageUrl;
        } catch (imagekitError) {
          lastError = imagekitError as Error;
          console.warn(`ImageKit upload attempt ${attempt} failed:`, imagekitError);
          
          // Only retry on network errors, not on auth/config errors
          const errorMsg = (imagekitError as any)?.message || '';
          const isNetworkError = errorMsg.includes('network') || errorMsg.includes('ERR_');
          
          if (attempt === 2 || !isNetworkError) {
            // Final attempt or not a network error - break and try fallback
            break;
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Direct ImageKit upload failed, fallback to backend endpoint
      console.warn('Direct ImageKit uploads exhausted, falling back to backend endpoint:', lastError);
      if (onProgress) onProgress(50); // Progress update before fallback
      
      try {
        const mockRes = await this.mockUpload(file);
        if (onProgress) onProgress(100);
        return mockRes.image_url;
      } catch (fallbackError) {
        console.error('Fallback upload also failed:', fallbackError);
        // If fallback fails, throw original ImageKit error
        throw lastError || new ApiError('Image upload failed - all methods exhausted');
      }
    } catch (error) {
      console.error('Error during image upload:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Image upload failed');
    }
  },

  /**
   * Direct upload to ImageKit using SDK with improved error handling
   */
  async uploadToImageKit(
    file: File,
    authParams: ImageKitAuthResponse,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    if (!authParams.token || !authParams.signature || !authParams.expire) {
      throw new ApiError('Missing authentication parameters for ImageKit upload');
    }

    // Validate token expiration
    const currentTime = Math.floor(Date.now() / 1000);
    if (authParams.expire <= currentTime) {
      throw new ApiError('ImageKit authentication token expired');
    }

    // Determine usage instance
    let instance = imageKitInstance;

    // If global instance is missing (no env vars), create one with keys from backend
    if (!instance) {
      if (!authParams.publicKey || !authParams.urlEndpoint) {
        throw new ApiError('ImageKit configuration missing');
      }
      instance = new ImageKit({
        publicKey: authParams.publicKey,
        urlEndpoint: authParams.urlEndpoint,
      } as any);
    }

    return new Promise((resolve, reject) => {
      if (onProgress) onProgress(10); // Start

      // Add timeout mechanism (30 seconds for upload)
      const uploadTimeout = setTimeout(() => {
        reject(new ApiError('ImageKit upload timeout', undefined, 'TIMEOUT'));
      }, 30000);

      instance!.upload({
        file: file,
        fileName: file.name,
        useUniqueFileName: true,
        token: authParams.token,
        signature: authParams.signature,
        expire: authParams.expire,
      } as any, (err: any, result: any) => {
        clearTimeout(uploadTimeout);

        if (err) {
          console.error("ImageKit Upload Error", err);
          
          // Better error messaging for network issues
          let errorMsg = 'ImageKit upload failed';
          if (err.message) {
            errorMsg += ': ' + err.message;
          }
          if (err.code) {
            errorMsg += ` (${err.code})`;
          }
          
          reject(new ApiError(errorMsg));
          return;
        }

        if (!result || !result.url) {
          reject(new ApiError('ImageKit upload succeeded but no URL returned'));
          return;
        }

        if (onProgress) onProgress(100);
        resolve(result.url);
      });
    });
  },

  /**
   * Upload image to backend endpoint (fallback when direct ImageKit fails)
   * This endpoint should handle the image upload serverside
   */
  async mockUpload(file: File): Promise<MockUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Attempting fallback upload to backend /imagekit/upload');

      const response = await fetchWithAuth(`${API_BASE}/imagekit/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const statusText = response.statusText || 'Unknown error';
        const errorMsg = `Backend upload failed with status ${response.status} (${statusText})`;
        console.error(errorMsg);
        
        // Try to get error details from response
        let detail = '';
        try {
          const errorData = await response.json();
          detail = errorData.detail || errorData.message || '';
        } catch (e) {
          // Response was not JSON
        }
        
        throw new ApiError(detail || errorMsg, response.status);
      }

      const result = await response.json();
      
      if (!result.image_url) {
        throw new ApiError('Backend upload succeeded but no image_url returned');
      }

      return result;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Upload timeout - please try again', undefined, 'TIMEOUT');
      }
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new ApiError(`Failed to upload image: ${errorMsg}`);
    }
  },

  /**
   * Scan an image for ingredients and health analysis
   */
  async scan(request: ScanRequest): Promise<ScanResult> {
    try {
      const response = await fetchWithAuth(`${API_BASE}/scan`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific expectation failed errors (417)
        if (response.status === 417) {
          throw new ApiError(errorData.detail || 'Scan processing failed', response.status);
        }

        throw new ApiError(errorData.detail || 'Scan failed', response.status);
      }

      const data = await response.json();

      // Backend now provides is_safe, no need to calculate manually
      // We still ensure url is present from request if not in response (though schema says it is)
      const result: ScanResult = {
        ...data,
        url: data.url || request.url,
      };

      return result;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Scan timeout - please try again', undefined, 'TIMEOUT');
      }
      throw new ApiError('Network error during scan');
    }
  },

  /**
   * Get user scan history
   */
  async getHistory(): Promise<HistoryItem[]> {
    try {
      const response = await fetchWithAuth(`${API_BASE}/history`, {
        mode: 'cors',
      });

      if (!response.ok) {
        throw new ApiError('Failed to fetch history', response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error during history fetch');
    }
  },

  /**
   * Compare two products
   */
  async compare(
    file1: File,
    file2: File,
    category: string,
    allergy: string,
    usecase: string,
    onProgress?: (progress: number) => void
  ): Promise<CompareResult> {
    try {
      // Step 1: Upload both images in parallel
      if (onProgress) onProgress(10);

      const [url1, url2] = await Promise.all([
        this.uploadImage(file1, (progress) => {
          if (onProgress) onProgress(10 + (progress * 0.35)); // 10-45%
        }),
        this.uploadImage(file2, (progress) => {
          if (onProgress) onProgress(10 + (progress * 0.35)); // 10-45%
        })
      ]);

      if (onProgress) onProgress(50);

      // Step 2: Call compare endpoint
      const compareRequest: CompareRequest = {
        url1,
        url2,
        category,
        allergy: allergy || "",
        usecase: usecase || ""
      };

      const response = await fetchWithAuth(`${API_BASE}/compare`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(compareRequest),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific expectation failed errors (417)
        if (response.status === 417) {
          throw new ApiError(errorData.detail || 'Comparison processing failed', response.status);
        }

        throw new ApiError(errorData.detail || 'Comparison failed', response.status);
      }

      if (onProgress) onProgress(100);

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Comparison timeout - please try again', undefined, 'TIMEOUT');
      }
      throw new ApiError('Network error during comparison');
    }
  },
};

/**
 * Compute SHA256 hash of a file (for caching purposes)
 */
export async function computeImageHash(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return '';
  }
}

export { ApiError };
