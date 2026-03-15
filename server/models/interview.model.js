import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: String,
  difficulty: String,
  timeLimit: Number,
  answer: { type: String, default: "" }, // Changed from Number to String
  feedback: String,
  score: { type: Number, default: 0 },
  confidence: { type: Number, default: 0 },
  communication: { type: Number, default: 0 },
  correctness: { type: Number, default: 0 }, // Changed from Boolean to Number
});

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true,
    // Removed enum to allow AI-predicted roles like "Backend Developer"
  },
  experience: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    required: true,
    // Ensure these match exactly what your frontend/AI sends
    enum: ['HR', 'Technical', 'Mixed', 'Technical Interview', 'HR Interview', 'Mixed Interview']
  },
  resumeText: {
    type: String,
    required: true
  },
  questions: [questionSchema],
  status: {
    type: String,
    enum: ['completed', 'active', 'InComplete'], // Matching the lowercase used in controller
    default: 'active'
  },
  // Added this field so finishInterview can save the summary
  finalResult: {
    avgCorrectness: Number,
    avgCommunication: Number,
    avgConfidence: Number,
    finalScore: Number,
    verdict: String,
    summary: String,
    strengths: [String],
    weaknesses: [String]
  }
}, { timestamps: true });

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;