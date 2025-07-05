
import LandingPage from "./pages/LandingPage"
import ExploreBooks from "./pages/ExploreBooks"
import UploadBook from "./pages/UploadBooks"
import IncomingRequests from "./pages/IncomingRequest"
import Profile from "./pages/Profile"
import Chat from "./pages/Chat"
import MyRequest from "./pages/MyRequest"
import Login from "./pages/Login"
import Register from "./pages/Register"
import AboutPage from "./pages/AboutUs"
import { Routes, Route } from "react-router-dom"
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Header } from "./components/ui/header"
import Footer from "./components/ui/footer"
import NotificationPage from "./pages/Notifications"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import InstallPrompt from "./components/util/InstallPrompt"
function App() {
  useEffect(() => {
  const handler = (e) => {
    console.log("beforeinstallprompt event fired!");
    e.preventDefault();
    window.deferredPrompt = e;
  };

  window.addEventListener("beforeinstallprompt", handler);

  return () => {
    window.removeEventListener("beforeinstallprompt", handler);
  };
}, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Header />

      {/* This main ensures the Routes take up full vertical space */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/browse" element={<ExploreBooks />} />
          <Route path="/upload" element={<UploadBook />} />
          <Route path="/ir" element={<IncomingRequests />} />
          <Route path="/chat/:userId" element={<Chat />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/mr" element={<MyRequest />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/notifications" element={<NotificationPage />} />
          <Route path="/about" element={<AboutPage />}/>
          <Route path="/forgot-password" element={<ForgotPassword/>}/>
          <Route path="/reset-password" element={<ResetPassword/>}/>
        </Routes>
      </main>

      <Footer />
      <ToastContainer position="top-center" autoClose={2000} />
      <InstallPrompt/>
    </div>
  );
}

export default App;

