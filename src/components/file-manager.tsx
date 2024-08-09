'use client'

import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useRef
} from 'react'
import { FileObject } from '../utils/r2'

export default function FileManager() {
  const [files, setFiles] = useState<FileObject[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files')
      const data = await response.json()
      setFiles(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching files:', error)
      setFiles([])
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type })
      })
      const { signedUrl } = await response.json()

      await uploadFileWithProgress(
        file,
        signedUrl,
        abortControllerRef.current.signal
      )

      alert('File uploaded successfully!')
      fetchFiles()
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Upload cancelled')
      } else {
        console.error('Error uploading file:', error)
        alert('Error uploading file')
      }
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      abortControllerRef.current = null
    }
  }

  const uploadFileWithProgress = (
    file: File,
    signedUrl: string,
    signal: AbortSignal
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.open('PUT', signedUrl)
      xhr.setRequestHeader('Content-Type', file.type)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100
          setUploadProgress(percentComplete)
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve()
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      }

      xhr.onerror = () => {
        reject(new Error('Upload failed'))
      }

      xhr.send(file)

      signal.addEventListener('abort', () => {
        xhr.abort()
        reject(new Error('Upload cancelled'))
      })
    })
  }

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  const handleDownload = async (key: string) => {
    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      })
      const { signedUrl } = await response.json()
      window.open(signedUrl, '_blank')
    } catch (error) {
      console.error('Error downloading file:', error)
      alert('Error downloading file')
    }
  }

  const handleDelete = async (key: string) => {
    try {
      await fetch('/api/files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      })
      alert('File deleted successfully!')
      fetchFiles()
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Error deleting file')
    }
  }

  return (
    <div>
      <h2>Upload File</h2>
      <form onSubmit={handleUpload}>
        <input type="file" onChange={handleFileChange} disabled={isUploading} />
        <button type="submit" disabled={!file || isUploading}>
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {isUploading && (
        <div>
          <progress value={uploadProgress} max="100" />
          <p>{uploadProgress.toFixed(2)}% uploaded</p>
          <button onClick={handleCancelUpload}>Cancel Upload</button>
        </div>
      )}

      <h2>Files</h2>
      {files.length === 0 ? (
        <p>No files found.</p>
      ) : (
        <ul>
          {files.map((file) => (
            <li key={file.Key}>
              {file.Key}
              <button onClick={() => file.Key && handleDownload(file.Key)}>
                Download
              </button>
              <button onClick={() => file.Key && handleDelete(file.Key)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
