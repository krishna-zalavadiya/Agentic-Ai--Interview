import React from "react";
import axios from "axios";
import { BsRobot } from "react-icons/bs";
import { IoSparklesSharp } from "react-icons/io5";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { auth, provider } from "../utils/firebase";
import { signInWithPopup } from "firebase/auth";
import { useDispatch } from "react-redux";
import { setUserData, clearUserData } from "../redux/userSlice";
const ServerUrl = "http://localhost:8000";

function Auth() {
  const dispatch = useDispatch();
  const handleGoogleAuth = async () => {
    try {

      const response = await signInWithPopup(auth, provider);

      const user = response.user;

      const name = user.displayName;
      const email = user.email;

      const result = await axios.post(
        `${ServerUrl}/api/auth/google`,
        { name, email },
        { withCredentials: true }
      );
      dispatch(setUserData(result.data));

      console.log("Login Success:", result.data);

    } catch (error) {
      console.error("Google authentication failed:", error);
      dispatch(clearUserData());
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f3f3f3] flex items-center justify-center px-6 py-20">

      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-gray-200 p-8"
      >

        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-black text-white p-2 rounded-lg">
            <BsRobot size={18} />
          </div>
          <h2 className="font-semibold text-lg">InterviewIQ.AI</h2>
        </div>

        <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-center leading-snug mb-4">
        Continue with
        </h1>

      <div className="flex justify-center">
           <span className="bg-green-100 text-green-600 px-4 py-2 rounded-full inline-flex items-center gap-2 text-lg md:text-xl font-medium">
            <IoSparklesSharp size={20} />
            AI Smart Interview Assistant
            </span>
      </div>

        <p className="text-gray-500 text-center text-sm md:text-base leading-relaxed mb-8">
          Sign in to your account to continue
        </p>

        <motion.button
          onClick={handleGoogleAuth}
          whileHover={{ opacity: 0.9, scale: 1.05 }}
          whileTap={{ opacity: 1, scale: 0.95 }}
          className="w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full shadow-md"
        >
          <FcGoogle size={18} />
          Sign in with Google
        </motion.button>

      </motion.div>

    </div>
  );
}

export default Auth;