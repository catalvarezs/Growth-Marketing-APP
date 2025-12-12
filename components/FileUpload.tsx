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

    const isExcel = validTypes.includes(file.type) || /\.(xlsx|xls)$/i.test(file.name);

    if (isExcel) {
      onFileSelect(file);
    } else {
      setError("Please upload a valid Excel file (.xlsx or .xls)");
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border border-dashed rounded-lg p-10 text-center transition-all duration-200
          flex flex-col items-center justify-center shadow-sm bg-white
          ${isDragging 
            ? 'border-black bg-gray-50 scale-[1.01]' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <div className={`p-4 rounded-full mb-4 transition-colors duration-300 ${isDragging ? 'bg-gray-200' : 'bg-gray-100'}`}>
          <FileSpreadsheet className={`w-8 h-8 ${isLoading ? 'animate-pulse text-gray-500' : 'text-gray-900'}`} />
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-1 tracking-tight">
          {isLoading ? "Processing Data..." : "Upload Spreadsheet"}
        </h3>
        
        <p className="text-gray-500 mb-6 text-sm max-w-xs mx-auto">
          Drag and drop your file here.
        </p>

        {!isLoading && (
          <label className="relative cursor-pointer">
            <input
              type="file"
              className="hidden"
              onChange={handleFileInput}
              accept=".xlsx,.xls"
            />
            <span className="px-6 py-2 bg-white text-black border border-gray-300 rounded-md font-medium hover:bg-gray-50 transition-all text-sm flex items-center gap-2">
              <Upload size={14} />
              Browse Files
            </span>
          </label>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded text-xs font-medium animate-in slide-in-from-bottom-1">
            <AlertCircle size={14} />
            {error}
          </div>
        )}
      </div>
    </div>
  );
};