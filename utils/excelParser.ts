import * as XLSX from 'xlsx';
import { ExcelData, ExcelRow, SheetData } from '../types';

const processWorkbook = (workbook: XLSX.WorkBook, fileName: string): ExcelData => {
  const parsedSheets: SheetData[] = [];

  // Iterate through all sheets
  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    
    // Parse to JSON with raw: false to get formatted strings (e.g. "$1,000" instead of 1000)
    // This helps the LLM understand the nature of the data better (currency, percentage, dates)
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

export const parseExcelFile = async (file: File): Promise<ExcelData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error("Failed to read file"));
          return;
        }

        // Parse with cellDates: true to handle date fields correctly if they aren't strings
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        
        resolve(processWorkbook(workbook, file.name));
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export const fetchGoogleSheet = async (sheetId: string): Promise<ExcelData> => {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Failed to fetch Google Sheet. Ensure it is public.");
    }
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
    
    return processWorkbook(workbook, "Google Sheet Data");
  } catch (error) {
    console.error("Fetch Google Sheet Error:", error);
    throw error;
  }
};