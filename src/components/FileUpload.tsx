import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { validateImageFile, createImagePreview, revokeImagePreview } from '@/lib/image';
import { Upload, X, Image as ImageIcon, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Img from '@/components/Img';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile?: File | null;
  previewUrl?: string | null;
  onClear?: () => void;
  disabled?: boolean;
  isUploading?: boolean;
  uploadProgress?: number;
}

export function FileUpload({
  onFileSelect,
  selectedFile,
  previewUrl,
  onClear,
  disabled,
  isUploading,
  uploadProgress,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }
    setError(null);
    onFileSelect(file);
  }, [onFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onClear?.();
  };

  return (
    <div className="w-full space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
        aria-label="Upload product image"
      />

      <AnimatePresence mode="wait">
        {previewUrl ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-xl overflow-hidden border border-border"
          >
            <Img
              src={previewUrl as string}
              alt="Selected product"
              className="w-full aspect-video object-cover"
            />
            
            {/* Upload progress overlay */}
            {isUploading && typeof uploadProgress === 'number' && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Uploading... {Math.round(uploadProgress)}%
                  </p>
                </div>
              </div>
            )}

            {/* Clear button */}
            {!isUploading && (
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-3 right-3 w-8 h-8 rounded-full"
                onClick={handleClear}
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </Button>
            )}

            {/* File info */}
            {selectedFile && !isUploading && (
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background to-transparent">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              'relative flex flex-col items-center justify-center',
              'w-full aspect-video rounded-xl border-2 border-dashed',
              'cursor-pointer transition-all duration-200',
              isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50 hover:bg-muted/30',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            role="button"
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleClick();
              }
            }}
            aria-label="Drop image here or click to upload"
          >
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <div className={cn(
                'p-4 rounded-full',
                isDragging ? 'bg-primary/20' : 'bg-muted'
              )}>
                {isDragging ? (
                  <Upload className="w-8 h-8 text-primary" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              
              <div>
                <p className="font-medium">
                  {isDragging ? 'Drop your image here' : 'Drop product image here'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse • JPEG, PNG, WebP up to 10MB
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload File
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Camera className="w-4 h-4" />
                  Take Photo
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-danger flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          {error}
        </motion.p>
      )}
    </div>
  );
}
