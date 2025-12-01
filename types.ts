export interface ExcelRow {
  [key: string]: string | number | boolean | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
}

export interface SheetData {
  sheetName: string;
  columns: string[];
  rows: ExcelRow[];
}

export interface ExcelData {
  fileName: string;
  sheets: SheetData[];
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  ANALYSIS = 'ANALYSIS'
}