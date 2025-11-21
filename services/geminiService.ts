import { GoogleGenAI } from "@google/genai";
import { AIAction, Language } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables.");
    // In a real app, handle this more gracefully.
  }
  return new GoogleGenAI({ apiKey: apiKey || 'DUMMY_KEY_FOR_DEV' });
};

export const generateAIContent = async (
  currentContent: string,
  action: AIAction,
  language: Language = 'en',
  context?: string
): Promise<string> => {
  const ai = getClient();
  
  let prompt = "";
  const isZh = language === 'zh';

  const systemInstruction = isZh
    ? "你是一位专业的技术文档写作和编辑助手。仅输出请求的 Markdown 内容，不要包含对话填充语。"
    : "You are an expert technical writer and editor assistant. Output only the requested markdown content without conversational filler.";

  switch (action) {
    case AIAction.SUMMARIZE:
      prompt = isZh
        ? `请将以下 Markdown 内容总结为一个简洁的段落：\n\n${currentContent}`
        : `Please summarize the following markdown content into a concise paragraph:\n\n${currentContent}`;
      break;
    case AIAction.IMPROVE:
      prompt = isZh
        ? `重写以下 Markdown 内容以提高清晰度、流畅度和专业语气。保持原意不变：\n\n${currentContent}`
        : `Rewrite the following markdown content to improve clarity, flow, and professional tone. Keep the same meaning:\n\n${currentContent}`;
      break;
    case AIAction.FIX_GRAMMAR:
      prompt = isZh
        ? `修复以下 Markdown 内容中的任何语法、拼写或标点错误：\n\n${currentContent}`
        : `Fix any grammar, spelling, or punctuation errors in the following markdown content:\n\n${currentContent}`;
      break;
    case AIAction.CONTINUE:
      prompt = isZh
        ? `根据上下文和风格继续编写此 Markdown 文章。提供接下来的 2-3 个段落：\n\n${currentContent}`
        : `Continue writing this markdown article based on the context and style. Provide the next 2-3 paragraphs:\n\n${currentContent}`;
      break;
  }

  if (context) {
    prompt += isZh 
      ? `\n\n额外背景/指令：${context}`
      : `\n\nAdditional Context/Instruction: ${context}`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });
    
    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate content. Please check your API key.");
  }
};
