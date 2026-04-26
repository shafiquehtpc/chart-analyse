"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Upload, Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface ChartUploaderProps {
  onUploadSuccess: (imageUrl: string) => void;
  onError: (error: string) => void;
}

export default function ChartUploader({
  onUploadSuccess,
  onError,
}: ChartUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);

      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload an image file");
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB");
      }

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `chart-${timestamp}-${Math.random().toString(36).substring(7)}.${file.type.split("/")[1]}`;

      // Upload to Supabase
      const { data, error: uploadError } = await supabase.storage
        .from("charts")
        .upload(filename, file);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("charts").getPublicUrl(data.path);

      onUploadSuccess(publicUrl);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      onError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
        isDragging
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 bg-gray-50 hover:border-gray-400"
      } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        disabled={isUploading}
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-gray-600">Uploading...</p>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-3"
        >
          <Upload className="w-8 h-8 text-gray-400" />
          <div>
            <p className="text-gray-700 font-medium">
              Drag and drop your chart here
            </p>
            <p className="text-gray-500 text-sm">or click to select a file</p>
          </div>
          <p className="text-xs text-gray-400">PNG, JPG, GIF (max 5MB)</p>
        </div>
      )}
    </div>
  );
}