import { GoogleGenAI } from "@google/genai";
import { ExcelData } from "../types";

// Helper to format data for the prompt
const formatDataForContext = (data: ExcelData): string => {
  // We limit the context to avoid massive token usage.
  // We provide a snapshot of EACH sheet so the model can identify foreign keys/relationships.
  
  const MAX_ROWS_PER_SHEET = 20; 
  
  let dataContext = `File Name: ${data.fileName}\nTotal Sheets: ${data.sheets.length}\n\n`;

  data.sheets.forEach((sheet, index) => {
    const dataSlice = sheet.rows.slice(0, MAX_ROWS_PER_SHEET);
    
    dataContext += `--- SHEET ${index + 1}: "${sheet.sheetName}" ---\n`;
    dataContext += `Columns: ${sheet.columns.join(', ')}\n`;
    dataContext += `Total Rows: ${sheet.rows.length}\n`;
    dataContext += `Data Preview (First ${dataSlice.length} rows):\n`;
    dataContext += JSON.stringify(dataSlice);
    dataContext += `\n\n`;
  });
  
  return dataContext;
};

export const generateDataAnalysis = async (
  question: string,
  data: ExcelData,
  chatHistory: { role: string; parts: { text: string }[] }[]
) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const context = formatDataForContext(data);
    
    const systemInstruction = `You are an expert Data Analyst and Excel Assistant. 
    You have been provided with data from an Excel file named "${data.fileName}" which may contain multiple sheets.
    
    Your goal is to answer the user's questions based on this data.
    
    CRITICAL INSTRUCTIONS FOR MULTI-SHEET ANALYSIS:
    1. Look for relationships between sheets (e.g., common ID columns, names, dates).
    2. If the user asks a question that requires data from multiple sheets, mentally "join" the datasets based on these common columns.
    3. Explicitly mention which sheets you are combining to find the answer.
    
    GENERAL RULES:
    - If the user asks in Spanish, reply in Spanish.
    - If the user asks in English, reply in English.
    - Format your response using Markdown. Use tables for lists of numbers.
    - Be concise and professional.
    
    Data Context:
    ${context}
    `;

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.3, // Lower temperature for more analytical precision
        },
        history: chatHistory
    });

    const result = await chat.sendMessage({ message: question });
    return result.text;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate response from Gemini.");
  }
};