import * as XLSX from 'xlsx';
import { ExcelData, ExcelRow, SheetData } from '../types';

// Core parsing logic for ArrayBuffer
export const parseExcelData = (buffer: ArrayBuffer, fileName: string): ExcelData => {
  // Parse with cellDates: true to handle date fields correctly
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const parsedSheets: SheetData[] = [];

  // Iterate through all sheets
  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    
    // Parse to JSON with raw: false to get formatted strings
    const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, { 
      defval: "",
      raw: false 
    });

    // Only add non-empty sheets
    if (jsonData.length > 0) {
      // Extract columns from the first row keys
      const columns = Object.keys(jsonData[0]);
      
      parsedSheets.push({
        sheetName: sheetName,
        columns: columns,
        rows: jsonData
      });
    }
  });

  if (parsedSheets.length === 0) {
      throw new Error("Excel file appears to be empty or has no readable data");
  }

  return {
    fileName: fileName,
    sheets: parsedSheets
  };
};

// Wrapper for browser File object
export const parseExcelFile = async (file: File): Promise<ExcelData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data || !(data instanceof ArrayBuffer)) {
          reject(new Error("Failed to read file"));
          return;
        }
        const result = parseExcelData(data, file.name);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

// Helper to extract ID from Google Sheet URL
const extractSheetId = (input: string): string | null => {
  // If it's already an ID (long string, no slashes), return it
  if (!input.includes('/') && input.length > 20) return input;

  // Regex for standard Google Sheet URLs
  const matches = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (matches && matches[1]) return matches[1];

  return null;
};

// Fetch and parse remote Google Sheet
export const fetchGoogleSheet = async (input: string): Promise<ExcelData> => {
  try {
    const sheetId = extractSheetId(input);
    
    if (!sheetId) {
      throw new Error("Invalid Google Sheet URL or ID");
    }

    // Use Google Sheets Export URL
    const googleSheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
    // Use CORS proxy to bypass browser restrictions
    const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(googleSheetUrl)}`;

    const response = await fetch(corsProxyUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Sheet: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return parseExcelData(arrayBuffer, "Google Sheet Data.xlsx");
  } catch (error) {
    console.error("Google Sheet Fetch Error:", error);
    throw new Error("Could not connect to Google Sheet. Please check permissions (must be 'Anyone with the link') or the URL.");
  }
};