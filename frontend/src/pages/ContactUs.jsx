import { motion } from "framer-motion";
import { Mail, Send, MessageSquareText } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { useLoading } from "../context/LoadingContext";
import SuccessPopup from "../components/ui/success";
import ErrorPage from "./ErrorPage";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const {showLoader,hideLoader}=useLoading();
  const [success,showSuccess]=useState(false);
  const [error,setError]=useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    console.log("check");
    showLoader("sending mail...")
    try{
      const res=await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contact`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify(form)
      })
      if(res.ok)
      {
        showSuccess(true);
      }
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
  };

  if(error)
    return <ErrorPage/>
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-950 text-gray-800 dark:text-white pb-20">
      {/* Header */}
      <header className="max-w-4xl mx-auto px-4 pt-14 pb-10 text-center">
        <motion.h1
          className="text-4xl sm:text-5xl font-bold leading-tight mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Mail className="inline-block w-8 h-8 text-blue-600 mr-2" />
          Contact <span className="text-blue-600">Us</span>
        </motion.h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Got questions, feedback, or ideas? We’d love to hear from you. Fill out the form below and we’ll get back to you soon.
        </p>
      </header>

      {/* Form Section */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              type="text"
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Message
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows="5"
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <Button
            type="submit"
            className="text-base px-6 py-4 flex items-center gap-2 mx-auto"
          >
            Send Message <Send className="w-4 h-4" />
          </Button>
        </motion.form>
      </section>

      {/* Optional Section: Support Note */}
      <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
        <MessageSquareText className="w-5 h-5 inline-block mr-1 text-blue-500" />
        You can also reach us at{" "}
        <a href="mailto:hello@bookbarter.in" className="underline text-blue-600">
          chaturvediavinash2002@gmail.com
        </a>
      </div>

     <SuccessPopup message={"Email sent successfully"} show={success} onClose={()=>showSuccess(false)}/>
    </div>
  );
}
