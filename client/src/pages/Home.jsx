import React from "react";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { HiSparkles } from "react-icons/hi";
import { BsRobot, BsMic, BsClock, BsBarChart, BsFileEarmarkText } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import AuthModel from "../components/AuthModel";

import hrImg from "../assets/HR.png";
import techImg from "../assets/tech.png";
import confidenceImg from "../assets/confi.png";
import creditImg from "../assets/credit.png";
import evalImg from "../assets/ai-ans.png";
import resumeImg from "../assets/resume.png";
import pdfImg from "../assets/pdf.png";
import analyticsImg from "../assets/history.png";
import Footer from "../components/footer";
function Home() {

  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = React.useState(false);

  const steps = [
    {
      icon: <BsRobot size={24} />,
      step: "STEP 1",
      title: "Role & Experience Selection",
      desc: "AI adjusts difficulty based on selected job role."
    },
    {
      icon: <BsMic size={24} />,
      step: "STEP 2",
      title: "Smart Voice Interview",
      desc: "Dynamic follow-up questions based on your answers."
    },
    {
      icon: <BsClock size={24} />,
      step: "STEP 3",
      title: "Timer Based Simulation",
      desc: "Real interview pressure with time tracking."
    }
  ];

  const technologies = [
    {
      image: evalImg,
      icon: <BsBarChart size={20} />,
      title: "AI Answer Evaluation",
      desc: "Scores communication, technical accuracy and confidence."
    },
    {
      image: resumeImg,
      icon: <BsFileEarmarkText size={20} />,
      title: "Resume Based Interview",
      desc: "Project-specific questions based on uploaded resume."
    },
    {
      image: pdfImg,
      icon: <BsFileEarmarkText size={20} />,
      title: "Downloadable PDF Report",
      desc: "Detailed strengths, weaknesses and improvement insights."
    },
    {
      image: analyticsImg,
      icon: <BsBarChart size={20} />,
      title: "History & Analytics",
      desc: "Track progress with performance graph and topic analysis."
    }
  ];

  const interviewModes = [
    {
      image: hrImg,
      title: "HR Interview Mode",
      desc: "Behavioral and communication based evaluation."
    },
    {
      image: techImg,
      title: "Technical Mode",
      desc: "Deep technical questioning based on selected role."
    },
    {
      image: confidenceImg,
      title: "Confidence Detection",
      desc: "Basic tone and voice analysis insights."
    },
    {
      image: creditImg,
      title: "Credits System",
      desc: "Unlock premium interview sessions easily."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex flex-col">

      <Navbar />

      <div className="flex-1 px-6 py-20">
        <div className="max-w-6xl mx-auto">

          {/* Top Badge */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 bg-gray-100 text-gray-600 text-sm px-6 py-2 rounded-full font-medium">
              <HiSparkles size={29} className="text-green-600" />
              AI Powered Smart Interview Platform
            </div>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-28">

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-semibold leading-tight max-w-4xl mx-auto"
            >
              Practice Interviews with
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="mt-4"
            >
              <span className="bg-green-100 text-green-600 px-6 py-2 rounded-full text-3xl md:text-5xl font-semibold inline-block">
                AI Intelligence
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-gray-500 text-lg md:text-xl mt-6 max-w-2xl mx-auto"
            >
              Role-based mock smart follow-up questions, instant feedback,
              and personalized interview coaching to help you succeed.
            </motion.p>

            {/* Buttons */}
            <div className="flex flex-wrap justify-center mt-10 gap-4">

              <motion.button
                onClick={() => {
                  if (!userData?.user) {
                    setShowAuth(true);
                    return;
                  }
                  navigate("/interview");
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors"
              >
                Get Started
              </motion.button>

              <motion.button
                onClick={() => {
                  if (!userData?.user) {
                    setShowAuth(true);
                    return;
                  }
                  navigate("/history");
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Interview History
              </motion.button>

            </div>
          </div>

          {/* Steps */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-10 mb-28">

            {steps.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 + index * 0.2 }}
                whileHover={{ rotate: 0, scale: 1.06 }}
                className="relative bg-white rounded-3xl border-2 border-green-100 hover:border-green-500 p-10 w-80 max-w-[90%] shadow-md hover:shadow-2xl transition-all duration-300"
              >

                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white border-2 border-green-500 text-green-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
                  {item.icon}
                </div>

                <div className="pt-10 text-center">
                  <div className="text-xs text-green-600 font-semibold mb-2 tracking-wider">
                    {item.step}
                  </div>

                  <h3 className="font-semibold mb-3 text-lg">
                    {item.title}
                  </h3>

                  <p className="text-sm text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

              </motion.div>
            ))}

          </div>

          {/* Advanced AI Technologies */}
          <div className="mb-32">

            <motion.h2
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-semibold text-center mb-16"
            >
              Advanced AI <span className="text-green-600">Technologies</span>
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-10">

              {technologies.map((item, index) => (

                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all"
                >

                  <div className="flex items-center gap-8">

                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-32 h-32 object-contain"
                    />

                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        {item.title}
                      </h3>

                      <p className="text-gray-500 text-sm">
                        {item.desc}
                      </p>
                    </div>

                  </div>

                </motion.div>

              ))}

            </div>

          </div>

          {/* Multiple Interview Modes */}
          <div className="mb-32">

            <motion.h2
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-semibold text-center mb-16"
            >
              Multiple Interview <span className="text-green-600">Modes</span>
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-8">

              {interviewModes.map((mode, index) => (

                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm hover:shadow-lg transition-all"
                >

                  <div className="flex items-center gap-8">

                    <img
                      src={mode.image}
                      alt={mode.title}
                      className="w-32 h-32 object-contain"
                    />

                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {mode.title}
                      </h3>

                      <p className="text-gray-500 text-sm">
                        {mode.desc}
                      </p>
                    </div>

                  </div>

                </motion.div>

              ))}

            </div>

          </div>

        </div>
      </div>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
      
      <Footer/>
    </div>
  );
}

export default Home;