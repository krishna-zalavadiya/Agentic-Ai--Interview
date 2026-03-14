import React from "react";
import { motion } from "framer-motion";
import { FaUser, FaMicrophone, FaChartLine } from "react-icons/fa";
import { FiUpload } from "react-icons/fi";
import axios from "axios";

function Step1SetUp({ onStart }) {

  const [role, setRole] = React.useState("");
  const [experience, setExperience] = React.useState("");
  const [type, setType] = React.useState("Technical Interview");

  const [resume, setResume] = React.useState(null);
  const [resumeData, setResumeData] = React.useState(null);
  const [analyzing, setAnalyzing] = React.useState(false);

  // Resume Upload + Analysis
  const handleResumeUpload = async (file) => {

    try {

      setResume(file);
      setAnalyzing(true);

      const formData = new FormData();
      formData.append("resume", file);

      const response = await axios.post(
  "http://localhost:8000/api/interview/resume",
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data"
    },
    withCredentials: true
  }
);

      const data = response.data;

      setResumeData(data);

      // Autofill form
      setRole(data.role || "");
      setExperience(data.experience || "");

    } catch (error) {

      console.error("Resume analysis failed:", error);

    } finally {

      setAnalyzing(false);

    }
  };

  // Start Interview
  const handleStart = () => {

    onStart({
      role,
      experience,
      type,
      resumeData
    });

  };

  return (

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-gray-100 px-4"
    >

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl grid md:grid-cols-2 overflow-hidden">

        {/* LEFT PANEL */}

        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-green-100 to-green-200 p-10 flex flex-col justify-center"
        >

          <h2 className="text-3xl font-bold mb-4">
            Start Your AI Interview
          </h2>

          <p className="text-gray-700 mb-8">
            Practice real interview scenarios powered by AI. Improve communication,
            technical skills, and confidence.
          </p>

          <div className="space-y-4">

            <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm">
              <FaUser className="text-green-600" />
              <span>Choose Role & Experience</span>
            </div>

            <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm">
              <FaMicrophone className="text-green-600" />
              <span>Smart Voice Interview</span>
            </div>

            <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm">
              <FaChartLine className="text-green-600" />
              <span>Performance Analytics</span>
            </div>

          </div>

        </motion.div>

        {/* RIGHT PANEL */}

        <motion.div
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="p-10"
        >

          <h2 className="text-2xl font-semibold mb-6">
            Interview Setup
          </h2>

          {/* Role */}

          <input
            type="text"
            placeholder="Enter role"
            className="w-full border rounded-lg px-4 py-3 mb-4"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />

          {/* Experience */}

          <input
            type="text"
            placeholder="Experience (e.g. 2 years)"
            className="w-full border rounded-lg px-4 py-3 mb-4"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />

          {/* Interview Type */}

          <select
            className="w-full border rounded-lg px-4 py-3 mb-6"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option>Technical Interview</option>
            <option>HR Interview</option>
            <option>Mixed Interview</option>
          </select>

          {/* Resume Upload */}

          <label className="border-2 border-dashed border-green-400 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-green-50 transition mb-6">

            <FiUpload size={28} className="text-green-600 mb-2" />

            {analyzing ? (

              <p className="text-green-600 text-sm">
                Analyzing resume...
              </p>

            ) : resume ? (

              <p className="text-green-700 font-medium text-sm">
                ✔ {resume.name}
              </p>

            ) : (

              <p className="text-gray-600 text-sm">
                Click to upload resume (Optional)
              </p>

            )}

            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) handleResumeUpload(file);
              }}
            />

          </label>

          {/* Resume Analysis Result */}

          {resumeData && (

            <div className="bg-gray-50 border rounded-xl p-4 mb-6">

              <h3 className="text-sm font-semibold mb-3">
                Resume Analysis Result
              </h3>

              {/* Projects */}

              {resumeData.projects?.length > 0 && (

                <div className="mb-3">

                  <p className="text-xs text-gray-500 mb-1">
                    Projects:
                  </p>

                  <ul className="list-disc list-inside text-sm text-gray-700">

                    {resumeData.projects.map((project, index) => (
                      <li key={index}>{project}</li>
                    ))}

                  </ul>

                </div>

              )}

              {/* Skills */}

              {resumeData.skills?.length > 0 && (

                <div>

                  <p className="text-xs text-gray-500 mb-2">
                    Skills:
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {resumeData.skills.map((skill, index) => (

                      <span
                        key={index}
                        className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md"
                      >
                        {skill}
                      </span>

                    ))}

                  </div>

                </div>

              )}

            </div>

          )}

          {/* Start Interview Button */}

          <button
            onClick={handleStart}
            disabled={analyzing}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >

            {analyzing ? "Analyzing Resume..." : "Start Interview"}

          </button>

        </motion.div>

      </div>

    </motion.div>

  );

}

export default Step1SetUp;