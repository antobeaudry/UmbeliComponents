import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { CloudUploadOutline } from 'react-ionicons';
import { Button } from '@umbeli/ui';

interface DragDropUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  isLoading?: boolean;
}

export const DragDropUpload: React.FC<DragDropUploadProps> = ({
  onFileSelect,
  accept = 'video/*,image/*',
  maxSizeMB = 50,
  className = '',
  isLoading = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) setIsDragOver(true);
  };

  const validateFile = (file: File): boolean => {
    setError(null);
    
    // Check file type
    if (accept) {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const fileType = file.type;
      const fileName = file.name.toLowerCase();
      
      const isValidType = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          const mainType = type.split('/')[0];
          return fileType.startsWith(mainType);
        }
        if (type.startsWith('.')) {
          return fileName.endsWith(type.toLowerCase());
        }
        return fileType === type;
      });

      if (!isValidType) {
        setError('Type de fichier non supporté');
        return false;
      }
    }

    // Check size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Le fichier dépasse la taille maximale de ${maxSizeMB}MB`);
      return false;
    }

    return true;
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (isLoading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isLoading) return;

    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={`drag-drop-upload ${isDragOver ? 'is-drag-over' : ''} ${isLoading ? 'is-loading' : ''} ${className}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept={accept}
        className="drag-drop-upload__input"
        disabled={isLoading}
      />

      <div className="drag-drop-upload__content">
        {isLoading ? (
          <div className="drag-drop-upload__loader">
            <div className="drag-drop-upload__spinner" />
            <p className="drag-drop-upload__progress-text">Téléchargement en cours...</p>
          </div>
        ) : (
          <>
            <div className="drag-drop-upload__icon-wrapper">
              <CloudUploadOutline
                color="currentColor"
                width="48px"
                height="48px"
              />
            </div>
            
            <div className="drag-drop-upload__text-wrapper">
              <p className="drag-drop-upload__title">
                Glissez votre fichier ici
              </p>
              <p className="drag-drop-upload__divider">
                ou
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleButtonClick}
                type="button"
              >
                Parcourir les fichiers
              </Button>
            </div>

            <div className="drag-drop-upload__meta">
              Supporte: {accept.replace(/\*/g, '')} (Max {maxSizeMB}MB)
            </div>

            {error && (
              <div className="drag-drop-upload__error">
                {error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
