import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import usersApi from "../api/users";
import type { UpdateProfileData, ChangePasswordData } from "../api/users";
import { useAuth } from "../context/AuthContext";

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: usersApi.getMe,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: (payload: UpdateProfileData) => usersApi.updateProfile(payload),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (payload: ChangePasswordData) => usersApi.changePassword(payload),
  });
};
