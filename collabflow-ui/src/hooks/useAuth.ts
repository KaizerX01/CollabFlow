import { useMutation } from "@tanstack/react-query";
import api  from "../api/axiosInstance";

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
    usernameOrEmail:string,
    password:string
}

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const res = await api.post("/auth/register", data);
      return res.data;
    },
  });
};


export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await api.post("/auth/login", data);
      return res.data;
    },
  });
};
