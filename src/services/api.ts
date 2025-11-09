import axios from 'axios';
import { 
  ApprovalStatus,
  ApprovalCheckResponse,
  LoginResponse,
  SignupResponse
} from '../types/api.types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configure axios to always send the token if it exists
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, { email, password });
  return response.data;
};

export const signup = async (name: string, email: string, password: string): Promise<SignupResponse> => {
  const response = await axios.post<SignupResponse>(`${API_URL}/auth/signup`, { name, email, password });
  return response.data;
};

export const checkApprovalStatus = async (): Promise<ApprovalCheckResponse> => {
  try {
    const response = await axios.get<ApprovalCheckResponse>(`${API_URL}/auth/check-approval`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to check approval status');
    }
    throw error;
  }
};