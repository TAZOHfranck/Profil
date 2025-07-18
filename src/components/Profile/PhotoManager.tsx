import React, { useState, useRef } from 'react'
import { Camera, X, Upload, Star } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface PhotoManagerProps {
  photos: string[]
  onPhotosUpdate: (photos: string[]) => void
}

const PhotoManager: React.FC<PhotoManagerProps> = ({ photos, onPhotosUpdate }) => {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || !user) return

    setUploading(true)
    const newPhotos = [...photos]

    try {
      for (const file of Array.from(files)) {
        if (newPhotos.length >= 6) break // Limite de 6 photos

        // Validate file type
        if (!file.type.startsWith('image/')) {
          console.error('File is not an image')
          continue
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          console.error('File is too large')
          continue
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { data, error } = await supabase.storage
          .from('photos')
          .upload(fileName, file)

        if (error) {
          console.error('Error uploading file:', error)
          continue
        }

        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(fileName)

        newPhotos.push(publicUrl)
      }

      onPhotosUpdate(newPhotos)
    } catch (error) {
      console.error('Error uploading photos:', error)
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = async (index: number) => {
    const photoUrl = photos[index]
    const newPhotos = photos.filter((_, i) => i !== index)

    try {
      // Extract file path from URL
      const urlParts = photoUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const filePath = `${user?.id}/${fileName}`

      // Remove from storage
      const { error } = await supabase.storage
        .from('photos')
        .remove([filePath])

      if (error) {
        console.error('Error removing photo from storage:', error)
      }

      onPhotosUpdate(newPhotos)
    } catch (error) {
      console.error('Error removing photo:', error)
    }
  }

  const setPrimaryPhoto = (index: number) => {
    const newPhotos = [...photos]
    const [primaryPhoto] = newPhotos.splice(index, 1)
    newPhotos.unshift(primaryPhoto)
    onPhotosUpdate(newPhotos)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null) return

    const newPhotos = [...photos]
    const [draggedPhoto] = newPhotos.splice(draggedIndex, 1)
    newPhotos.splice(dropIndex, 0, draggedPhoto)

    onPhotosUpdate(newPhotos)
    setDraggedIndex(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Mes Photos</h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || photos.length >= 6}
          className="bg-gradient-to-r from-violet-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-violet-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>{uploading ? 'Upload...' : 'Ajouter'}</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-move"
          >
            <img
              src={photo}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = 'https://via.placeholder.com/300x300?text=Image+Error'
              }}
            />
            
            {/* Primary photo indicator */}
            {index === 0 && (
              <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                <Star className="h-3 w-3 fill-current" />
                <span>Principal</span>
              </div>
            )}

            {/* Actions overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
              {index !== 0 && (
                <button
                  onClick={() => setPrimaryPhoto(index)}
                  className="bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600 transition-colors"
                  title="Définir comme photo principale"
                >
                  <Star className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => removePhoto(index)}
                className="bg-violet-500 text-white p-2 rounded-full hover:bg-violet-600 transition-colors"
                title="Supprimer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Add photo placeholder */}
        {photos.length < 6 && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-violet-500 hover:text-violet-500 transition-colors disabled:opacity-50"
          >
            <Camera className="h-8 w-8 mb-2" />
            <span className="text-sm">Ajouter une photo</span>
          </button>
        )}
      </div>

      <p className="text-sm text-gray-600">
        Vous pouvez ajouter jusqu'à 6 photos (max 5MB chacune). Glissez-déposez pour réorganiser.
        La première photo sera votre photo principale.
      </p>
    </div>
  )
}

export default PhotoManager