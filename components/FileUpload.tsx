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
          relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300
          flex flex-col items-center justify-center min-h-[300px]
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
            : 'border-slate-300 bg-white hover:border-slate-400'
          }
        `}
      >
        <div className="bg-green-100 p-4 rounded-full mb-6">
          <FileSpreadsheet className={`w-12 h-12 text-green-600 ${isLoading ? 'animate-pulse' : ''}`} />
        </div>
        
        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          {isLoading ? "Processing File..." : "Upload your Excel File"}
        </h3>
        
        <p className="text-slate-500 mb-6 max-w-xs mx-auto">
          Drag and drop your spreadsheet here, or click to browse.
          <br />
          <span className="text-xs text-slate-400">Supports .xlsx and .xls</span>
        </p>

        {!isLoading && (
          <label className="relative">
            <input
              type="file"
              className="hidden"
              onChange={handleFileInput}
              accept=".xlsx,.xls"
            />
            <span className="px-6 py-3 bg-slate-900 text-white rounded-lg font-medium cursor-pointer hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl">
              Browse Files
            </span>
          </label>
        )}

        {error && (
          <div className="absolute bottom-4 left-0 right-0 mx-auto w-max max-w-[90%] flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
