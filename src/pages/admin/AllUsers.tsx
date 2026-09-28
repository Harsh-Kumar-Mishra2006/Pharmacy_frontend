// src/pages/AllUsers.tsx
import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaUserShield,
  FaUserTie,
  FaUser,
  FaSearch,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaSyncAlt,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import AuthService from "../../services/authService";
import type { User, UserRole } from "../../types";

const AllUsers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ---------- Fetch all users ----------
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AuthService.getAllUsers();
      if (response.success && response.data) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch users");
      }
    } catch (err: any) {
      console.error("Fetch users error:", err);
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchUsers();
    }
  }, [currentUser]);

  // ---------- Filter users ----------
  useEffect(() => {
    let result = [...users];

    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term),
      );
    }

    setFilteredUsers(result);
  }, [searchTerm, roleFilter, users]);

  // ---------- Toggle user status ----------
  const handleToggleStatus = async (userId: string) => {
    setActionLoading(userId);
    try {
      const response = await AuthService.toggleUserStatus(userId);
      if (response.success && response.data) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, is_active: response.data!.is_active } : u,
          ),
        );
      }
    } catch (err: any) {
      alert(err.message || "Failed to toggle status");
    } finally {
      setActionLoading(null);
    }
  };

  // ---------- Delete user ----------
  const handleDeleteUser = async (userId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    setActionLoading(userId);
    try {
      const response = await AuthService.deleteUser(userId);
      if (response.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  // ---------- Update user role ----------
  // const handleRoleChange = async (userId: string, newRole: UserRole) => {
  //   setActionLoading(userId);
  //   try {
  //     const response = await AuthService.updateUserRole(userId, newRole);
  //     if (response.success) {
  //       setUsers((prev) =>
  //         prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
  //       );
  //     }
  //   } catch (err: any) {
  //     alert(err.message || "Failed to update role");
  //   } finally {
  //     setActionLoading(null);
  //   }
  // };

  // ---------- Role badge ----------
  const getRoleBadge = (role: UserRole) => {
    const map: Record<UserRole, { icon: any; classes: string }> = {
      admin: {
        icon: FaUserShield,
        classes: "bg-red-100 text-red-700",
      },
      supplier: {
        icon: FaUserTie,
        classes: "bg-blue-100 text-blue-700",
      },
      user: {
        icon: FaUser,
        classes: "bg-green-100 text-green-700",
      },
    };
    const { icon: Icon, classes } = map[role] || map.user;
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${classes}`}
      >
        <Icon className="text-xs" />
        {role}
      </span>
    );
  };

  // ---------- Guard: admin only ----------
  if (currentUser?.role !== "admin") {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <FaUserShield className="text-6xl text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You must be an admin to view this page.
          </p>
        </div>
      </div>
    );
  }

  // ---------- Stats ----------
  const stats = [
    { icon: FaUsers, label: "Total Users", value: users.length },
    {
      icon: FaUserShield,
      label: "Admins",
      value: users.filter((u) => u.role === "admin").length,
    },
    {
      icon: FaUserTie,
      label: "Suppliers",
      value: users.filter((u) => u.role === "supplier").length,
    },
    {
      icon: FaUser,
      label: "Customers",
      value: users.filter((u) => u.role === "user").length,
    },
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-light-orange/20 via-pink/20 to-sky-blue/20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">All Users</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage all registered users, their roles, and account status.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white rounded-2xl shadow-lg card-hover"
              >
                <stat.icon className="text-4xl text-light-orange mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-800">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-light-orange"
              />
            </div>

            {/* Role filter */}
            <select
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(e.target.value as UserRole | "all")
              }
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-light-orange w-full md:w-48"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="supplier">Supplier</option>
              <option value="user">User</option>
            </select>

            {/* Refresh */}
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 px-5 py-3 bg-light-orange text-white rounded-xl hover:opacity-90 transition"
            >
              <FaSyncAlt />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {/* Users Table */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-16 text-gray-500">
              Loading users...
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-500">{error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg text-gray-500">
              No users found.
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 transition">
                        {/* User */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {u.profile_picture ? (
                              <img
                                src={u.profile_picture}
                                alt={u.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-light-orange/20 flex items-center justify-center text-light-orange font-bold">
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-gray-800">
                                {u.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {u.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <FaEnvelope className="text-gray-400" />
                            {u.email}
                          </div>
                          {u.phone && (
                            <div className="flex items-center gap-2 mt-1">
                              <FaPhone className="text-gray-400" />
                              {u.phone}
                            </div>
                          )}
                          {u.address && (
                            <div className="flex items-center gap-2 mt-1">
                              <FaMapMarkerAlt className="text-gray-400" />
                              <span className="truncate max-w-[180px]">
                                {u.address}
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4">{getRoleBadge(u.role)}</td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              u.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {u.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {u.id !== currentUser?.id && (
                              <>
                                <button
                                  onClick={() => handleToggleStatus(u.id)}
                                  disabled={actionLoading === u.id}
                                  title={
                                    u.is_active ? "Deactivate" : "Activate"
                                  }
                                  className={`p-2 rounded-lg transition ${
                                    u.is_active
                                      ? "text-green-600 hover:bg-green-50"
                                      : "text-gray-400 hover:bg-gray-50"
                                  }`}
                                >
                                  {u.is_active ? (
                                    <FaToggleOn className="text-xl" />
                                  ) : (
                                    <FaToggleOff className="text-xl" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.name)}
                                  disabled={actionLoading === u.id}
                                  title="Delete"
                                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition"
                                >
                                  <FaTrash />
                                </button>
                              </>
                            )}
                            {u.id === currentUser?.id && (
                              <span className="text-xs text-gray-400 italic">
                                (You)
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer count */}
              <div className="px-6 py-4 bg-gray-50 text-sm text-gray-500 text-right">
                Showing {filteredUsers.length} of {users.length} users
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AllUsers;
