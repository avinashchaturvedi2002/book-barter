import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLoading } from "../../context/LoadingContext";
import ErrorPage from "../../pages/ErrorPage";

export default function LentBooks() {
  const [lent, setLent] = useState([]);
  const {showLoader,hideLoader}=useLoading();
  const [error,setError]=useState();
  useEffect(() => {
    const fetchData = async () => {
      showLoader("fetching your lent books...")
      try{
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/getMyLentBooks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log(data);
      setLent([...data.lentBooks,...data.lentOnSecurity]);
      }
      catch(err)
      {
        setError(err?.response?.data?.message || 
  err?.message ||                 
  "Something went wrong.")
      }
      finally
      {
        hideLoader();
      }
      
    };

    fetchData();
  }, []);

  if(error) return <ErrorPage/>

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      {lent.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {lent.map((ex) => (
            <div
              key={ex.exchangeId}
              className="overflow-hidden rounded-2xl shadow-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 flex flex-col"
            >
              {/*─ Cover image ─*/}
              <div className="relative">
                <img
                  src={ex.book.imageUrl}
                  alt={ex.book.title}
                  className="w-full h-56 object-contain bg-gradient-to-b from-zinc-100 to-white dark:from-zinc-700 dark:to-zinc-800"
                />

                {/* Role badge */}
                <span className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm text-white tracking-wide bg-amber-600">
                  {ex.role === "borrower" ? "Borrower" : "Lender"}
                </span>
              </div>

              {/*─ Main details ─*/}
              <div className="p-4 flex flex-col gap-2 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                  {ex.book.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  by {ex.book.author}
                </p>

                {/* Exchange info */}
                {ex.exchangedFor?(
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <img
                      src={ex.exchangedFor.imageUrl}
                      alt={ex.exchangedFor.title}
                      className="w-8 h-10 object-contain rounded border"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Exchanged for:</span>{" "}
                      {ex.exchangedFor.title} by {ex.exchangedFor.author}
                    </span>
                  </div>
                ):(<span className="text-gray-700 dark:text-gray-300 mt-5">You have lent it on security money</span>)}

                <hr className="my-2 border-zinc-200 dark:border-zinc-700" />
                <Link to={`/chat/${ex.currentHolder._id}`}>
                                  <p className="text-sm text-blue-600 dark:text-gray-300 underline">
                  <span className="font-medium">Chat with: </span> {ex.currentHolder.name}
                </p>
                </Link>


                {ex.returnBy && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Return by:</span>{" "}
                    {new Date(ex.returnBy).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 dark:text-gray-400">
          No books currently lent.
        </p>
      )}
    </div>
  );
}
