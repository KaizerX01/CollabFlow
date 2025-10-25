import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:9090/api",
  withCredentials: true, // ✅ allow refresh cookie
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ⛔ if refresh request itself failed → logout directly
    if (originalRequest.url?.includes("/auth/refresh")) {
      console.warn("Refresh token invalid — logging out.");
      localStorage.removeItem("access_token");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // 🔐 If 401 and not retrying yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // queue all failed requests until refresh finishes
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await api.post("/auth/refresh");
        const newAccessToken = res.data.accessToken;

        localStorage.setItem("access_token", newAccessToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem("access_token");
        window.location.href = "/login"; // ⛔ log out safely
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ✅ Attach access token for each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;