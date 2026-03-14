import React, { useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { FaRobot, FaUserAstronaut } from "react-icons/fa";
import { BsCoin } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setUserData } from "../redux/userSlice";
import { ServerUrl } from "../App";
import AuthModel from "../components/AuthModel";

function Navbar() {

  const { userData } = useSelector((state) => state.user);

  const [showCreditPopup, setShowCreditPopup] = React.useState(false);
  const [showUserPopup, setShowUserPopup] = React.useState(false);
  const [showAuth,setShowAuth] = React.useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const navbarRef = useRef(null);

  // 🔹 Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setShowCreditPopup(false);
        setShowUserPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {

      await axios.get(ServerUrl + "/api/auth/logout", {
        withCredentials: true,
      });

      dispatch(setUserData(null));

      setShowCreditPopup(false);
      setShowUserPopup(false);

      navigate("/");

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-[#f3f3f3] flex justify-center px-4 pt-6">

      <motion.div
        ref={navbarRef}
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-6xl bg-white rounded-[24px] shadow-sm border border-gray-200 px-8 py-4 flex justify-between items-center relative"
      >

        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="bg-black text-white p-2 rounded-lg">
            <FaRobot size={24} />
          </div>

          <h1 className="font-semibold hidden md:block text-lg">
            AI Assistant
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-6">

          {/* Coins */}
          <div className="relative">

            <button
              onClick={() => {
                if(!userData?.user) {
                  setShowAuth(true);
                  return;
                }
                setShowCreditPopup(!showCreditPopup);
                setShowUserPopup(false);
              }}
              className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 transition cursor-pointer"
            >
              <BsCoin size={20} />
              {userData?.user?.credit ?? 0} Coins
            </button>

            {showCreditPopup && (
              <div className="absolute right-0 mt-3 w-64 bg-white shadow-xl border border-gray-200 rounded p-5 z-50">

                <p className="text-sm text-gray-600 mb-4">
                  Need more coins? Purchase additional credits to continue enjoying our AI assistant's features.
                </p>

                <button
                  onClick={() => navigate("/pricing")}
                  className="w-full bg-black text-white py-2 rounded-lg text-sm"
                >
                  Purchase Credits
                </button>

              </div>
            )}

          </div>

          {/* Avatar */}
          <div className="relative">

            <button
              onClick={() => {
                if(!userData?.user) {
                    setShowAuth(true);
                    return;
                }
                setShowUserPopup(!showUserPopup);
                setShowCreditPopup(false);
              }}
              className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center text-sm font-semibold cursor-pointer"
            >
              {userData?.user?.name
                ? userData.user.name.charAt(0).toUpperCase()
                : <FaUserAstronaut size={16} />}
            </button>

            {showUserPopup && (
              <div className="absolute right-0 mt-3 w-48 bg-white shadow-xl border border-gray-200 rounded-xl p-4 z-50">

                <p className="text-md text-blue-500 font-medium mb-2">
                  {userData?.user?.name}
                </p>

                <button
                  onClick={() => navigate("/history")}
                  className="w-full text-left text-sm py-2 hover:text-black text-gray-600"
                >
                  Interview History
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left text-sm py-2 flex items-center gap-2 text-red-500"
                >
                  <HiOutlineLogout size={16} />
                  Log Out
                </button>

              </div>
            )}

          </div>

        </div>

      </motion.div>

      {showAuth && <AuthModel onClose={()=> setShowAuth(false)}/>}

    </div>
  );
}

export default Navbar;