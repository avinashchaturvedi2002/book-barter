import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import RatingSection from "../components/profile/RatingSection.jsx";
import BorrowedBooks from "../components/Tabs/BorrowedBooks";
import LentBooks  from "../components/Tabs/LentBooks";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../context/LoadingContext";
import ErrorPage from "./ErrorPage";
import UploadedBooksGrid from "../components/profile/UploadedBooksGrid";
import SwapHistoryGrid from "../components/profile/SwapHistoryGrid";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileTabs from "../components/profile/ProfileTabs";


export default function Profile() {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState("uploaded");
  const [profilePic, setProfilePic] = useState("");
  const [ratingStars, setRatingStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const{showLoader,hideLoader}=useLoading();
  const [error, setError] = useState(null);
  const [swapHistory, setSwapHistory]=useState([]);
  const [purchaseHistory,setPurchaseHistory]=useState([]);
  const [isOwnProfile,setIsOwnProfile]=useState(false)
  const navigate=useNavigate();

  // Fetch user profile data
  const fetchUserProfile = async () => {
    showLoader("Fetching profile data...")
      try {
        const token=sessionStorage.getItem("token")||localStorage.getItem("token")
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
        const data = await response.json();
        console.log(data);
        
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch profile");
        }
        setUserData(data.user);
        setSwapHistory(data.swapHistory);
        setPurchaseHistory(data.purchaseHistory);
        setProfilePic(data.user.profileImage);
        
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
  setActiveTab("uploaded");
}, [isOwnProfile]);
  useEffect(() => {
    

    const checkOwnProfile=async()=>{

      try {
        const token=sessionStorage.getItem("token")||localStorage.getItem("token")
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data=await res.json();
      console.log(data);
      setIsOwnProfile(data.user._id==userId);
    } catch (err) {
      setError(err?.response?.data?.message || 
  err?.message ||                 
  "Something went wrong.")
    }
    }

    fetchUserProfile();
    checkOwnProfile();
  }, [userId]);

  // Handle profile pic change
  async function handleProfilePicChange(e) {
    showLoader("Uploading Your Profile Picture...")
    try{
      const file = e.target.files[0];
      console.log(profilePic);
       const token=sessionStorage.getItem("token")||localStorage.getItem("token")
    const formData=new FormData();
    formData.append("profilePic",file)
    const res=await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/update-profile-pic`,{
      method:"PUT",
      headers:{
        Authorization:`Bearer ${token}`
      },
      body:formData
    })
    const data=await res.json();
    fetchUserProfile();
    console.log(data);
    }
    catch(err)
    {
      setError(err?.response?.data?.message || 
  err?.message ||                 
  "Something went wrong.")
    }
    finally{
      hideLoader();
    }
   
  }


  if (error) {
    return <ErrorPage message={error}/>
  }

  if (!userData) {
    return <div>User not found</div>;
  }

 

  return (
    <div className="w-full px-4 sm:px-6 py-6">
    
      <ProfileHeader userData={userData}
  isOwnProfile={isOwnProfile}
  profilePic={profilePic}
  handleProfilePicChange={handleProfilePicChange}
  userId={userId}
  navigate={navigate} 
  setActiveTab={setActiveTab}/>
<ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} isOwnProfile={isOwnProfile} />
{activeTab === "uploaded" && <UploadedBooksGrid books={userData.books} isOwnProfile={isOwnProfile} />}
{activeTab === "history" && <SwapHistoryGrid swapHistory={swapHistory} />}
{activeTab === "rating" && <RatingSection userId={userId} isOwnProfile={isOwnProfile} />}
{activeTab === "borrowed" && isOwnProfile && <BorrowedBooks />}
{activeTab === "lent" && isOwnProfile && <LentBooks />}
    </div>
  );
}


