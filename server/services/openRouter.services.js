import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const askAi = async (messages) => {

  try {

    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("askAi requires a non-empty messages array");
    }

    // Call OpenRouter API
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: "openai/gpt-4o-mini",
        messages,
        temperature: 0.2
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "AI Interview Platform"
        }
      }
    );

    const content = response?.data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("OpenRouter returned an empty response");
    }

    // Remove markdown code blocks if AI returns ```json
    const cleanedContent = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return cleanedContent;

  } catch (error) {

    console.error(
      "OpenRouter AI Error:",
      error?.response?.data || error.message
    );

    throw new Error("AI processing failed");

  }
};

export default askAi;