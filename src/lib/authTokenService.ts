/**
 * Centralized token management service
 * - Access tokens stored in memory (cleared on page reload)
 * - Refresh tokens stored in localStorage (persists across reloads)
 * - Token expiry tracking
 */

const STORAGE_KEYS = {
    REFRESH_TOKEN: 'aware_india_refresh_token',
    USER_ID: 'aware_india_user_id',
} as const;

interface TokenData {
    accessToken: string;
    refreshToken: string;
    expiresAt: number; // timestamp in milliseconds
    userId: string;
}

class AuthTokenService {
    private accessToken: string | null = null;
    private expiresAt: number | null = null;
    private userId: string | null = null;

    /**
     * Store tokens after login/signup/refresh
     */
    setTokens(accessToken: string, refreshToken: string, expiresIn: number, userId: string): void {
        // Store access token in memory
        this.accessToken = accessToken;
        this.userId = userId;

        // Calculate expiry timestamp (subtract 60s buffer for safety)
        const expiryBuffer = 60 * 1000; // 60 seconds
        this.expiresAt = Date.now() + (expiresIn * 1000) - expiryBuffer;

        // Store refresh token and user ID in localStorage
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
    }

    /**
     * Get current access token
     */
    getAccessToken(): string | null {
        return this.accessToken;
    }

    /**
     * Get refresh token from localStorage
     */
    getRefreshToken(): string | null {
        return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    }

    /**
     * Get user ID
     */
    getUserId(): string | null {
        return this.userId || localStorage.getItem(STORAGE_KEYS.USER_ID);
    }

    /**
     * Check if access token is expired or about to expire
     */
    isAccessTokenExpired(): boolean {
        if (!this.accessToken || !this.expiresAt) {
            return true;
        }
        return Date.now() >= this.expiresAt;
    }

    /**
     * Check if we have a refresh token available
     */
    hasRefreshToken(): boolean {
        return !!this.getRefreshToken();
    }

    /**
     * Clear all tokens (logout)
     */
    clearTokens(): void {
        this.accessToken = null;
        this.expiresAt = null;
        this.userId = null;
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_ID);
    }

    /**
     * Get all token data (for debugging)
     */
    getTokenData(): Partial<TokenData> {
        return {
            accessToken: this.accessToken || undefined,
            refreshToken: this.getRefreshToken() || undefined,
            expiresAt: this.expiresAt || undefined,
            userId: this.getUserId() || undefined,
        };
    }
}

// Export singleton instance
export const authTokenService = new AuthTokenService();
