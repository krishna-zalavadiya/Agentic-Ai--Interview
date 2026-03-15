import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import askAi from "../services/openRouter.services.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";

export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Resume required" });
    }

    const filepath = req.file.path;
    const fileBuffer = await fs.promises.readFile(filepath);
    const uint8Array = new Uint8Array(fileBuffer);
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    let resumeText = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(" ");
      resumeText += pageText + "\n";
    }

    const safeResumeText = resumeText.replace(/\s+/g, " ").trim();

    const messages = [
      {
        role: "system",
        content: `
You are a senior technical recruiter and interview specialist.
Analyze the candidate resume and extract structured information.
STRICT RULES:
- Return ONLY valid JSON
- Do NOT include explanations
- Infer role and experience if missing
- Extract technologies, frameworks, tools, and languages
Return JSON format ONLY:
{
 "role": "Predicted job role",
 "experience": "Estimated experience level",
 "projects": ["project1","project2"],
 "skills": ["skill1","skill2"]
}
`
      },
      {
        role: "user",
        content: safeResumeText
      }
    ];

    const aiResponse = await askAi(messages);
    let parsed;

    try {
      parsed = JSON.parse(aiResponse);
    } catch (err) {
      console.error("AI returned invalid JSON:", aiResponse);
      throw new Error("AI returned invalid JSON");
    }

    if (!parsed.skills || !Array.isArray(parsed.skills)) {
      parsed.skills = [];
    }
    if (!parsed.projects || !Array.isArray(parsed.projects)) {
      parsed.projects = [];
    }

    fs.unlink(filepath, () => {});

    res.json({
      success: true,
      role: parsed.role || "",
      experience: parsed.experience || "",
      projects: parsed.projects,
      skills: parsed.skills,
      resumeText: safeResumeText,
      mode: parsed.mode || "Technical"
    });

  } catch (error) {
    console.error("Resume parsing error:", error);
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({
      success: false,
      message: "Failed to analyze resume"
    });
  }
};

export const generateQuestions = async (req, res) => {
  try {
    let { role, experience, mode, resumeText, skills, projects } = req.body;

    role = role?.trim() || "";
    experience = experience?.trim() || "";
    mode = mode?.trim() || "";
    resumeText = resumeText?.trim() || "";

    if (!role || !experience || !mode) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.credits < 100) {
      return res.status(403).json({ success: false, message: "Insufficient credits" });
    }

    const safeResumeText = resumeText?.replace(/\s+/g, " ").trim() || "None";
    const safeSkills = Array.isArray(skills) ? skills : [];
    const safeProjects = Array.isArray(projects) ? projects : [];
    const safeSkillsText = safeSkills.length ? safeSkills.join(", ") : "None";
    const safeProjectsText = safeProjects.length ? safeProjects.join(", ") : "None";

  const messages = [{
role: "system",
content: `

You are a highly experienced senior interviewer conducting a professional job interview.

Your job is to generate interview questions that will be asked by an AI voice interviewer.

The questions must sound natural when spoken out loud.

The interview should feel like a real conversation between an interviewer and a candidate.

----------------------------
INTERVIEW TYPES
----------------------------

Technical Interview:
Focus on evaluating the candidate's technical knowledge, coding ability, problem solving, system design, debugging, architecture understanding, and real-world engineering thinking.

HR Interview:
Focus on personality, teamwork, leadership, decision making, communication skills, conflict resolution, motivation, adaptability, and work culture fit.

Mixed Interview:
Combine both technical and HR questions to simulate a realistic full interview experience.

----------------------------
DIFFICULTY GUIDELINES
----------------------------

Adjust question difficulty according to candidate experience.

Entry Level (0-1 years)
- focus on fundamentals
- basic concepts
- simple coding logic
- simple behavioral questions

Mid Level (2-4 years)
- practical development scenarios
- debugging strategies
- system thinking
- collaboration and leadership examples

Senior Level (5+ years)
- system design
- scalability
- architecture decisions
- technical trade-offs
- leadership and mentoring

----------------------------
VOICE INTERVIEW STYLE
----------------------------

The questions will be spoken by an AI interviewer.

Therefore:

- Use natural conversational language
- Avoid very long complex sentences
- Questions should sound human
- Avoid bullet lists
- Each question should be easy to understand when heard

Example speaking style:

"Can you explain how you would design a scalable authentication system for a large web application?"

NOT robotic style like:

"Explain scalable authentication systems."

----------------------------
QUESTION STRUCTURE
----------------------------

Generate EXACTLY 5 interview questions.

Each question must include:

- question
- difficulty
- timeLimit (minutes)

Difficulty values must be:

Easy
Medium
Hard

Time limit guidelines:

Easy → 3 to 5 minutes  
Medium → 5 to 10 minutes  
Hard → 10 to 15 minutes

Question 1: Easy, 3-5 minutes
Question 2: Easy or Medium, 3-10 minutes
Question 3: Medium, 5-10 minutes
Question 4: Medium or Hard, 5-15 minutes
Question 5: Hard, 10-15 minutes

----------------------------
RESPONSE FORMAT
----------------------------

Return ONLY valid JSON.

Do not include explanations.

Return format:

{
 "questions":[
  {
   "question":"Question text spoken by interviewer",
   "difficulty":"Easy",
   "timeLimit":5
  }
 ]
}

`
      },
      {
        role: "user",
        content: `
Candidate Role: ${role}
Candidate Experience: ${experience}
Interview Mode: ${mode}
Candidate Skills: ${safeSkillsText}
Candidate Projects: ${safeProjectsText}
Candidate Resume Summary:
${safeResumeText}
Generate interview questions tailored to this candidate.
`
      }
    ];

    const aiResponse = await askAi(messages);
    let parsed;

    try {
      if (!aiResponse) throw new Error("Empty AI response");
      parsed = JSON.parse(aiResponse);
    } catch (err) {
      return res.status(500).json({ success: false, message: "AI returned invalid response format" });
    }

    if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      return res.status(500).json({ success: false, message: "AI generated no questions" });
    }

    // Atomic Credit Update
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $inc: { credits: -100 } },
      { new: true }
    );

    const interview = await Interview.create({
      userId: user._id,
      role,
      experience,
      mode,
      resumeText: safeResumeText,
      questions: parsed.questions.map((q, index) => ({
        question: q.question || "Question unavailable",
        difficulty: q.difficulty || ["Easy", "Easy", "Medium", "Medium", "Hard"][index] || "Medium",
        timeLimit: q.timeLimit || [5, 5, 8, 10, 15][index] || 10,
        answer: "",
        score: 0,
        correctness: 0,
        communication: 0,
        confidence: 0,
        score: 0,
        answer: "",
        feedback: ""
      }))
    });

    res.json({
      success: true,
      interviewId: interview._id,
      questions: interview.questions,
      creditsUsed: 100,
      remainingCredits: updatedUser.credits
    });

  } catch (error) {
    console.error("❌ generateQuestions error:", error);
    res.status(500).json({ success: false, message: "Failed to generate interview" });
  }
}; // Added missing closing brace here

export const submitAnswer = async (req, res) => { // Added (req, res)
  try {
    const { interviewId, questionIndex, answer } = req.body; // Destructured from body

    if (!interviewId) {
      return res.status(400).json({ success: false, message: "Interview ID required" });
    }

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    const question = interview.questions[questionIndex];

    if (!question) {
      return res.status(400).json({ success: false, message: "Invalid question index" });
    }

    /* ----------------------------------
       EVALUATION LOGIC (Industry Level)
    ---------------------------------- */

    // 1. Handle Empty Answer
    if (!answer || answer.trim() === "") {
      question.score = 0;
      question.feedback = "No answer was provided for this question.";
      question.answer = "";
      await interview.save();
      return res.json({ success: true, feedback: question.feedback, score: 0 });
    }

    // 2. AI Scoring Prompt
    const evaluationMessages = [
      {
        role: "system",
        content: `
You are an expert technical interviewer. Evaluate the candidate's response with high rigor.
Criteria:
- Technical Accuracy (Does it work?)
- Depth (Does it show experience-level nuance like trade-offs or edge cases?)
- Clarity (Is the explanation professional and structured?)

SCORING (0-10):
0: Irrelevant.
1-4: Significant errors or lacks basic understanding.
5-7: Good understanding, covers the basics well.
8-10: Expert level, includes optimization, scalability, or best practices.

Return ONLY valid JSON.
`
      },
      {
        role: "user",
        content: `
Role: ${interview.role}
Experience: ${interview.experience}
Question: "${question.question}"
Candidate Answer: "${answer}"

Return Format:
{
  "correctness": number,
  "communication": number,
  "confidence": number,
  "feedback": "string"
}
`
      }
    ];

    const aiEvaluation = await askAi(evaluationMessages);
    let evaluation;

    try {
      evaluation = JSON.parse(aiEvaluation);
    } catch (err) {
      // Fallback if AI JSON fails
      evaluation = { 
        score: 5, 
        feedback: "Answer received and recorded.", 
        improvement: "Standard technical review pending." 
      };
    }

    /* ----------------------------------
       STORE EVALUATED DATA
    ---------------------------------- */

   question.answer = answer;
    question.correctness = evaluation.correctness;
    question.communication = evaluation.communication;
    question.confidence = evaluation.confidence;
    question.score = (evaluation.correctness + evaluation.communication + evaluation.confidence) / 3;
    question.feedback = evaluation.feedback;
    await interview.save();

    res.json({
      success: true,
      score: evaluation.score,
      feedback: question.feedback
    });

  } catch (error) {
    console.error("❌ submitAnswer error:", error);
    res.status(500).json({ success: false, message: "Failed to process answer" });
  }
};

// Finalize interview, calculate average score, and get AI summary verdict

export const finishInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;

    if (!interviewId) {
      return res.status(400).json({ success: false, message: "Interview ID required" });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    /* ----------------------------------
       METRIC AGGREGATION LOGIC
    ---------------------------------- */
    const totalQuestions = interview.questions.length;

    // Calculate totals for each metric across all questions
    const totals = interview.questions.reduce((acc, q) => {
      acc.correctness += (q.correctness || 0);
      acc.communication += (q.communication || 0);
      acc.confidence += (q.confidence || 0);
      return acc;
    }, { correctness: 0, communication: 0, confidence: 0 });

    // Compute Averages
    const avgCorrectness = (totals.correctness / totalQuestions).toFixed(1);
    const avgCommunication = (totals.communication / totalQuestions).toFixed(1);
    const avgConfidence = (totals.confidence / totalQuestions).toFixed(1);

    // Final Overall Score (Average of the three metrics)
    const finalScore = ((parseFloat(avgCorrectness) + parseFloat(avgCommunication) + parseFloat(avgConfidence)) / 3).toFixed(1);

    /* ----------------------------------
       AI SUMMARY & VERDICT GENERATION
    ---------------------------------- */
    const summaryMessages = [
      {
        role: "system",
        content: `
You are a Lead Hiring Manager. Review the candidate's performance metrics: Correctness, Communication, and Confidence.
Provide a final verdict on whether they should be hired based on these indices.

STRICT RULES:
- Return ONLY valid JSON
- Be critical and professional
- Base the verdict on the Final Overall Score

VERDICT CATEGORIES:
- Strong Hire (8.5 - 10.0)
- Hire (7.0 - 8.4)
- Lean Hire (5.5 - 6.9)
- No Hire (< 5.5)
`
      },
      {
        role: "user",
        content: `
Role: ${interview.role}
Experience Level: ${interview.experience}

METRICS PERFORMANCE:
- Avg Correctness: ${avgCorrectness}/10
- Avg Communication: ${avgCommunication}/10
- Avg Confidence: ${avgConfidence}/10
- Final Overall Score: ${finalScore}/10

Return JSON format:
{
  "verdict": "string",
  "summary": "2-3 sentence overview of performance",
  "strengths": ["point1", "point2"],
  "weaknesses": ["point1", "point2"]
}
`
      }
    ];

    const aiSummary = await askAi(summaryMessages);
    let parsedSummary;

    try {
      parsedSummary = JSON.parse(aiSummary);
    } catch (err) {
      console.error("AI Summary Parsing Error:", aiSummary);
      // Fallback object in case of parsing failure
      parsedSummary = { 
        verdict: finalScore >= 7 ? "Hire" : "No Hire", 
        summary: "Analysis complete. Performance met standard thresholds.", 
        strengths: [], 
        weaknesses: [] 
      };
    }

    /* ----------------------------------
       UPDATE INTERVIEW DOCUMENT
    ---------------------------------- */
    interview.status = "completed";
    interview.finalResult = {
      avgCorrectness: parseFloat(avgCorrectness),
      avgCommunication: parseFloat(avgCommunication),
      avgConfidence: parseFloat(avgConfidence),
      finalScore: parseFloat(finalScore),
      ...parsedSummary
    };

    await interview.save();

    res.json({
      success: true,
      result: interview.finalResult
    });

  } catch (error) {
    console.error("❌ finishInterview error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to finalize interview and generate results" 
    });
  }
};