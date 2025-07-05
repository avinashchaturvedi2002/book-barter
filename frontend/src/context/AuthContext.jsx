import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    sessionStorage.getItem("token") || localStorage.getItem("token")
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ NEW

  const isLoggedIn = !!user;

  const verifyToken = async (incomingToken) => {
    if (!incomingToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify`, {
        headers: {
          Authorization: `Bearer ${incomingToken}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUser(data.user);
    } catch (err) {
      console.error("Token verification failed:", err.message);
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false); // ✅ Done verifying
    }
  };

  useEffect(() => {
    verifyToken(token);
  }, [token]);

  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = sessionStorage.getItem("token") || localStorage.getItem("token");
      setToken(newToken);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken, user, setUser, isLoggedIn, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
