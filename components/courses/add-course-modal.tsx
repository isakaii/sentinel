"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Check, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { CourseColor } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, color: CourseColor, addToGoogleCalendar?: boolean) => Promise<void>;
}

const courseColors: { value: CourseColor; class: string }[] = [
  { value: "cardinal", class: "bg-red-700" },
  { value: "blue", class: "bg-blue-500" },
  { value: "red", class: "bg-red-500" },
  { value: "green", class: "bg-green-500" },
  { value: "orange", class: "bg-orange-500" },
  { value: "pink", class: "bg-pink-500" },
  { value: "indigo", class: "bg-indigo-500" },
  { value: "teal", class: "bg-teal-500" },
];

const loadingMessages = [
  "Extracting syllabus...",
  "Analyzing course details...",
  "Finding deadlines...",
  "Processing assignments...",
  "Identifying exam dates...",
  "Parsing schedule...",
  "Organizing events...",
  "Almost done..."
];

export function AddCourseModal({ isOpen, onClose, onUpload }: AddCourseModalProps) {
  const [selectedColor, setSelectedColor] = useState<CourseColor>("cardinal");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [addToGoogleCalendar, setAddToGoogleCalendar] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

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

  // Check Google connection status when modal opens
  useEffect(() => {
    if (isOpen) {
      checkGoogleConnection();
    }
  }, [isOpen]);

  const checkGoogleConnection = async () => {
    try {
      const response = await fetch('/api/auth/google/status');
      if (response.ok) {
        const data = await response.json();
        setIsGoogleConnected(data.connected && data.valid);
      }
    } catch (error) {
      console.error('Error checking Google connection:', error);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      await onUpload(file, selectedColor, addToGoogleCalendar);
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
          errorMessage = "Unable to extract course information from the PDF. Please ensure it's a valid syllabus.";
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
    setSelectedColor("cardinal");
    setAddToGoogleCalendar(false);
    onClose();
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Course" className="max-w-lg">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Upload a syllabus PDF and we'll automatically extract the course details
        </p>

        {/* Course Color */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Course Color
          </label>
          <div className="flex gap-2">
            {courseColors.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setSelectedColor(color.value)}
                className={cn(
                  "h-10 w-10 rounded-lg transition-all",
                  color.class,
                  selectedColor === color.value
                    ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                    : "hover:scale-105"
                )}
                aria-label={`Select ${color.value} color`}
                disabled={uploading || success}
              />
            ))}
          </div>
        </div>

        {/* Dropzone */}
        {!file && !success && (
          <div
            {...getRootProps()}
            className={cn(
              "cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors",
              isDragActive
                ? "border-red-600 bg-red-50"
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                    <Loader2 className="h-5 w-5 text-red-700 animate-spin" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-red-700 animate-pulse">
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
                      className="bg-red-700 rounded-full h-2 animate-pulse transition-all duration-500"
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                    <FileText className="h-5 w-5 text-red-700" />
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
            <p className="font-medium text-green-900 mb-1">Course Added Successfully!</p>
            <p className="text-sm text-green-700">Your syllabus has been processed and events extracted.</p>
          </div>
        )}

        {/* Google Calendar Option */}
        {!success && file && !uploading && (
          <div className="space-y-3">
            {isGoogleConnected ? (
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={addToGoogleCalendar}
                  onChange={(e) => setAddToGoogleCalendar(e.target.checked)}
                  className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Add to Google Calendar
                  </p>
                  <p className="text-xs text-gray-500">
                    Create a new Google Calendar for this course
                  </p>
                </div>
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </label>
            ) : (
              <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Connect Google Calendar to sync events
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      You can connect your Google account to create calendars for your courses
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => window.location.href = '/api/auth/google'}
                    className="ml-4 whitespace-nowrap"
                  >
                    Connect Google
                  </Button>
                </div>
              </div>
            )}
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
