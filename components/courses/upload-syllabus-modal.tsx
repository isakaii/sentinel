"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Check, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface UploadSyllabusModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseCode: string;
  onUpload: (file: File) => Promise<void>;
}

const loadingMessages = [
  "Reading syllabus...",
  "Extracting events...",
  "Finding assignments...",
  "Identifying deadlines...",
  "Processing exam dates...",
  "Analyzing schedule...",
  "Organizing calendar...",
  "Finalizing..."
];

export function UploadSyllabusModal({
  isOpen,
  onClose,
  courseCode,
  onUpload,
}: UploadSyllabusModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Cycle through loading messages while uploading
  useEffect(() => {
    if (uploading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000); // Change message every 2 seconds

      return () => clearInterval(interval);
    } else {
      setLoadingMessageIndex(0);
    }
  }, [uploading]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setSuccess(false);

    if (acceptedFiles.length === 0) {
      setError("Please upload a PDF file");
      return;
    }

    const uploadedFile = acceptedFiles[0];

    // Validate file type
    if (uploadedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }

    // Validate file size (10MB max)
    if (uploadedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setFile(uploadedFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      await onUpload(file);
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error('Upload error:', err);

      // Provide more specific error messages
      let errorMessage = "Upload failed. Please try again.";

      if (err instanceof Error) {
        if (err.message.includes('parse') || err.message.includes('extract')) {
          errorMessage = "Unable to extract events from the PDF. Please ensure it's a valid syllabus.";
        } else if (err.message.includes('size')) {
          errorMessage = "File size exceeds the 10MB limit.";
        } else if (err.message.includes('Unauthorized') || err.message.includes('401')) {
          errorMessage = "You need to be logged in to upload a syllabus.";
        } else if (err.message.includes('timeout') || err.message.includes('network')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (err.message.includes('OpenAI') || err.message.includes('API')) {
          errorMessage = "PDF processing service is temporarily unavailable. Please try again later.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError(null);
    setSuccess(false);
    setUploading(false);
    onClose();
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Syllabus" className="max-w-lg">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Upload the syllabus PDF for <span className="font-semibold">{courseCode}</span>
        </p>

        {/* Dropzone */}
        {!file && !success && (
          <div
            {...getRootProps()}
            className={cn(
              "cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors",
              isDragActive
                ? "border-purple-400 bg-purple-50"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              {isDragActive ? "Drop the file here" : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-gray-500">Syllabus PDF (MAX. 10MB)</p>
          </div>
        )}

        {/* File Preview / Loading State */}
        {file && !success && (
          <div className="rounded-lg border border-gray-200 p-4">
            {uploading ? (
              // Loading State
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-purple-600 animate-pulse">
                      {loadingMessages[loadingMessageIndex]}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2" />
                  </div>
                  <div className="relative flex items-center">
                    <div
                      className="bg-purple-600 rounded-full h-2 animate-pulse transition-all duration-500"
                      style={{
                        width: `${Math.min((loadingMessageIndex + 1) * (100 / loadingMessages.length), 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              // File Preview (not uploading)
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="rounded-lg p-1 hover:bg-gray-100 transition-colors"
                  disabled={uploading}
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Success State */}
        {success && (
          <div className="rounded-lg bg-green-50 p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <p className="font-medium text-green-900 mb-1">Syllabus Updated!</p>
            <p className="text-sm text-green-700">New events have been extracted and added to your calendar.</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Buttons */}
        {!success && (
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={uploading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1"
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing
                </span>
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
