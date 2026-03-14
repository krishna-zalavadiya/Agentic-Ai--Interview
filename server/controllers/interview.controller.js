import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import  askAi  from "../services/openRouter.services.js"; 

export const analyzeResume = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({ message: "Resume required" });
    }

    const filepath = req.file.path;

    // Read PDF
    const fileBuffer = await fs.promises.readFile(filepath);
    const uint8Array = new Uint8Array(fileBuffer);

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    let resumeText = "";

    // Extract text
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {

      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      const pageText = content.items.map(item => item.str).join(" ");
      resumeText += pageText + "\n";
    }

    // Clean text
    resumeText = resumeText.replace(/\s+/g, " ").trim();

    const messages = [
      {
        role: "system",
        content: `
You are an expert technical recruiter and senior software interviewer.

Analyze the provided resume text and extract structured candidate information.

Rules:
- Only return valid JSON.
- Do NOT include explanations or extra text.
- Infer missing information if possible.
- Keep skills concise (technologies, frameworks, tools).

Return strictly JSON in this format:

{
 "role": "Predicted job role",
 "experience": "Estimated experience level",
 "projects": ["project1", "project2"],
 "skills": ["skill1", "skill2"]
}

Guidelines:
- Determine role based on technologies used.
- Extract project names if available.
- Extract technologies, frameworks, programming languages, and tools as skills.
`
      },
      {
        role: "user",
        content: resumeText
      }
    ];

    const aiResponse = await askAi(messages);
    const parsed = JSON.parse(aiResponse);

    // Delete uploaded file
    fs.unlink(filepath, (err) => {
      if (err) console.error("Error deleting file:", err);
    });

    res.json({
      role: parsed.role,
      experience: parsed.experience,
      projects: parsed.projects,
      skills: parsed.skills,
      success: true,
      text: resumeText
    });

  } catch (error) {

    console.error("Resume parsing error:", error);

    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to analyze resume"
    });

  }
};