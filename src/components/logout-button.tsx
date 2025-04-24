import { Button } from "./ui/button";
import { useAuth } from "../lib/auth-context";

export function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Button onClick={handleLogout} variant="outline">
      Logout
    </Button>
  );
} 