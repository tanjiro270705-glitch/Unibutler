import { useState } from 'react'
import { API_BASE } from '../../shared/api'
import './ImageUpload.css'

export default function ImageUpload({ onUploadComplete }) {
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset states
    setError('')
    setUploading(true)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      setUploading(false)
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB')
      setUploading(false)
      return
    }

    try {
      // Quick ping to check server upload controller availability
      try {
        const pingRes = await fetch(`${API_BASE}/upload/ping`);
        if (!pingRes.ok) {
          console.warn('Upload controller ping failed:', pingRes.status);
        } else {
          console.debug('Upload controller ping OK');
        }
      } catch (pingErr) {
        console.warn('Upload controller ping error', pingErr);
      }

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)

      // Prepare form data
      const formData = new FormData()
      formData.append('image', file)

      // Get token
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Authentication required')

      // Upload using direct fetch to avoid api() helper issues with FormData
      const res = await fetch(`${API_BASE}/upload/image`, {
        method: 'POST',
        headers: { 'X-Auth-Token': token },
        body: formData,
      });
      
      if (!res.ok) {
        const errorText = await res.text().catch(() => res.statusText);
        throw new Error(errorText || `Upload failed (${res.status})`);
      }
      
      const data = await res.json().catch(() => ({}));
      
      // Call the callback with uploaded image URL
      if (onUploadComplete) onUploadComplete(data.url || data?.data?.url || data?.url || '');

    } catch (err) {
      setError(err.message || 'Upload failed')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="image-upload">
      <label className="image-upload__btn">
        <input
          type="file"
          className="image-upload__input"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {uploading ? 'Uploading...' : 'Choose Image'}
      </label>

      {error && <div className="image-upload__error">{error}</div>}
      
      {uploading && (
        <div className="image-upload__loading">
          Uploading image...
        </div>
      )}

      {preview && (
        <div className="image-upload__preview">
          <img src={preview} alt="Preview" />
        </div>
      )}
    </div>
  )
}