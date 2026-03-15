import express from "express";
import multer from "multer";
import { 
  analyzeResume, 
  generateQuestions, 
  submitAnswer, 
  finishInterview 
} from "../controllers/interview.controller.js";
import  isAuth  from "../middlewares/isAuth.js"; // Assuming you have an auth middleware

const router = express.Router();

// Multer setup for temporary resume storage
const upload = multer({ dest: "uploads/" });

router.post("/analyze-resume", isAuth, upload.single("resume"), analyzeResume);

router.post("/generate-questions", isAuth, generateQuestions);

router.post("/submit-answer", isAuth, submitAnswer);

router.post("/finish", isAuth, finishInterview);

export default router;