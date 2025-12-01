import * as XLSX from 'xlsx';
import { ExcelData, ExcelRow, SheetData } from '../types';

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

        const workbook = XLSX.read(data, { type: 'array' });
        const parsedSheets: SheetData[] = [];

        // Iterate through all sheets
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          
          // Parse to JSON
          const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, { header: 0, defval: "" }); // header:0 implies auto-detect headers

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
            reject(new Error("Excel file appears to be empty or has no readable data"));
            return;
        }

        resolve({
          fileName: file.name,
          sheets: parsedSheets
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};