import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Home,
  User,
  Inbox,
  ClipboardList,
  MessageCircle,
  PlusCircle,
  LogIn,
  UserPlus,
  LogOut,
  X,
  Menu,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/socketContext";
import NotificationBell from "./notificationBell";

const navItems = {
  loggedOut: [
    { name: "Home", icon: Home, href: "/" },
    { name: "Browse Books", icon: BookOpen, href: "/browse" },
    { name: "Login", icon: LogIn, href: "/login" },
    { name: "Get Started", icon: UserPlus, href: "/register", primary: true },
  ],
  loggedIn: [
    { name: "Home", icon: Home, href: "/" },
    { name: "Browse Books", icon: BookOpen, href: "/browse" },
    { name: "Profile", icon: User, href: "/profile" },
    { name: "Incoming Requests", icon: Inbox, href: "/ir" },
    { name: "My Requests", icon: ClipboardList, href: "/mr" },
    { name: "Chat", icon: MessageCircle, href: "/chat" },
    { name: "Add Book", icon: PlusCircle, href: "/upload", primary: true },
    { name: "Logout", icon: LogOut, action: "logout" },
  ],
};

export function Header() {
  const { isLoggedIn, user, setUser } = useAuth();
  const { unseenMessages } = useSocket();
  const navLinks = isLoggedIn ? navItems.loggedIn : navItems.loggedOut;
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location=useLocation();
  const onChat = location.pathname.startsWith("/chat");
  const {socket}=useSocket();

  const handleAction = (action) => {
    if (action === "logout") {
      if (socket) socket.disconnect();
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      setUser(null);
      navigate("/");
    }
  };

  return (
    <header
  className="sm:static fixed top-0 inset-x-0 bg-white dark:bg-gray-900  z-[60] sm:z-30 py-4 px-2 sm:py-6 flex justify-between items-center"
>

      <h1 className="mx-4 text-lg sm:text-2xl font-bold flex items-center gap-2 whitespace-nowrap">
        <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
      </h1>

      <div className="flex flex-row items-center gap-3">
  

  {/* Mobile: Chat icon always visible */}
  {isLoggedIn && (
    <Link to="/chat" className="sm:hidden relative text-gray-700 dark:text-gray-300">
      <MessageCircle size={26} />
      {unseenMessages > 0 && !onChat && (
        <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-red-600 text-white rounded-full px-1.5">
          {unseenMessages}
        </span>
      )}
    </Link>
  )}

  {/* Mobile & Desktop: Notification Bell */}
  {isLoggedIn && (
    <div className="relative">
      <NotificationBell />
    </div>
  )}

  {/* Mobile: Hamburger */}
  <button
    className="sm:hidden text-gray-700 dark:text-gray-300 z-50"
    onClick={() => setMenuOpen(!menuOpen)}
    aria-label="Toggle menu"
  >
    {menuOpen ? <X size={28} /> : <Menu size={28} />}
  </button>
</div>


      <nav className="hidden sm:flex sm:items-center sm:gap-6 text-sm sm:text-base whitespace-nowrap">
        {navLinks.map(({ name, href, action, icon: Icon, primary }, idx) => {
          if (href) {
            const finalHref = href === "/profile" ? `/profile/${user?._id}` : href;
            return (
              <Link
                key={idx}
                to={finalHref}
                onClick={() => setMenuOpen(false)}
                className={`relative flex items-center gap-1 px-3 py-1.5 rounded font-medium transition ${
                  primary
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "text-gray-700 dark:text-gray-300 hover:text-blue-600"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{name}</span>
                {name === "Chat" && unseenMessages > 0 && !onChat && (
       <span className="absolute -top-1 -right-2 text-[10px] font-bold bg-red-600 text-white rounded-full px-1.5">
         {unseenMessages}
       </span>
   )}
              </Link>
            );
          } else {
            return (
              <button
                key={idx}
                onClick={() => handleAction(action)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded font-medium transition ${
                  primary
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "text-gray-700 dark:text-gray-300 hover:text-blue-600"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{name}</span>
              </button>
            );
          }
        })}
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 flex flex-col items-center justify-center gap-8 text-xl text-gray-800 dark:text-gray-100 sm:hidden z-40 p-10">
          {navLinks.map(({ name, href, action, icon: Icon, primary }, idx) => {
            const finalHref = href === "/profile" ? `/profile/${user?._id}` : href;
            if (href) {
              return (
                <Link
                  key={idx}
                  to={finalHref}
                  onClick={() => setMenuOpen(false)}
                  className={`relative flex items-center gap-3 px-6 py-3 rounded font-semibold transition ${
                    primary
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "hover:text-blue-600"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  {name}
                  {name === "Chat" && unseenMessages > 0 && (
                    <span className="absolute -top-1 -right-2 text-xs font-bold bg-red-600 text-white rounded-full px-1.5">
                      {unseenMessages}
                    </span>
                  )}
                </Link>
              );
            } else {
              return (
                <button
                  key={idx}
                  onClick={() => {
                    handleAction(action);
                    setMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-6 py-3 rounded font-semibold transition ${
                    primary
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "hover:text-blue-600"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  {name}
                </button>
              );
            }
          })}
        </div>
      )}
    </header>
  );
}
