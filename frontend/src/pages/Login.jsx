import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import bookimg from "../assets/bi-removebg-preview.png";
import { useAuth } from "../context/AuthContext"; // adjust path
import { useLoading } from "../context/LoadingContext";
import ErrorPage from "./ErrorPage";
import { useRef } from "react";




function Login() {
  const codeClientRef = useRef(null);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { setUser,setToken } = useAuth();
  const {showLoader,hideLoader}=useLoading();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleLogin = async (e) => {
  e.preventDefault();
  showLoader("Logging you in...")
  try {
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailOrUsername: email, // can be email or username
        password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    const data = await response.json();
    console.log(data);
    const emailOrUsername=data.emailOrUsername
    console.log(data);
    if (rememberMe) {
      localStorage.setItem("token", data.token);
    } else {
      sessionStorage.setItem("token", data.token);
    }
    setToken(data.token)
    setUser(data.emailOrUsername)// this sets user in contex
    
    navigate("/");
  } catch (err) {
    setError(err?.response?.data?.message || 
  err?.message ||                 
  "Something went wrong.")
  }
  finally{
    hideLoader();
  }
};

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const jwt   = params.get("jwt");
  const error = params.get("error");

  const fetchUserProfile = async (token) => {
    try {
      const res = await axios.get(`${backendUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);                 
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setUser(null);
    }
  };

  if (jwt) {
    rememberMe
      ? localStorage.setItem("token", jwt)
      : sessionStorage.setItem("token", jwt);

    setToken(jwt);
    fetchUserProfile(jwt).then(() => navigate("/"));
  }

  if (error) setError("Google authentication failed. Try again.");
}, []);




 useEffect(() => {
  if (window.google) {
    codeClientRef.current = window.google.accounts.oauth2.initCodeClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'openid email profile',
      ux_mode: 'redirect',
      redirect_uri: `${import.meta.env.VITE_BACKEND_URL}/api/auth/google/cb`, // must be whitelisted in Google Cloud
    });
  }
}, []);

const handleGoogleClick = () => {
  codeClientRef.current.requestCode();
};

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-950 text-gray-800 dark:text-white">
      
      <div className="min-h-screen text-slate-900 flex flex-col items-center justify-center py-6 px-4">
        <div className="grid md:grid-cols-2 items-center gap-10 max-w-6xl max-md:max-w-md w-full">
          <div className="flex-col justify-center items-center">
            <div className="w-full flex items-end overflow-hidden justify-center">
              <img src={bookimg} alt="" className="w-60 h-60 object-contain" />
            </div>
            <h2 className="lg:text-5xl text-3xl font-bold lg:leading-[57px]">
              Welcome to Book Barter!
            </h2>
            <p className="text-sm mt-6 text-slate-500 dark:text-slate-300 leading-relaxed">
              A Smarter Way to Share Books! Earn trust, build your collection, and save money.
            </p>
            <p className="text-sm mt-12 text-slate-500 dark:text-slate-300">
              Don't have an account?
              <Link to="/register" className="text-blue-600 font-medium hover:underline ml-1">
                Register here
              </Link>
            </p>
          </div>

          <form
            className="max-w-md md:ml-auto w-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
            onSubmit={handleLogin}
          >
            <h3 className="text-2xl font-bold mb-6 dark:text-white">Sign in</h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm dark:text-white">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>
                <p
                  onClick={() => navigate("/forgot-password")}
                  className="text-blue-600 hover:underline text-sm cursor-pointer"
                >
                  Forgot password?
                </p>
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 text-white bg-blue-600 hover:bg-blue-700 rounded font-semibold"
              >
                Log in
              </button>
            </div>

            <div className="my-4 flex items-center gap-4">
              <hr className="w-full border-slate-300" />
              <p className="text-sm text-slate-800 text-center dark:text-white">or</p>
              <hr className="w-full border-slate-300" />
            </div>

            <button
  type="button"
  onClick={handleGoogleClick}
  className="w-full py-2 px-4 rounded bg-white border flex items-center justify-center gap-2 hover:shadow-md"
>
  <img src="/google-icon-logo-svgrepo-com.svg" alt="" className="h-5 w-5" />
  <span className="font-medium text-slate-700 dark:text-slate-200">
    Continue with Google
  </span>
</button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
