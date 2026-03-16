import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:9090/api",
  withCredentials: true, // ✅ allow refresh cookie
});

let isRefreshing = false;

interface QueueItem {
  resolve: () => void;
  reject: (error: unknown) => void;
}

let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
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
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // 🔐 If 401 and not retrying yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // queue all failed requests until refresh finishes
        return new Promise<void>(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh");
        processQueue(null);

        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr);
        window.location.href = "/login"; // ⛔ log out safely
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;