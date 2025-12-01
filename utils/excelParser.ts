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
      header: 0, 
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

// Fetch and parse remote Google Sheet
export const fetchGoogleSheet = async (sheetId: string): Promise<ExcelData> => {
  try {
    // Use Google Sheets Export URL
    const googleSheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
    // Use CORS proxy to bypass browser restrictions
    const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(googleSheetUrl)}`;

    const response = await fetch(corsProxyUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Sheet: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return parseExcelData(arrayBuffer, "Carvuk Data.xlsx");
  } catch (error) {
    console.error("Google Sheet Fetch Error:", error);
    throw new Error("Could not connect to Google Sheet. Please check the ID or try again.");
  }
};