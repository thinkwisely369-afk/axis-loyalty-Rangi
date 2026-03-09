// API Configuration
export const API_URL = "https://axisloyalty.cloud/api";
export const API_TOKEN = "axis_loyalty_secure_token_2024"; // This should match backend .env API_TOKEN

// Helper function to make authenticated API calls
export const apiCall = async (
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> => {
    const headers = new Headers(options.headers);

    // Add API token to all requests
    headers.set("X-API-Token", API_TOKEN);
    headers.set("Content-Type", "application/json");

    // Add user auth token if available
    const authToken = localStorage.getItem("auth_token");
    if (authToken) {
        headers.set("Authorization", `Bearer ${authToken}`);
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // If token is invalid/expired, clear auth and redirect to login
    if (response.status === 401 && authToken) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        localStorage.removeItem("is_first_login");
        window.location.href = "/login";
    }

    return response;
};

// Helper function for authenticated requests
export const authenticatedApiCall = async (
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> => {
    const authToken = localStorage.getItem("auth_token");

    if (!authToken) {
        throw new Error("No authentication token found");
    }

    return apiCall(endpoint, options);
};
