import { useState, useEffect } from 'react';

export default function useAuth() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null); // optional

  useEffect(() => {
    const storedToken = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (storedToken) {
      try {
        const decoded = JSON.parse(atob(storedToken.split('.')[1]));
        setToken(storedToken);
        setUser(decoded);
        setUserId(decoded.id);
      } catch (err) {
        console.error("Token decode error:", err);
        logout();
      }
    }
  }, []);

  const login = (newToken, remember) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("token", newToken);
    const decoded = JSON.parse(atob(newToken.split('.')[1]));
    setToken(newToken);
    setUser(decoded);
    setUserId(decoded.id);
  };

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setUserId(null);
  };

  return { token, user, userId, login, logout };
}
