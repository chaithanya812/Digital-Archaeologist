"use client"

import { useCallback, useState } from "react"
import { Upload, X, Image as ImageIcon, FileImage } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ImageUploaderProps {
  onImageSelect: (file: File, previewUrl: string) => void
  onClear: () => void
  selectedImage: string | null
}

export default function ImageUploader({ onImageSelect, onClear, selectedImage }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const validateAndProcessFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be less than 10MB")
      return
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    onImageSelect(file, previewUrl)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      validateAndProcessFile(file)
    }
  }, [onImageSelect])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndProcessFile(file)
    }
  }

  // Example images from the public folder
  const exampleImages = [
    { name: "WhatsApp Image 1", path: "/WhatsApp Image 2025-10-17 at 12.26.09_43c22aa9.jpg" },
    { name: "WhatsApp Image 2", path: "/WhatsApp Image 2025-10-17 at 14.07.08_5b7e4077.jpg" },
    { name: "WhatsApp Image 3", path: "/WhatsApp Image 2025-10-17 at 14.09.58_20e826b0.jpg" },
    { name: "WhatsApp Image 4", path: "/WhatsApp Image 2025-10-17 at 14.23.39_25928c5a.jpg" },
  ];

  const handleExampleImageSelect = async (imagePath: string, imageName: string) => {
    try {
      // Fetch the image and convert it to a File object
      const response = await fetch(imagePath);
      const blob = await response.blob();
      const file = new File([blob], imageName, { type: blob.type });
      onImageSelect(file, imagePath);
    } catch (error) {
      console.error('Failed to load example image:', error);
      // Fallback to just showing the preview
      onImageSelect(new File([], imageName), imagePath);
    }
  }

  return (
    <Card className="p-8">
      {selectedImage ? (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden border-2 border-border">
            <img
              src={selectedImage}
              alt="Selected historical artifact"
              className="w-full h-auto max-h-[400px] object-contain bg-muted"
            />
          </div>
          <Button
            onClick={onClear}
            variant="outline"
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Clear Image
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center transition-colors
              ${isDragging 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
              }
            `}
          >
            <div className="flex flex-col items-center gap-4">
              <div className={`
                p-4 rounded-full transition-colors
                ${isDragging ? "bg-primary/10" : "bg-muted"}
              `}>
                {isDragging ? (
                  <ImageIcon className="w-8 h-8 text-primary" />
                ) : (
                  <Upload className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  Upload Historical Digital Artifact
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Drag and drop an image here, or click to browse. 
                  Supports screenshots, photos, and digital artifacts up to 10MB.
                </p>
              </div>

              <label htmlFor="file-upload">
                <Button asChild>
                  <span className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Select Image
                  </span>
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Example Images Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-center">Or try with example images:</h3>
            <div className="grid grid-cols-2 gap-3">
              {exampleImages.map((image, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="flex flex-col h-auto p-2"
                  onClick={() => handleExampleImageSelect(image.path, image.name)}
                >
                  <div className="relative w-full aspect-square mb-2">
                    <img
                      src={image.path}
                      alt={image.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <span className="text-xs">{image.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}