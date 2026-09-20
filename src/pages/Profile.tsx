// src/pages/Profile.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaLock,
  FaEdit,
  FaCheck,
  FaTimes,
  FaExclamationCircle,
} from "react-icons/fa";

const Profile: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Sync form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (profileMessage) {
      const timer = setTimeout(() => setProfileMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [profileMessage]);

  useEffect(() => {
    if (passwordMessage) {
      const timer = setTimeout(() => setPasswordMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [passwordMessage]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);

    if (formData.name.trim().length < 2) {
      setProfileMessage({
        type: "error",
        text: "Name must be at least 2 characters",
      });
      return;
    }

    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      setProfileMessage({
        type: "error",
        text: "Phone number must be exactly 10 digits",
      });
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateProfile({
        name: formData.name.trim(),
        phone: formData.phone || undefined,
        address: formData.address || undefined,
      });
      setProfileMessage({
        type: "success",
        text: "Profile updated successfully",
      });
      setIsEditing(false);
    } catch (err: any) {
      setProfileMessage({
        type: "error",
        text: err.message || "Failed to update profile",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({
        type: "error",
        text: "New password must be at least 6 characters",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    setIsSavingPassword(true);
    try {
      await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
      );
      setPasswordMessage({
        type: "success",
        text: "Password changed successfully",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setPasswordMessage({
        type: "error",
        text: err.message || "Failed to change password",
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="md:col-span-2 space-y-8">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Personal Information
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 text-light-orange hover:text-pink transition-colors"
                    >
                      <FaEdit />
                      Edit
                    </button>
                  ) : (
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <FaTimes />
                      Cancel
                    </button>
                  )}
                </div>

                {profileMessage && (
                  <div
                    className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${
                      profileMessage.type === "success"
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    {profileMessage.type === "success" ? (
                      <FaCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <FaExclamationCircle className="text-red-500 mt-0.5 flex-shrink-0" />
                    )}
                    <p
                      className={`text-sm ${
                        profileMessage.type === "success"
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {profileMessage.text}
                    </p>
                  </div>
                )}

                <form onSubmit={handleProfileUpdate}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          disabled={!isEditing}
                          minLength={2}
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border transition ${
                            isEditing
                              ? "border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent"
                              : "border-transparent bg-gray-50"
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          value={user?.email || ""}
                          disabled
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-transparent bg-gray-50 text-gray-500"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              phone: e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 10),
                            })
                          }
                          disabled={!isEditing}
                          maxLength={10}
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border transition ${
                            isEditing
                              ? "border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent"
                              : "border-transparent bg-gray-50"
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <div className="relative">
                        <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                        <textarea
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          rows={3}
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border transition ${
                            isEditing
                              ? "border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent"
                              : "border-transparent bg-gray-50"
                          }`}
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="btn-primary w-full disabled:opacity-50"
                      >
                        {isSavingProfile ? "Saving..." : "Save Changes"}
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Change Password */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Change Password
                </h2>

                {passwordMessage && (
                  <div
                    className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${
                      passwordMessage.type === "success"
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    {passwordMessage.type === "success" ? (
                      <FaCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <FaExclamationCircle className="text-red-500 mt-0.5 flex-shrink-0" />
                    )}
                    <p
                      className={`text-sm ${
                        passwordMessage.type === "success"
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {passwordMessage.text}
                    </p>
                  </div>
                )}

                <form onSubmit={handlePasswordChange}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          required
                          autoComplete="current-password"
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition"
                          placeholder="Enter current password"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                          required
                          minLength={6}
                          autoComplete="new-password"
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition"
                          placeholder="Enter new password"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value,
                            })
                          }
                          required
                          autoComplete="new-password"
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingPassword}
                      className="btn-primary w-full disabled:opacity-50"
                    >
                      {isSavingPassword ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-light-orange to-pink rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  {user?.name}
                </h3>
                <p className="text-gray-500 text-sm">{user?.email}</p>
                <div className="mt-2 inline-block px-3 py-1 bg-light-orange/10 text-light-orange rounded-full text-sm font-semibold capitalize">
                  {user?.role || "User"}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">Account Status</p>
                  <p className="font-medium text-green-600">
                    {user?.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    View Orders
                  </button>
                  <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    Saved Medicines
                  </button>
                  <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
