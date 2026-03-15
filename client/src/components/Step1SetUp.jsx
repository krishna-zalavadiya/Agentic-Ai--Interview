import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FaUser, FaMicrophone, FaChartLine } from "react-icons/fa";
import { FiUpload } from "react-icons/fi";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true
});

function Step1SetUp({ onStart }) {

  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [type, setType] = useState("Technical Interview");

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeData, setResumeData] = useState(null);

  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
  const [isStartingInterview, setIsStartingInterview] = useState(false);

  const [error, setError] = useState("");

  const validateFile = (file) => {
    if (!file) return false;

    const isPDF = file.type === "application/pdf";
    const isSmall = file.size < 5 * 1024 * 1024;

    if (!isPDF) {
      alert("Only PDF resumes are allowed.");
      return false;
    }

    if (!isSmall) {
      alert("Resume must be smaller than 5MB.");
      return false;
    }

    return true;
  };

  const handleResumeUpload = useCallback(async (file) => {

    if (!validateFile(file)) return;

    try {

      setResumeFile(file);
      setIsAnalyzingResume(true);
      setError("");

      const formData = new FormData();
      formData.append("resume", file);

      const response = await api.post(
        "/api/interview/analyze-resume",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      const data = response.data;

      setResumeData(data);

      if (data.role) setRole(data.role);
      if (data.experience) setExperience(data.experience);

    } catch (err) {

      console.error(err);
      setError("Resume analysis failed. Please try again.");

    } finally {

      setIsAnalyzingResume(false);

    }

  }, []);

  const handleStart = useCallback(async () => {

    if (!role.trim() || !experience.trim()) {
      alert("Please enter role and experience.");
      return;
    }

    if (isAnalyzingResume) {
      alert("Resume analysis still running.");
      return;
    }

    try {

      setIsStartingInterview(true);
      setError("");

      const response = await api.post(
        "/api/interview/generate-questions",
        {
          role: role.trim(),
          experience: experience.trim(),
          mode: type,
          resumeText: resumeData?.resumeText || "",
          skills: resumeData?.skills || [],
          projects: resumeData?.projects || []
        }
      );

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Interview generation failed");
      }

      onStart({
        interviewId: result.interviewId,
        questions: result.questions,
        role,
        experience,
        type,
        remainingCredits: result.remainingCredits
      });

    } catch (err) {

      console.error(err);

      if (err.response?.status === 403) {
        alert("Insufficient credits. You need 100 credits.");
      } else {
        setError(err.response?.data?.message || "Failed to start interview.");
      }

    } finally {

      setIsStartingInterview(false);

    }

  }, [role, experience, type, resumeData, isAnalyzingResume, onStart]);

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
            Practice real interview scenarios powered by AI.
            Improve communication, technical skills, and confidence.
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

          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Enter role"
            className="w-full border rounded-lg px-4 py-3 mb-4"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />

          <input
            type="text"
            placeholder="Experience (e.g. 2 years)"
            className="w-full border rounded-lg px-4 py-3 mb-4"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />

          <select
            className="w-full border rounded-lg px-4 py-3 mb-6"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option>Technical Interview</option>
            <option>HR Interview</option>
            <option>Mixed Interview</option>
          </select>

          <label className="border-2 border-dashed border-green-400 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-green-50 transition mb-6">

            <FiUpload size={28} className="text-green-600 mb-2" />

            {isAnalyzingResume ? (
              <p className="text-green-600 text-sm">Analyzing resume...</p>
            ) : resumeFile ? (
              <p className="text-green-700 text-sm font-medium">
                ✔ {resumeFile.name}
              </p>
            ) : (
              <p className="text-gray-600 text-sm">
                Click to upload resume (optional)
              </p>
            )}

            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              disabled={isAnalyzingResume}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) handleResumeUpload(file);
              }}
            />

          </label>

          {resumeData && (
            <div className="bg-gray-50 border rounded-xl p-4 mb-6">

              <h3 className="text-sm font-semibold mb-3">
                Resume Analysis
              </h3>

              {resumeData.projects?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Projects</p>
                  <ul className="list-disc list-inside text-sm">
                    {resumeData.projects.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {resumeData.skills?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((s, i) => (
                      <span
                        key={i}
                        className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          <button
            onClick={handleStart}
            disabled={isStartingInterview || isAnalyzingResume}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {isStartingInterview ? "Starting Interview..." : "Start Interview"}
          </button>

        </motion.div>

      </div>

    </motion.div>
  );
}

export default Step1SetUp;