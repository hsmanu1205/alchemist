import React, { useCallback, useState } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  onFileSelect: (files: File[]) => void;
  onFileRemove?: (index: number) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  title: string;
  description?: string;
  files?: File[];
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  accept = ".csv,.xlsx,.xls",
  multiple = false,
  onFileSelect,
  onFileRemove,
  maxFiles = 1,
  maxSize = 10,
  title,
  description,
  files = [],
  className,
  disabled = false,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type
    const allowedTypes = accept.split(",").map((type) => type.trim());
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    const mimeType = file.type;

    const isValidType = allowedTypes.some(
      (type) => type === fileExtension || type === mimeType,
    );

    if (!isValidType) {
      return `File type not supported. Allowed types: ${accept}`;
    }

    return null;
  };

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles || disabled) return;

      const fileArray = Array.from(newFiles);
      const validFiles: File[] = [];
      const newErrors: string[] = [];

      fileArray.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          newErrors.push(`${file.name}: ${error}`);
        } else {
          validFiles.push(file);
        }
      });

      // Check total file count
      if (files.length + validFiles.length > maxFiles) {
        newErrors.push(`Maximum ${maxFiles} file(s) allowed`);
        setErrors(newErrors);
        return;
      }

      setErrors(newErrors);
      if (validFiles.length > 0) {
        onFileSelect(validFiles);
      }
    },
    [files.length, maxFiles, disabled, accept, maxSize, onFileSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      e.target.value = ""; // Reset input
    },
    [handleFiles],
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
          "hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
          isDragOver && !disabled && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed",
          files.length > 0 ? "border-success bg-success/5" : "border-border",
        )}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="space-y-4">
          {files.length > 0 ? (
            <CheckCircle className="w-12 h-12 mx-auto text-success" />
          ) : (
            <Upload
              className={cn(
                "w-12 h-12 mx-auto",
                isDragOver && !disabled
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            />
          )}

          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>

          {files.length === 0 && (
            <div className="text-sm text-muted-foreground">
              <p>Drop your files here or click to browse</p>
              <p className="mt-1">Supported formats: {accept.toUpperCase()}</p>
              <p>Maximum size: {maxSize}MB</p>
            </div>
          )}
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">
            Selected Files:
          </h4>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              {onFileRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFileRemove(index)}
                  className="h-8 w-8 p-0 hover:bg-destructive/10"
                >
                  <X className="w-4 h-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
            >
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
