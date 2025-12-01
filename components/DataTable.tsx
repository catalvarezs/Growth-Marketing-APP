import React, { useState } from 'react';
import { ExcelData } from '../types';
import { Layers } from 'lucide-react';

interface DataTableProps {
  data: ExcelData;
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);

  if (!data.sheets.length) return null;

  const currentSheet = data.sheets[activeSheetIndex];
  
  // Limit display to first 100 rows for performance
  const displayRows = currentSheet.rows.slice(0, 100);

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Sheet Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-100 bg-white scrollbar-thin shrink-0 px-2 pt-2">
        {data.sheets.map((sheet, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSheetIndex(idx)}
            className={`
              flex items-center gap-2 px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all rounded-t-lg
              ${activeSheetIndex === idx 
                ? 'text-indigo-600 bg-indigo-50/50 border-b-2 border-indigo-600' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }
            `}
          >
            <Layers size={14} className={activeSheetIndex === idx ? 'text-indigo-600' : 'text-slate-400'} />
            {sheet.sheetName}
          </button>
        ))}
      </div>

      <div className="px-4 py-3 border-b border-slate-100 bg-white flex justify-between items-center shrink-0">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
          {currentSheet.sheetName}
          <span className="text-xs font-medium text-slate-500 px-2.5 py-0.5 bg-slate-100 rounded-full">
            {currentSheet.rows.length} rows
          </span>
        </h3>
        <span className="text-xs text-slate-400 font-medium hidden sm:inline">Displaying top 100 rows</span>
      </div>
      
      {/* Table Container - flex-1 allows it to take remaining height */}
      <div className="flex-1 overflow-auto scrollbar-thin w-full bg-white relative">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
            <tr>
              {currentSheet.columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200 bg-slate-50/50">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-indigo-50/30 transition-colors group">
                {currentSheet.columns.map((col, cIdx) => (
                  <td key={cIdx} className="px-6 py-3.5 text-slate-600 group-hover:text-slate-900 transition-colors border-r border-slate-50 last:border-r-0">
                    {row[col] !== undefined && row[col] !== null ? String(row[col]) : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};