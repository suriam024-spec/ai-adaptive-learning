import { useEffect, useState } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // TODO: replace with real auth state from API/session.
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated };
}
