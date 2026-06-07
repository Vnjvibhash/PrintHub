"use client";

import React, { useRef, useState } from "react";
import { storageService } from "@/lib/firebase";
import { Upload, File, Image, AlertCircle, CheckCircle, RefreshCw, X } from "lucide-react";

interface FileUploaderProps {
  onUploadSuccess: (fileUrl: string, fileMetadata: { name: string; size: number; type: string }) => void;
  onUploadStart?: () => void;
  onUploadError?: (err: string) => void;
  maxSizeMB?: number;
}

export default function FileUploader({
  onUploadSuccess,
  onUploadStart,
  onUploadError,
  maxSizeMB = 500,
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
    "image/png",
    "image/jpeg",
    "image/jpg",
  ];

  const validateFile = (selectedFile: File): boolean => {
    // 1. Check size limit
    const sizeLimitBytes = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > sizeLimitBytes) {
      const err = `File exceeds the maximum size limit of ${maxSizeMB}MB.`;
      setErrorMessage(err);
      setUploadState("error");
      if (onUploadError) onUploadError(err);
      return false;
    }

    // 2. Check format type
    if (!allowedExtensions.includes(selectedFile.type)) {
      const err = "Unsupported file type. Please upload a PDF, DOCX, PPTX, XLSX, or Image.";
      setErrorMessage(err);
      setUploadState("error");
      if (onUploadError) onUploadError(err);
      return false;
    }

    setErrorMessage("");
    return true;
  };

  const handleUpload = async (fileToUpload: File) => {
    setUploadState("uploading");
    setProgress(0);
    if (onUploadStart) onUploadStart();

    const timestamp = Date.now();
    const storagePath = `uploads/users/anonymous/${timestamp}_${fileToUpload.name}`;

    try {
      const downloadUrl = await storageService.uploadFile(fileToUpload, storagePath, (p) => {
        setProgress(p);
      });
      setUploadState("success");
      onUploadSuccess(downloadUrl, {
        name: fileToUpload.name,
        size: fileToUpload.size,
        type: fileToUpload.type,
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      const errText = "File upload failed. Please try again.";
      setErrorMessage(errText);
      setUploadState("error");
      if (onUploadError) onUploadError(errText);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        handleUpload(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        handleUpload(selectedFile);
      }
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const resetUploader = () => {
    setFile(null);
    setProgress(0);
    setUploadState("idle");
    setErrorMessage("");
  };

  const getFileIcon = () => {
    if (!file) return <File className="w-8 h-8" />;
    if (file.type.startsWith("image/")) return <Image className="w-8 h-8 text-indigo-500" />;
    return <File className="w-8 h-8 text-indigo-500" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.docx,.xlsx,.pptx,.png,.jpg,.jpeg"
      />

      {uploadState === "idle" && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all duration-200 ${
            dragActive
              ? "border-indigo-500 bg-indigo-500/5 scale-[0.99]"
              : "border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/10"
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
            Drag & drop your file, or <span className="text-indigo-600 dark:text-indigo-400">browse</span>
          </p>
          <p className="text-xs text-zinc-400 mt-2">
            PDF, DOCX, PPTX, XLSX, PNG, JPG, or JPEG (Max {maxSizeMB}MB)
          </p>
        </div>
      )}

      {uploadState === "uploading" && file && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 bg-white dark:bg-zinc-950/40 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              {getFileIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-zinc-800 dark:text-zinc-100">{file.name}</p>
              <p className="text-xs text-zinc-400">{formatSize(file.size)}</p>
            </div>
            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              {progress}%
            </div>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 dark:bg-indigo-400 h-2 rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-center text-zinc-400">Uploading and generating secure link...</p>
        </div>
      )}

      {uploadState === "success" && file && (
        <div className="border border-emerald-500/20 rounded-2xl p-6 bg-emerald-500/5 dark:bg-emerald-950/5 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-emerald-700 dark:text-emerald-400">{file.name}</p>
              <p className="text-xs text-emerald-600/60 dark:text-emerald-400/60">{formatSize(file.size)} • Upload Completed</p>
            </div>
            <button
              onClick={resetUploader}
              className="p-1 rounded-full hover:bg-emerald-500/10 text-emerald-500 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {uploadState === "error" && (
        <div className="border border-rose-500/20 rounded-2xl p-6 bg-rose-500/5 dark:bg-rose-950/5 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">Upload Failed</p>
              <p className="text-xs text-rose-600/60 dark:text-rose-400/60 truncate">{errorMessage}</p>
            </div>
            <button
              onClick={resetUploader}
              className="p-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500/20 flex items-center"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
