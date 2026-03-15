import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaMicrophone, FaStop, FaChevronRight, FaRobot, FaWaveSquare, FaVideo } from "react-icons/fa";
import axios from "axios";
import maleaiaudio from "../assets/male-ai.mp4";

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

function Step2Interview({ interviewData, onFinish }) {

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isIntroDone, setIsIntroDone] = useState(false);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  const finalTranscriptRef = useRef("");
  const interimTranscriptRef = useRef("");

  const synth = window.speechSynthesis;

  const currentQuestion = interviewData.questions[currentIdx];

  const speak = useCallback((text, onEndCallback) => {
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => onEndCallback?.();

    synth.speak(utterance);
  }, [synth]);

  const startTimer = (seconds) => {

    setTimeLeft(seconds);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {

      setTimeLeft((prev) => {

        if (prev <= 1) {

          clearInterval(timerRef.current);

          stopRecordingAndSubmit();

          return 0;
        }

        return prev - 1;

      });

    }, 1000);
  };

  const startQuestionFlow = useCallback((index) => {

    setFeedback("");

    setTranscript("");

    finalTranscriptRef.current = "";
    interimTranscriptRef.current = "";

    const questionText = interviewData.questions[index].question;

    speak(questionText, () => {

      startRecording();

      startTimer(interviewData.questions[index].timeLimit * 60);

    });

  }, [interviewData, speak]);

  useEffect(() => {

    const intro = `Welcome to your AI assessment. I'm Alex, your interviewer. We will go through five core questions today. Please speak clearly and take your time. Let's begin.`;

    speak(intro, () => {

      setIsIntroDone(true);

      startQuestionFlow(0);

    });

    return () => {

      synth.cancel();

      clearInterval(timerRef.current);

    };

  }, []);

  const startRecording = () => {

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return alert("Browser not supported");

    recognitionRef.current = new SpeechRecognition();

    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event) => {

      let interimText = "";
      let finalText = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {

        const transcriptChunk = event.results[i][0].transcript;

        if (event.results[i].isFinal) {

          finalText += transcriptChunk + " ";

        } else {

          interimText += transcriptChunk;

        }

      }

      finalTranscriptRef.current = finalText;
      interimTranscriptRef.current = interimText;

      setTranscript(finalText + interimText);

    };

    recognitionRef.current.onerror = (e) => {
      console.log("Speech recognition error:", e);
    };

    recognitionRef.current.onend = () => {

      console.log("Speech recognition ended");

      if (isRecording) {

        recognitionRef.current.start();

      }

    };

    recognitionRef.current.start();

    setIsRecording(true);
  };

  const stopRecordingAndSubmit = async () => {

    if (recognitionRef.current) recognitionRef.current.stop();

    setIsRecording(false);

    clearInterval(timerRef.current);

    await handleSubmit();
  };

  const handleSubmit = async () => {

    setIsProcessing(true);

    try {

      const res = await api.post("/api/interview/submit-answer", {

        interviewId: interviewData.interviewId,
        questionIndex: currentIdx,
        answer: transcript.trim()

      });

      setFeedback(res.data.feedback);

    } catch (err) {

      setFeedback("Technical issue saving answer. Moving to next question.");

    } finally {

      setIsProcessing(false);

    }
  };

  const handleNext = () => {

    if (currentIdx + 1 < interviewData.questions.length) {

      setCurrentIdx(prev => prev + 1);

      startQuestionFlow(currentIdx + 1);

    } else {

      finalizeInterview();

    }
  };

  const finalizeInterview = async () => {

    setIsProcessing(true);

    try {

      const res = await api.post("/api/interview/finish", {

        interviewId: interviewData.interviewId

      });

      onFinish(res.data.result);

    } catch (err) {

      console.error(err);

    }
  };

  return (

    <div className="min-h-screen bg-[#F1F3F5] flex items-center justify-center p-6 font-sans">

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-7xl rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.06)] flex overflow-hidden min-h-[750px] border border-gray-100"
      >

        {/* LEFT PANEL */}

        <div className="w-[40%] bg-gradient-to-b from-[#FAFDFB] to-white p-12 flex flex-col border-r border-gray-100">

          <div className="flex items-center gap-3 mb-10">

            <div className="p-2.5 bg-green-600 rounded-2xl text-white shadow-lg shadow-green-100">

              <FaRobot size={22} />

            </div>

            <span className="font-bold text-gray-900 text-lg tracking-tight">

              Interview Platform AI

            </span>

          </div>

          <div className="relative mb-10">

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-[28px] overflow-hidden shadow-2xl border-4 border-white"
            >

              <video autoPlay loop muted className="w-full h-72 object-cover object-top">

                <source src={maleaiaudio} type="video/mp4" />

              </video>

            </motion.div>

          </div>
          <div className="mt-auto space-y-6">

  {/* TIMER CARD */}

  <div className="bg-white p-7 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">

    <div>
      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">
        Time Remaining
      </p>

      <div className="text-4xl font-black text-gray-950 tracking-tighter">
        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
      </div>
    </div>

    <div className="w-16 h-16 relative">
      <svg className="w-full h-full transform -rotate-90">

        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="#E6EEF4"
          strokeWidth="4"
          fill="transparent"
        />

        <motion.circle
          cx="32"
          cy="32"
          r="28"
          stroke="#10B981"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray="175"
          animate={{
            strokeDashoffset:
              175 - (175 * (timeLeft / (currentQuestion.timeLimit * 60)))
          }}
          transition={{ duration: 1, ease: "linear" }}
        />

      </svg>
    </div>

  </div>


  {/* QUESTION STATS */}

  <div className="flex gap-5">

    <div className="flex-1 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">

      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
        Current Question
      </p>

      <p className="text-2xl font-black text-green-600">
        {currentIdx + 1}
      </p>

    </div>

    <div className="flex-1 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">

      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
        Total Questions
      </p>

      <p className="text-2xl font-black text-gray-900">
        {interviewData.questions.length}
      </p>

    </div>

  </div>

</div>

        </div>

        {/* RIGHT PANEL */}

        <div className="flex-1 p-14 flex flex-col bg-white">

          <div className="flex items-center gap-2 mb-10 text-gray-400">

            <FaWaveSquare className="text-green-500" />

            <span className="text-xs font-semibold uppercase tracking-wider">

              Active Assessment

            </span>

          </div>

          <div className="mb-12">

            <motion.h2
              key={currentIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-gray-950 leading-snug tracking-tight"
            >

              {currentQuestion.question}

            </motion.h2>

          </div>

          <div className="flex-1 flex flex-col gap-8">

            <div className="flex-1 relative group">

              <div className="absolute inset-0 bg-[#FBFDFD] rounded-[24px] border border-gray-100 -z-10" />

              <textarea
                className="w-full h-full bg-transparent p-8 text-gray-800 text-lg leading-relaxed resize-none focus:outline-none placeholder:text-gray-300 font-medium"
                placeholder="Speak or edit your answer..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />

              {isRecording && (

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute bottom-6 right-8 flex items-center gap-3 bg-red-50 text-red-600 px-5 py-2.5 rounded-full border border-red-100"
                >

                  <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />

                  <span className="text-xs font-bold uppercase tracking-widest">

                    Listening

                  </span>

                </motion.div>

              )}

            </div>

            <AnimatePresence>

              {feedback && (

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-[#EDFAF1] border border-[#D5F3E2] p-6 rounded-[24px]"
                >

                  <p className="text-green-900 text-sm font-medium leading-relaxed">

                    {feedback}

                  </p>

                </motion.div>

              )}

            </AnimatePresence>

          </div>

          <div className="mt-12">

            {isRecording ? (

              <button
                onClick={stopRecordingAndSubmit}
                className="w-full py-5.5 bg-gray-950 text-white rounded-[18px] font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-gray-200"
              >

                <FaStop size={12} /> Stop and Submit Answer

              </button>

            ) : (

              <button
                onClick={handleNext}
                disabled={isProcessing}
                className="w-full py-5.5 bg-green-600 text-white rounded-[18px] font-bold flex items-center justify-center gap-3 hover:bg-green-700 transition-all shadow-xl shadow-green-100 disabled:opacity-50"
              >

                {isProcessing
                  ? "Analyzing..."
                  : (currentIdx + 1 === interviewData.questions.length
                    ? "Complete Assessment"
                    : "Next Question")}

                <FaChevronRight size={14} />

              </button>

            )}

          </div>

        </div>

      </motion.div>

    </div>
  );

}

export default Step2Interview;