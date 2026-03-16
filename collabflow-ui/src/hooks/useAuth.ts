import { useMutation } from "@tanstack/react-query";
import api from "../api/axiosInstance";
import type { User } from "../context/AuthContext";

// Request types
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

// Response types
export interface AuthResponse {
  user: User;
  tokenType: string;
}

export interface RegisterResponse {
  message: string;
  // Or whatever your backend returns on registration
}

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const res = await api.post<RegisterResponse>("/auth/register", data);
      return res.data;
    },
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await api.post<AuthResponse>("/auth/login", data);
      return res.data;
    },
  });
};