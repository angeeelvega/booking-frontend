import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { toast } from "../hooks/use-toast";
import AuthService from "../services/auth-service";
import { clearAuthCookies } from "../utils/cookie-utils";
import { AuthContextType, User } from "../types/interfaces";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        const hasToken = AuthService.isAuthenticated();

        if (hasToken) {
          const currentUser = AuthService.getCurrentUser();

          if (currentUser) {
            setUser(currentUser);
          } else {
            clearAuthCookies();
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        clearAuthCookies();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await AuthService.login({ email, password });
      setUser(AuthService.getCurrentUser());

      toast({
        title: "Login successful",
        description: response.message || "Welcome back!",
      });

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Invalid email or password";

      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: "admin" | "user" = "user"
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await AuthService.register({
        full_name: name,
        email,
        password,
        role,
      });
      setUser(AuthService.getCurrentUser());

      toast({
        title: "Registration successful",
        description: response.message || "Welcome to Event Booking App!",
      });

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error creating account";

      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();

    clearAuthCookies();

    setUser(null);

    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });

    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        loading,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
