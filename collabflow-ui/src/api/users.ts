import { api as apiClient } from "./axiosInstance";
import type { User } from "../context/AuthContext";

export interface UpdateProfileData {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

const usersApi = {
  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<User>("/users/me");
    return data;
  },

  updateProfile: async (payload: UpdateProfileData): Promise<User> => {
    const { data } = await apiClient.patch<User>("/users/me/profile", payload);
    return data;
  },

  changePassword: async (payload: ChangePasswordData): Promise<{ message: string }> => {
    const { data } = await apiClient.patch<{ message: string }>("/users/me/password", payload);
    return data;
  },
};

export default usersApi;
