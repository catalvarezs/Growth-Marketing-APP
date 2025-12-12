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
      <div className="flex overflow-x-auto border-b border-gray-200 bg-white scrollbar-thin shrink-0 px-2 pt-2">
        {data.sheets.map((sheet, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSheetIndex(idx)}
            className={`
              flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2
              ${activeSheetIndex === idx 
                ? 'text-black border-black bg-gray-50' 
                : 'text-gray-500 border-transparent hover:text-gray-800 hover:bg-gray-50'
              }
            `}
          >
            <Layers size={14} className={activeSheetIndex === idx ? 'text-black' : 'text-gray-400'} />
            {sheet.sheetName}
          </button>
        ))}
      </div>

      <div className="px-4 py-3 border-b border-gray-100 bg-white flex justify-between items-center shrink-0">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
          {currentSheet.sheetName}
          <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {currentSheet.rows.length} rows
          </span>
        </h3>
        <span className="text-xs text-gray-400 font-medium hidden sm:inline">Top 100 rows</span>
      </div>
      
      {/* Table Container */}
      <div className="flex-1 overflow-auto scrollbar-thin w-full bg-white relative">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {currentSheet.columns.map((col, idx) => (
                <th key={idx} className="px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-gray-50 transition-colors group">
                {currentSheet.columns.map((col, cIdx) => (
                  <td key={cIdx} className="px-6 py-3 text-gray-600 group-hover:text-gray-900 transition-colors border-r border-gray-50 last:border-r-0">
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