"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Check } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { CourseColor } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, color: CourseColor) => Promise<void>;
}

const courseColors: { value: CourseColor; class: string }[] = [
  { value: "purple", class: "bg-purple-500" },
  { value: "blue", class: "bg-blue-500" },
  { value: "red", class: "bg-red-500" },
  { value: "green", class: "bg-green-500" },
  { value: "orange", class: "bg-orange-500" },
  { value: "pink", class: "bg-pink-500" },
  { value: "indigo", class: "bg-indigo-500" },
  { value: "teal", class: "bg-teal-500" },
];

export function AddCourseModal({ isOpen, onClose, onUpload }: AddCourseModalProps) {
  const [selectedColor, setSelectedColor] = useState<CourseColor>("purple");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
      await onUpload(file, selectedColor);
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError(null);
    setSuccess(false);
    setUploading(false);
    setSelectedColor("purple");
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

        {/* File Preview */}
        {file && !success && (
          <div className="rounded-lg border border-gray-200 p-4">
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
          </div>
        )}

        {/* Success State */}
        {success && (
          <div className="rounded-lg bg-green-50 p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <p className="font-medium text-green-900 mb-1">Upload Successful!</p>
            <p className="text-sm text-green-700">Processing syllabus and extracting course details...</p>
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
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
