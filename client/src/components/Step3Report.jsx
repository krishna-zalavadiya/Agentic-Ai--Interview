import React, { useMemo, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaArrowLeft, FaDownload, FaRobot, FaCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";

const Step3Report = ({ report = {} }) => {
  const navigate = useNavigate();
  const reportRef = useRef(null);

  const safeScore = Math.max(0, Math.min(report?.finalScore || 0, 10));

  const { chartData, questions } = useMemo(() => {
    const qs = report?.questions || [];

    const data = qs.map((q, index) => ({
      name: `Q${index + 1}`,
      score: Math.max(0, Math.min(q?.correctness || 0, 10)),
    }));

    while (data.length < 5) {
      data.push({
        name: `Q${data.length + 1}`,
        score: 0,
      });
    }

    return {
      chartData: data,
      questions: qs,
    };
  }, [report]);

  const downloadPDF = useCallback(async () => {
    const element = reportRef.current;
    if (!element) return;

    try {
      const imgData = await toPng(element, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#F8FAF9",
      });

      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const img = new Image();
      img.src = imgData;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const imgWidth = pageWidth;
      const imgHeight = (img.height * imgWidth) / img.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = -(imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Interview_Report_${report?.role || "Results"}.pdf`);
    } catch (error) {
      console.error("PDF Error:", error);
      alert("PDF generation failed: " + error.message);
    }
  }, [report]);

  const skills = [
    { label: "Confidence", val: report?.avgConfidence || 0 },
    { label: "Communication", val: report?.avgCommunication || 0 },
    { label: "Correctness", val: report?.avgCorrectness || 0 },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF9] p-4 md:p-8 font-sans text-slate-900">
      <div ref={reportRef} className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/", { replace: true })}
              className="p-3 bg-white rounded-full shadow-sm border border-slate-100 hover:bg-slate-50 transition"
            >
              <FaArrowLeft className="text-slate-600" />
            </button>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                Interview Analytics Dashboard
              </h1>
              <p className="text-slate-400 text-sm font-medium">
                AI-powered performance insights
              </p>
            </div>
          </div>

          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 bg-[#06A476] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#058c64] transition shadow-lg shadow-green-100/50"
          >
            <FaDownload /> Download PDF
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT */}
          <div className="lg:col-span-4 space-y-8">

            {/* Score */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
              <h3 className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.1em] text-center mb-8">
                Overall Performance
              </h3>

              <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="72"
                    stroke="#F1F5F9"
                    strokeWidth="10"
                    fill="transparent"
                  />

                  <motion.circle
                    cx="80"
                    cy="80"
                    r="72"
                    stroke="#10B981"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray="452"
                    strokeDashoffset={452 - (452 * safeScore) / 10}
                    transition={{ duration: 2 }}
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute text-center">
                  <span className="text-4xl font-black text-slate-800">
                    {safeScore}
                  </span>
                  <span className="text-slate-300 text-sm block font-bold">
                    /10
                  </span>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="font-bold text-slate-800 text-lg mb-2">
                  {report?.verdict || "Assessment Incomplete"}
                </p>

                <p className="text-slate-500 text-sm italic">
                  "{report?.summary ||
                    "No data available. Please complete more questions."}"
                </p>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
              <h3 className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.1em] mb-8">
                Skill Evaluation
              </h3>

              <div className="space-y-8">
                {skills.map((skill) => {
                  const value = Math.max(0, Math.min(skill.val, 10));

                  return (
                    <div key={skill.label}>
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-bold text-slate-600">
                          {skill.label}
                        </span>

                        <span className="text-sm font-black text-[#10B981]">
                          {value}
                        </span>
                      </div>

                      <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(value / 10) * 100}%` }}
                          transition={{ duration: 1.5 }}
                          className="h-full bg-[#10B981]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-8 space-y-8">

            {/* Chart */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 h-[450px]">
              <h3 className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.1em] mb-8">
                Performance Trend
              </h3>

              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />

                    <XAxis dataKey="name" axisLine={false} tickLine={false} />

                    <YAxis domain={[0, 10]} axisLine={false} tickLine={false} />

                    <Tooltip />

                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#10B981"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#chartGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Questions */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
              <h3 className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.1em] mb-8">
                Question Breakdown
              </h3>

              <div className="space-y-6">
                {questions.map((q, i) => (
                  <div
                    key={`${q?.question}-${i}`}
                    className="p-6 rounded-2xl bg-[#FBFDFD] border border-slate-50"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                        Question {i + 1}
                      </span>

                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border text-[11px] font-bold text-[#10B981]">
                        <FaCircle size={6} /> {q?.correctness || 0}/10
                      </div>
                    </div>

                    <h4 className="text-slate-800 font-bold text-lg mb-6">
                      {q?.question}
                    </h4>

                    <div className="flex gap-4 p-5 rounded-2xl bg-white border">
                      <div className="bg-green-50 p-2 rounded-lg text-[#10B981] h-fit">
                        <FaRobot size={18} />
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                          AI Feedback
                        </p>

                        <p className="text-sm text-slate-600">
                          {q?.feedback ||
                            "No response recorded. AI could not evaluate."}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Report;