import React, { useCallback, useState } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { cn } from "../utils";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  selectedFile: File | null;
  onClear: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  isProcessing,
  selectedFile,
  onClear,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type === "application/pdf") {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type === "application/pdf") {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  if (selectedFile) {
    return (
      <div className="relative p-6 border-2 border-emerald-500/20 bg-emerald-50/50 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
        <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
          <FileText size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">
            {selectedFile.name}
          </p>
          <p className="text-xs text-slate-500">
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
        {isProcessing ? (
          <div className="flex items-center gap-2 text-emerald-600">
            <Loader2 className="animate-spin" size={20} />
            <span className="text-sm font-medium">Processing...</span>
          </div>
        ) : (
          <button
            onClick={onClear}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative group cursor-pointer border-2 border-dashed rounded-2xl p-12 transition-all duration-200 flex flex-col items-center justify-center gap-4",
        isDragging
          ? "border-emerald-500 bg-emerald-50"
          : "border-slate-200 hover:border-emerald-400 hover:bg-slate-50"
      )}
    >
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      <div className={cn(
        "p-4 rounded-2xl transition-colors",
        isDragging ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600"
      )}>
        <Upload size={32} />
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-slate-900">
          Click to upload or drag and drop
        </p>
        <p className="text-sm text-slate-500">
          Only PDF files are supported
        </p>
      </div>
    </div>
  );
};
