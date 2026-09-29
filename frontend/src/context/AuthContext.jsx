import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const ROLE_OPTIONS = [
  'Admin',
  'HR',
  'Manager',
  'Tester',
  'Marketing',
  'Sales',
  'Analyst',
  'Front Desk',
  'Frontend Developer',
  'Backend Developer',
  'Intern',
  'Employee',
];

export const DESIGNATION_OPTIONS = [
  'Junior',
  'Senior',
  'Assistant',
  'Associate',
  'Trainee',
  'Intern',
];

// Sample Preset Profile Avatars
export const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
];

// Default Mock Accounts
const DEFAULT_MOCK_USERS = [
  {
    _id: 'u-101',
    name: 'Alex Rivera',
    email: 'admin@example.com',
    password: 'password123',
    role: 'Admin',
    designation: 'Senior',
    avatar: PRESET_AVATARS[0],
    token: 'mock-jwt-admin-token-12345',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'u-102',
    name: 'Sarah Connor',
    email: 'manager@example.com',
    password: 'password123',
    role: 'Manager',
    designation: 'Senior',
    avatar: PRESET_AVATARS[2],
    token: 'mock-jwt-manager-token-67890',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'u-103',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'Frontend Developer',
    designation: 'Associate',
    avatar: PRESET_AVATARS[1],
    token: 'mock-jwt-emp-token-11223',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'u-104',
    name: 'Emily Watson',
    email: 'emily@example.com',
    password: 'password123',
    role: 'Tester',
    designation: 'Junior',
    avatar: PRESET_AVATARS[4],
    token: 'mock-jwt-emp-token-44556',
    createdAt: new Date().toISOString(),
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('task_app_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(false);

  // Persist users list in localStorage so edits persist across page refresh
  const [usersList, setUsersList] = useState(() => {
    const savedList = localStorage.getItem('task_app_mock_users');
    return savedList ? JSON.parse(savedList) : DEFAULT_MOCK_USERS;
  });

  const saveUsersList = (list) => {
    setUsersList(list);
    localStorage.setItem('task_app_mock_users', JSON.stringify(list));
  };

  // Sync users list from API if backend is running
  const fetchAllUsers = async () => {
    try {
      const res = await API.get('/auth/users');
      if (res.data && res.data.data) {
        saveUsersList(res.data.data);
      }
    } catch (err) {
      // Keep persistent local list
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllUsers();
    }
  }, [user]);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      const userData = res.data.data;
      setUser(userData);
      localStorage.setItem('task_app_user', JSON.stringify(userData));
      setLoading(false);
      return { success: true, user: userData };
    } catch (error) {
      const foundMock = usersList.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (foundMock) {
        const userData = { ...foundMock };
        setUser(userData);
        localStorage.setItem('task_app_user', JSON.stringify(userData));
        setLoading(false);
        return { success: true, user: userData, isMock: true };
      }

      // If DB is offline (503) or backend unavailable, fallback to instant mock session
      if (error.response?.status === 503 || !error.response) {
        const mockFallbackUser = {
          _id: `u-${Date.now()}`,
          name: email.split('@')[0] ? email.split('@')[0].toUpperCase() : 'Admin User',
          email,
          role: email.includes('admin') ? 'Admin' : email.includes('manager') ? 'Manager' : 'Employee',
          designation: 'Senior',
          token: `mock-jwt-token-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        setUser(mockFallbackUser);
        localStorage.setItem('task_app_user', JSON.stringify(mockFallbackUser));
        setLoading(false);
        return { success: true, user: mockFallbackUser, isMock: true };
      }

      setLoading(false);
      const msg = error.response?.data?.message || 'Invalid credentials';
      return { success: false, message: msg };
    }
  };

  // Register handler
  const register = async (name, email, password, role = 'Employee', designation = 'Associate', avatar = '') => {
    setLoading(true);
    try {
      const res = await API.post('/auth/register', { name, email, password, role, designation, avatar });
      const userData = res.data.data;
      setUser(userData);
      localStorage.setItem('task_app_user', JSON.stringify(userData));
      setLoading(false);
      return { success: true, user: userData };
    } catch (error) {
      const newUser = {
        _id: `u-${Date.now()}`,
        name,
        email,
        password,
        role,
        designation: designation || 'Associate',
        avatar: avatar || PRESET_AVATARS[0],
        token: `mock-jwt-token-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      const updatedList = [...usersList, newUser];
      saveUsersList(updatedList);
      setUser(newUser);
      localStorage.setItem('task_app_user', JSON.stringify(newUser));
      setLoading(false);
      return { success: true, user: newUser, isMock: true };
    }
  };

  // Create new team member (Admin/Manager action without changing active session)
  const createUserByAdmin = async (userData) => {
    try {
      const res = await API.post('/auth/register', userData);
      fetchAllUsers();
      return { success: true, data: res.data.data };
    } catch (error) {
      const newUser = {
        _id: `u-${Date.now()}`,
        name: userData.name,
        email: userData.email,
        password: userData.password || 'password123',
        role: userData.role || 'Employee',
        designation: userData.designation || 'Associate',
        avatar: userData.avatar || PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)],
        createdAt: new Date().toISOString(),
      };
      const updatedList = [...usersList, newUser];
      saveUsersList(updatedList);
      return { success: true, user: newUser, isMock: true };
    }
  };

  // Update Profile & Credentials for logged in user
  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const res = await API.put('/auth/profile', profileData);
      const updatedData = { ...user, ...res.data.data };
      setUser(updatedData);
      localStorage.setItem('task_app_user', JSON.stringify(updatedData));
      fetchAllUsers();
      setLoading(false);
      return { success: true, user: updatedData };
    } catch (error) {
      const updatedData = { ...user, ...profileData };
      setUser(updatedData);
      localStorage.setItem('task_app_user', JSON.stringify(updatedData));

      const updatedList = usersList.map((u) => (u._id === user._id ? { ...u, ...profileData } : u));
      saveUsersList(updatedList);
      setLoading(false);
      return { success: true, user: updatedData, isMock: true };
    }
  };

  // Admin Update User Credentials & Profile
  const updateUserByAdmin = async (userId, userData) => {
    try {
      const res = await API.put(`/auth/users/${userId}`, userData);
      fetchAllUsers();
      if (userId === user?._id) {
        const updatedSelf = { ...user, ...userData };
        setUser(updatedSelf);
        localStorage.setItem('task_app_user', JSON.stringify(updatedSelf));
      }
      return { success: true, data: res.data.data };
    } catch (error) {
      const updatedList = usersList.map((u) => (u._id === userId ? { ...u, ...userData } : u));
      saveUsersList(updatedList);
      if (userId === user?._id) {
        const updatedSelf = { ...user, ...userData };
        setUser(updatedSelf);
        localStorage.setItem('task_app_user', JSON.stringify(updatedSelf));
      }
      return { success: true, isMock: true };
    }
  };

  // Admin Delete User Account
  const deleteUserByAdmin = async (userId) => {
    try {
      await API.delete(`/auth/users/${userId}`);
      fetchAllUsers();
      return { success: true };
    } catch (error) {
      const updatedList = usersList.filter((u) => u._id !== userId);
      saveUsersList(updatedList);
      return { success: true, isMock: true };
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    localStorage.removeItem('task_app_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        usersList,
        login,
        register,
        logout,
        updateProfile,
        updateUserByAdmin,
        createUserByAdmin,
        deleteUserByAdmin,
        isAdmin: user?.role === 'Admin',
        isAdminOrManager: ['Admin', 'Manager', 'HR'].includes(user?.role),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
