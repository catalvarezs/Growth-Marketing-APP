import { GoogleGenAI } from "@google/genai";
import { ExcelData, ExcelRow } from "../types";

// Helper to convert rows to CSV format - highly token efficient for LLMs
const rowsToCSV = (rows: ExcelRow[], columns: string[]): string => {
    if (rows.length === 0) return "";
    
    const header = columns.join(',');
    const body = rows.map(row => {
        return columns.map(col => {
            let val = row[col];
            if (val === null || val === undefined) return '';
            val = String(val).replace(/"/g, '""'); // Escape existing quotes
            // Quote values containing delimiters
            if (val.includes(',') || val.includes('\n') || val.includes('"')) {
                return `"${val}"`;
            }
            return val;
        }).join(',');
    }).join('\n');
    
    return `${header}\n${body}`;
};

// Helper to format data for the prompt
const formatDataForContext = (data: ExcelData): string => {
  // Increased row limit because CSV is more compact than JSON
  const MAX_ROWS_PER_SHEET = 50; 
  
  let dataContext = `File Name: ${data.fileName}\nTotal Sheets: ${data.sheets.length}\n\n`;

  data.sheets.forEach((sheet, index) => {
    const dataSlice = sheet.rows.slice(0, MAX_ROWS_PER_SHEET);
    const csvData = rowsToCSV(dataSlice, sheet.columns);
    
    dataContext += `--- SHEET ${index + 1}: "${sheet.sheetName}" ---\n`;
    dataContext += `Columns: ${sheet.columns.join(', ')}\n`;
    dataContext += `Total Rows: ${sheet.rows.length}\n`;
    dataContext += `Data Preview (First ${dataSlice.length} rows in CSV format):\n`;
    dataContext += csvData;
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
    
    const systemInstruction = `You are an expert Data Analyst and Marketing Intelligence Assistant. 
    You have been provided with data from an Excel file named "${data.fileName}".
    
    Your goal is to answer the user's questions and analyze Marketing Metrics if requested.
    
    KEY METRICS DEFINITIONS:
    If the user asks for these metrics, use the following formulas and look for relevant columns (synonyms in Spanish/English):
    
    1. **CAC (Cost Per Acquisition)**:
       - Formula: Total Investment (Spend) / Total Paid Customers (New Customers)
       - Look for columns: 'Inversión', 'Spend', 'Cost', 'Gasto', 'Amount Spent' AND 'Clientes', 'Customers', 'Paid Users', 'Conversiones'.
    
    2. **ROAS (Return on Ad Spend)**:
       - Formula: Total Revenue / Total Investment
       - Look for columns: 'Ingresos', 'Revenue', 'Ventas', 'Sales Value' AND 'Inversión', 'Spend', 'Cost'.
    
    3. **AOV (Average Order Value / Ticket Promedio)**:
       - Formula: Total Revenue / Total Customers (or Total Orders)
       - Look for columns: 'Revenue', 'Ingresos' AND 'Customers', 'Orders', 'Transacciones'.

    MULTI-SHEET INSTRUCTIONS:
    - Look for relationships between sheets (common IDs).
    - If needed, join data mentally to calculate these metrics (e.g., Spend is in 'Ads Data' and Revenue is in 'Sales Data').

    CHARTING INSTRUCTIONS (CRITICAL):
    If the user asks to "graph", "plot", "visualize", or if the answer involves a trend, comparison, or breakdown that is better seen visually, you MUST generate a chart configuration.
    
    To generate a chart, output a JSON block at the VERY END of your response wrapped in \`\`\`json-chart\`\`\`.
    
    JSON Format:
    {
      "type": "bar" | "line" | "pie" | "area",
      "title": "Short descriptive title",
      "xAxisLabel": "Label for X Axis",
      "yAxisLabel": "Label for Y Axis",
      "data": [
        { "name": "Category A", "value": 100, "extra": "Optional tooltip info" },
        { "name": "Category B", "value": 200 }
      ]
    }
    
    - Use 'bar' for comparisons (e.g., Revenue by Campaign).
    - Use 'line' for trends over time (e.g., ROAS per month).
    - Use 'pie' for composition (e.g., Spend share by Platform).
    - Use 'area' for accumulated volume.
    - Ensure 'value' is a number. 'name' is the label.
    
    GENERAL RULES:
    - Answer in the user's language (Spanish/English).
    - Be concise.
    - Use Markdown for tables and bold text.
    
    Data Context:
    ${context}
    `;

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.3, 
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