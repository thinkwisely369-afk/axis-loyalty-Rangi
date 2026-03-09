// API Configuration
export const API_URL = "https://axisloyalty.cloud/api";
export const API_TOKEN = "axis_loyalty_secure_token_2024";

// Helper function to make authenticated API calls
export const apiCall = async (endpoint, options = {}) => {
    const headers = new Headers(options.headers);
    headers.set("X-API-Token", API_TOKEN);
    headers.set("Content-Type", "application/json");
    const authToken = localStorage.getItem("auth_token");
    if (authToken) {
        headers.set("Authorization", `Bearer ${authToken}`);
    }
    return fetch(`${API_URL}${endpoint}`, { ...options, headers });
};

export const authenticatedApiCall = async (endpoint, options = {}) => {
    const authToken = localStorage.getItem("auth_token");
    if (!authToken) {
        throw new Error("No authentication token found");
    }
    return apiCall(endpoint, options);
};
