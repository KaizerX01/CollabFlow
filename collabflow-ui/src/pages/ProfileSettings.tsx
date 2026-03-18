import React, { useState, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ArrowLeft,
  User,
  Shield,
  Loader2,
  Camera,
  Mail,
  AtSign,
  Calendar,
  Save,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../context/AuthContext";
import { useUpdateProfile, useChangePassword } from "../hooks/useUser";
import { useToast } from "../hooks/use-toast";
import { isAxiosError } from "axios";

const PremiumBackground = lazy(() =>
  import("../components/PremiumBackground").then((m) => ({
    default: m.PremiumBackground,
  }))
);

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

type SettingsTab = "profile" | "security";

export const ProfileSettings: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, setUser } = useAuth();
  const { showToast } = useToast();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Profile form state
  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || "");

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const handleProfileSave = async () => {
    try {
      const updated = await updateProfileMutation.mutateAsync({
        displayName,
        bio,
        avatarUrl,
      });
      setUser(updated);
      showToast("success", "Profile updated successfully");
    } catch (err) {
      const msg = isAxiosError(err) ? err.response?.data?.message : undefined;
      showToast("error", msg || "Failed to update profile");
    }
  };

  const handlePasswordChange = async (data: PasswordFormData) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      showToast("success", "Password changed successfully");
      passwordForm.reset();
    } catch (err) {
      const msg = isAxiosError(err) ? err.response?.data?.message : undefined;
      showToast("error", msg || "Failed to change password");
    }
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
    { id: "security", label: "Security", icon: <Shield className="h-4 w-4" /> },
  ];

  const getInitials = () => {
    const name = displayName || currentUser?.username || "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <PremiumBackground variant="teams" intensity="low">
      <div className="min-h-screen relative overflow-hidden">
        <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>

            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="mt-2 text-lg text-slate-400">
              Manage your account and preferences
            </p>
          </motion.div>

          {/* Layout */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar tabs */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="md:w-56 flex-shrink-0"
            >
              <nav className="flex md:flex-col gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-white/10 text-white border border-white/10"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex-1 min-w-0"
            >
              {activeTab === "profile" && (
                <div className="space-y-8">
                  {/* Avatar section */}
                  <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-6">
                      Profile Picture
                    </h2>
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            getInitials()
                          )}
                        </div>
                        <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <Label className="text-slate-300 text-sm mb-2 block">
                          Avatar URL
                        </Label>
                        <Input
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          placeholder="https://example.com/avatar.png"
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Profile info */}
                  <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-6">
                      Profile Information
                    </h2>
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-sm flex items-center gap-2">
                          <User className="h-3.5 w-3.5" />
                          Display Name
                        </Label>
                        <Input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Your display name"
                          maxLength={100}
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300 text-sm">Bio</Label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell us about yourself..."
                          maxLength={500}
                          rows={3}
                          className="w-full rounded-md bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 px-3 py-2 text-sm resize-none outline-none"
                        />
                        <p className="text-xs text-slate-500 text-right">
                          {bio.length}/500
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label className="text-slate-300 text-sm flex items-center gap-2">
                            <AtSign className="h-3.5 w-3.5" />
                            Username
                          </Label>
                          <Input
                            value={currentUser?.username || ""}
                            disabled
                            className="bg-white/[0.02] border-white/5 text-slate-500 cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300 text-sm flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5" />
                            Email
                          </Label>
                          <Input
                            value={currentUser?.email || ""}
                            disabled
                            className="bg-white/[0.02] border-white/5 text-slate-500 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button
                          onClick={handleProfileSave}
                          disabled={updateProfileMutation.isPending}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 text-white font-medium px-6"
                        >
                          {updateProfileMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-8">
                  <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-2">
                      Change Password
                    </h2>
                    <p className="text-sm text-slate-400 mb-6">
                      Update your password to keep your account secure
                    </p>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-sm flex items-center gap-2">
                          <Lock className="h-3.5 w-3.5" />
                          Current Password
                        </Label>
                        <Input
                          type="password"
                          placeholder="Enter current password"
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                          {...passwordForm.register("currentPassword")}
                        />
                        {passwordForm.formState.errors.currentPassword && (
                          <p className="text-red-400 text-sm">
                            {passwordForm.formState.errors.currentPassword.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300 text-sm flex items-center gap-2">
                          <Lock className="h-3.5 w-3.5" />
                          New Password
                        </Label>
                        <Input
                          type="password"
                          placeholder="Enter new password"
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                          {...passwordForm.register("newPassword")}
                        />
                        {passwordForm.formState.errors.newPassword && (
                          <p className="text-red-400 text-sm">
                            {passwordForm.formState.errors.newPassword.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300 text-sm flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Confirm New Password
                        </Label>
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                          {...passwordForm.register("confirmPassword")}
                        />
                        {passwordForm.formState.errors.confirmPassword && (
                          <p className="text-red-400 text-sm">
                            {passwordForm.formState.errors.confirmPassword.message}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button
                          onClick={passwordForm.handleSubmit(handlePasswordChange)}
                          disabled={changePasswordMutation.isPending}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 text-white font-medium px-6"
                        >
                          {changePasswordMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Shield className="mr-2 h-4 w-4" />
                              Update Password
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Account info */}
                  <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">
                      Account Information
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                          Username
                        </p>
                        <p className="text-white font-medium flex items-center gap-2">
                          <AtSign className="h-4 w-4 text-slate-400" />
                          {currentUser?.username}
                        </p>
                      </div>
                      <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                          Email
                        </p>
                        <p className="text-white font-medium flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          {currentUser?.email}
                        </p>
                      </div>
                      <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                          User ID
                        </p>
                        <p className="text-slate-400 font-mono text-sm truncate">
                          {currentUser?.id}
                        </p>
                      </div>
                      <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                          Account Status
                        </p>
                        <p className="text-emerald-400 font-medium flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          Active
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
};
