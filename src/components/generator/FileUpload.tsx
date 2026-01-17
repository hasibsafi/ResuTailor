"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, X, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  isUploading: boolean;
  uploadedFile: File | null;
  isParsed: boolean;
}

export default function FileUpload({
  onFileSelect,
  onFileRemove,
  isUploading,
  uploadedFile,
  isParsed,
}: FileUploadProps) {
  // Local error state for file type
  const [fileError, setFileError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      setFileError(null);
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
          setFileError("Please upload a PDF file.");
          return;
        }
        onFileSelect(file);
      } else if (fileRejections.length > 0) {
        setFileError("Please upload a PDF file.");
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: isUploading,
    multiple: false,
  });

  if (uploadedFile) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isUploading ? (
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            ) : isParsed ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <FileText className="h-8 w-8 text-blue-500" />
            )}
            <div>
              <p className="font-medium text-gray-900">{uploadedFile.name}</p>
              <p className="text-sm text-gray-500">
                {isUploading
                  ? "Parsing resume..."
                  : isParsed
                  ? "Resume parsed successfully"
                  : "Ready to process"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onFileRemove}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  const dropzoneClass = isDragActive
    ? "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors border-blue-500 bg-blue-50"
    : "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors border-gray-300 hover:border-gray-400";

    return (
      <div>
        <div
          {...getRootProps({ className: "border-dashed border-2 border-gray-300 rounded-lg p-6 bg-white cursor-pointer hover:border-blue-400 transition-colors" })}
          tabIndex={0}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="h-8 w-8 text-blue-500" />
            <p className="font-medium text-gray-700">Drag & drop your PDF resume here, or click to select</p>
            <p className="text-sm text-gray-500">Only PDF files are supported.</p>
            <p className="text-xs text-gray-400">If you upload another file type, we’ll ask you to upload a PDF.</p>
          </div>
        </div>
        {fileError && (
          <div className="mt-2 text-sm text-red-600">{fileError}</div>
        )}
      </div>
    );
}
