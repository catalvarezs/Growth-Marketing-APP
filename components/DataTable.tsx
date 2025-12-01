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
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full max-h-[600px]">
      {/* Sheet Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 scrollbar-thin">
        {data.sheets.map((sheet, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSheetIndex(idx)}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
              ${activeSheetIndex === idx 
                ? 'border-blue-600 text-blue-700 bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }
            `}
          >
            <Layers size={14} className={activeSheetIndex === idx ? 'text-blue-600' : 'text-slate-400'} />
            {sheet.sheetName}
          </button>
        ))}
      </div>

      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
          {currentSheet.sheetName}
          <span className="text-xs font-normal text-slate-500 px-2 py-0.5 bg-slate-200 rounded-full">
            {currentSheet.rows.length} rows
          </span>
        </h3>
        <span className="text-xs text-slate-400 italic">Showing first 100 rows</span>
      </div>
      
      <div className="overflow-auto flex-1 scrollbar-thin">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              {currentSheet.columns.map((col, idx) => (
                <th key={idx} className="px-6 py-3 font-medium text-slate-600 border-b border-slate-200">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                {currentSheet.columns.map((col, cIdx) => (
                  <td key={cIdx} className="px-6 py-3 text-slate-600">
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