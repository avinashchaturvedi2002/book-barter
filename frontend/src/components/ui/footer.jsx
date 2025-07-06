// src/components/ui/Footer.jsx
import { Coffee, BookOpen, ArrowUp } from "lucide-react";
import { FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import BuyCoffeeModal from "../../modals/CoffeeModal";


export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const [showModal,setShowModal]=useState(false)
  const location = useLocation();
  const isChatConversation =
    location.pathname.startsWith("/chat/") &&
    window.innerWidth < 640; // <640px = mobile

  if (isChatConversation) return null;

  return (
    <footer className="bg-blue-50 text-gray-700 w-full dark:text-gray-300 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-2 flex flex-col md:flex-row items-center justify-between text-sm gap-6 md:gap-4 text-center md:text-left">
        
        {/* Left: Logo */}
        <div className="hidden md:flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold">BookBarter@MANIT</span>
        </div>

        {/* Center: Links */}
        <div className="flex flex-col items-center gap-2 ">
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            <ArrowUp className="w-4 h-4" />
            Back to Top
          </button>
          <div className="flex gap-3 text-sm">
            <Link to={"/about"}className="hover:underline">About Us</Link>
            <div className=" mt-1 flex space-x-2">
               <a href="https://www.instagram.com/avinashchaturvedi2002/" target="_blank" rel="noopener noreferrer">
              <FaInstagram className="w-4 h-4 hover:text-pink-500" />
            </a>
            <a href="https://www.linkedin.com/in/avinash-chaturvedi/" target="_blank" rel="noopener noreferrer">
              <FaLinkedin className="w-4 h-4 hover:text-blue-700" />
            </a>
            <a
    href="https://github.com/avinashchaturvedi2002"
    target="_blank"
    rel="noopener noreferrer"

  >
    <FaGithub className="w-4 h-4 hover:text-green-800" />
  </a>

  <a
    href="https://leetcode.com/u/avinashchaturvedi2002"
    target="_blank"
    rel="noopener noreferrer"
  >
    <SiLeetcode className="w-4 h-4 hover:text-orange-500" />
  </a>
            </div>
           
          </div>
          <div className="flex space-x-2">
              <Link to={`/terms`}>Terms and Conditions</Link>
          <Link to={'/privacy'}>Privacy Policy</Link>
          </div>
          
        </div>

        {/* Right: Buy Me a Coffee */}
        <button className="flex items-center gap-1 text-yellow-600 hover:text-yellow-700" onClick={()=>setShowModal(true)}>

        <Coffee className="w-4 h-4" />
          Buy Me a Coffee
        </button>

       <BuyCoffeeModal isOpen={showModal} onClose={() => setShowModal(false)} />
          
        
      </div>
    </footer>
  );
}
