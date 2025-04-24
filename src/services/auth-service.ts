import apiClient from "./api-client";
import { setCookie, getCookie, deleteCookie } from "../utils/cookie-utils";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "../types/interfaces";

const TOKEN_COOKIE = "auth_token";
const USER_COOKIE = "auth_user";

const AuthService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/login", data);

      if (response.data.access_token) {
        setCookie(TOKEN_COOKIE, response.data.access_token);

        const user = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.fullName || response.data.user.name || "",
          role: response.data.user.role,
        };

        setCookie(USER_COOKIE, JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      console.error("Error durante login:", error);
      throw error;
    }
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        "/auth/register",
        data
      );

      if (response.data.access_token) {
        setCookie(TOKEN_COOKIE, response.data.access_token);

        const user = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.fullName || response.data.user.name || "",
          role: response.data.user.role,
        };

        setCookie(USER_COOKIE, JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      console.error("Error durante registro:", error);
      throw error;
    }
  },

  logout(): void {
    deleteCookie(TOKEN_COOKIE);
    deleteCookie(USER_COOKIE);
  },

  getCurrentUser(): User | null {
    const userCookie = getCookie(USER_COOKIE);
    return userCookie ? JSON.parse(userCookie) : null;
  },

  isAuthenticated(): boolean {
    return !!getCookie(TOKEN_COOKIE);
  },

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === "admin" : false;
  },

  getToken(): string | null {
    return getCookie(TOKEN_COOKIE);
  },
};

export default AuthService;
