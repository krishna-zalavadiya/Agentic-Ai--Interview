import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";

export const ServerUrl = "http://localhost:8000";

function App() {

  useEffect(() => {
    const getUser = async () => {
      try {

        const res = await fetch(`${ServerUrl}/api/user/current-user`, {
          method: "GET",
          credentials: "include"
        });

        const data = await res.json();
        console.log(data);

      } catch (err) {
        console.error(err);
      }
    };

    getUser();

  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
    </Routes>
  );
}

export default App;