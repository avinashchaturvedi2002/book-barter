import { createContext, useContext, useState } from "react";
import LoadingSpinner from "../components/ui/LoadingScreen";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Just a moment…");

  const showLoader = (customMessage = "Just a moment…") => {
    setMessage(customMessage);
    setLoading(true);
  };

  const hideLoader = () => {
    setLoading(false);
    setMessage("Just a moment…"); // reset
  };

  return (
    <LoadingContext.Provider value={{ showLoader, hideLoader }}>
      {loading && <LoadingSpinner fullscreen message={message} />}
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
