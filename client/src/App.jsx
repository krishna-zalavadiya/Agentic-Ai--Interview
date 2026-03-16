import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import { useDispatch } from "react-redux";
import { setUserData, clearUserData } from "./redux/userSlice";
import InterviewPage from "./pages/InterviewPageAi";
export const ServerUrl = "https://agentic-ai-interview.onrender.com";
import './index.css'
function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    const getUser = async () => {
      try {

        const res = await fetch(`${ServerUrl}/api/user/current-user`, {
          method: "GET",
          credentials: "include"
        });

        const data = await res.json();

        dispatch(setUserData(data));

      } catch (err) {
        console.error(err);
        dispatch(clearUserData());
      }
    };

    getUser();

  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/interview" element={<InterviewPage />} />
    </Routes>
  );
}

export default App;