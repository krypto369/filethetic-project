"use client";
import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { useFileUpload, UseFileUploadProps } from "@/hooks/storage/useFileUpload";

export const FileUploader = ({ onUploadComplete }: UseFileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { isConnected } = useAccount();

  const { uploadFileMutation, uploadedInfo, handleReset, status, progress } =
    useFileUpload({ onUploadComplete });

  const { isPending: isLoading, mutateAsync: uploadFile } = uploadFileMutation;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  }, []);

  if (!isConnected) {
    return null;
  }

  return (
    <div className="mt-4 p-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/50"
            : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
        }`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        <input
          id="fileInput"
          type="file"
          onChange={(e) => {
            e.target.files && setFile(e.target.files[0]);
            e.target.value = "";
          }}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-2">
          <svg
            className={`w-10 h-10 ${
              isDragging
                ? "text-blue-500 dark:text-blue-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-lg font-medium">
            {file ? file.name : "Drop your file here, or click to select"}
          </p>
          {!file && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Drag and drop your file, or click to browse
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={async () => {
            if (!file) return;
            await uploadFile(file);
          }}
          disabled={!file || isLoading || !!uploadedInfo}
          aria-disabled={!file || isLoading}
          className={`px-6 py-2 rounded-[20px] text-center border-2 transition-all
            ${
              !file || isLoading || uploadedInfo
                ? "border-gray-200 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:text-gray-500"
                : "border-secondary text-gray-800 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary/50 hover:border-secondary/70 hover:cursor-pointer dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-400"
            }
          `}
        >
          {isLoading ? "Uploading..." : !uploadedInfo ? "Submit" : "Submitted"}
        </button>
        <button
          onClick={() => {
            handleReset();
            setFile(null);
          }}
          disabled={!file || isLoading}
          aria-disabled={!file || isLoading}
          className={`px-6 py-2 rounded-[20px] text-center border-2 transition-all
            ${
              !file || isLoading
                ? "border-gray-200 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:text-gray-500"
                : "border-secondary text-gray-800 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary/50 hover:border-secondary/70 hover:cursor-pointer dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-400"
            }
          `}
        >
          Reset
        </button>
      </div>
      {status && (
        <div className="mt-4 text-center">
          <p
            className={`text-sm
              ${
                status.includes("❌")
                  ? "text-red-500 dark:text-red-400"
                  : status.includes("✅") || status.includes("🎉")
                  ? "text-green-500 dark:text-green-400"
                  : "text-gray-800 dark:text-gray-300"
              }
            `}
          >
            {status}
          </p>
          {isLoading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 dark:bg-gray-700">
              <div
                className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}
      {/* Uploaded file info panel */}
      {uploadedInfo && !isLoading && (
        <div className="mt-6 bg-background border border-border rounded-xl p-4 text-left">
          <h4 className="font-semibold mb-2 text-foreground">
            File Upload Details
          </h4>
          <div className="text-sm text-foreground">
            <div>
              <span className="font-medium">File name:</span>{" "}
              {uploadedInfo.fileName}
            </div>
            <div>
              <span className="font-medium">File size:</span>{" "}
              {uploadedInfo.fileSize?.toLocaleString() || "N/A"} bytes
            </div>
            <div className="break-all">
              <span className="font-medium">CID:</span> {uploadedInfo.cid}
            </div>
            <div className="break-all">
              <span className="font-medium">Tx Hash:</span>{" "}
              {uploadedInfo.txHash}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
