"use client";

import { useState, useCallback } from "react";
import { Cloud, File, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { storeDataset } from "@/lib/ipfs";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";

interface FileUploadProps {
  onUploadComplete: (cid: string, data: any) => void;
  accept?: Record<string, string[]>;
}

export function FileUpload({ onUploadComplete, accept = { 
  "application/json": [".json"],
  "text/csv": [".csv"]
} }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileData, setFileData] = useState<any>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      
      // Read the file contents
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const result = e.target?.result as string;
          
          // Parse the file content based on its type
          let parsedData;
          if (file.type === "application/json") {
            parsedData = JSON.parse(result);
          } else if (file.type === "text/csv") {
            // Simple CSV parsing (for more complex CSV, use a library like PapaParse)
            parsedData = result.split("\n").map(line => 
              line.split(",").map(value => value.trim())
            );
          } else {
            parsedData = result;
          }
          
          setFileData(parsedData);
        } catch (error) {
          console.error("Error parsing file:", error);
          toast.error("Invalid file format", {
            description: "Could not parse the file. Please ensure it's a valid JSON or CSV file."
          });
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    maxFiles: 1,
    accept
  });

  const handleUpload = async () => {
    if (!file || !fileData) return;

    setUploading(true);
    try {
      // Create metadata
      const metadata = {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: new Date(file.lastModified).toISOString()
      };

      // Upload to IPFS
      const cid = await storeDataset(fileData, metadata);
      
      // Call the complete handler
      onUploadComplete(cid, fileData);
      
      toast.success("File uploaded successfully", {
        description: `File stored on IPFS with CID: ${cid.substring(0, 10)}...`
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Upload failed", {
        description: "There was an error uploading your file. Please try again."
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer ${
          isDragActive ? "border-primary bg-muted/50" : "border-muted-foreground/25"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Cloud className="h-10 w-10 text-muted-foreground" />
          <div className="text-xl font-semibold">
            {isDragActive ? "Drop the file here" : "Drag & drop your dataset"}
          </div>
          <div className="text-sm text-muted-foreground">
            or click to browse (JSON or CSV)
          </div>
        </div>
      </div>

      {file && (
        <div className="p-2 mt-2 bg-muted/50 rounded flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <File className="h-6 w-6" />
            <div>
              <div className="text-sm font-medium">{file.name}</div>
              <div className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB
              </div>
            </div>
          </div>
          <Button
            onClick={handleUpload}
            disabled={uploading || !fileData}
            size="sm"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading
              </>
            ) : (
              "Upload to IPFS"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
