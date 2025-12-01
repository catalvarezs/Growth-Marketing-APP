import React, { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndProcess(files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcess(e.target.files[0]);
    }
  };

  const validateAndProcess = (file: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];

    // Some browsers might not detect MIME type correctly for all excel files, check extension as fallback
    const isExcel = validTypes.includes(file.type) || /\.(xlsx|xls)$/i.test(file.name);

    if (isExcel) {
      onFileSelect(file);
    } else {
      setError("Please upload a valid Excel file (.xlsx or .xls)");
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border border-dashed rounded-3xl p-12 text-center transition-all duration-300
          flex flex-col items-center justify-center min-h-[320px] shadow-sm
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' 
            : 'border-slate-300 bg-white hover:border-indigo-400 hover:shadow-md'
          }
        `}
      >
        <div className={`p-5 rounded-2xl mb-6 transition-colors duration-300 ${isDragging ? 'bg-indigo-100' : 'bg-slate-50'}`}>
          <FileSpreadsheet className={`w-12 h-12 ${isLoading ? 'animate-pulse text-indigo-400' : 'text-indigo-600'}`} />
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
          {isLoading ? "Processing Data..." : "Upload your Excel File"}
        </h3>
        
        <p className="text-slate-500 mb-8 max-w-xs mx-auto leading-relaxed">
          Drag and drop your spreadsheet here to begin analysis.
          <br />
          <span className="text-xs text-slate-400 font-medium mt-1 block">Supports .xlsx and .xls</span>
        </p>

        {!isLoading && (
          <label className="relative group">
            <input
              type="file"
              className="hidden"
              onChange={handleFileInput}
              accept=".xlsx,.xls"
            />
            <span className="px-8 py-3.5 bg-slate-900 text-white rounded-xl font-semibold cursor-pointer group-hover:bg-indigo-600 transition-all duration-300 shadow-lg group-hover:shadow-indigo-500/30 flex items-center gap-2">
              <Upload size={18} />
              Browse Files
            </span>
          </label>
        )}

        {error && (
          <div className="absolute bottom-4 left-0 right-0 mx-auto w-max max-w-[90%] flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg text-sm font-medium animate-in slide-in-from-bottom-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </div>
    </div>
  );
};