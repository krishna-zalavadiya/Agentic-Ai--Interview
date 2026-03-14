import express from 'express';
import isAuth from "../middlewares/isAuth.js"
import { analyzeResume } from "../controllers/interview.controller.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });


const interviewRouter = express.Router();
interviewRouter.post("/resume",isAuth, upload.single('resume'), analyzeResume);

export default interviewRouter;
