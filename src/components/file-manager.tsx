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
      setFile(null) // Clear the file input
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
    <div className="max-w-2xl mx-auto mt-24 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold mb-6 text-gray-600 text-center">Cloudflare R2 with Next.js: Upload, Download, Delete</h1>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Upload File</h2>
      <form onSubmit={handleUpload} className="mb-8">
        <div className="flex items-center space-x-4">
          <label className="flex-1">
            <input
              type="file"
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
              id="file-upload"
            />
            <div className="cursor-pointer bg-blue-50 text-blue-500 rounded-lg px-4 py-2 border border-blue-300 hover:bg-blue-100 transition duration-300">
              {file ? file.name : 'Choose a file'}
            </div>
          </label>
          <button
            type="submit"
            disabled={!file || isUploading}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </form>

      {isUploading && (
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {uploadProgress.toFixed(2)}% uploaded
            </p>
            <button
              onClick={handleCancelUpload}
              className="text-red-500 hover:text-red-600 transition duration-300"
            >
              Cancel Upload
            </button>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Files</h2>
      {files.length === 0 ? (
        <p className="text-gray-500 italic">No files found.</p>
      ) : (
        <ul className="space-y-4">
          {files.map((file) => (
            <li
              key={file.Key}
              className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
            >
              <span className="text-gray-700 truncate flex-1">{file.Key}</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => file.Key && handleDownload(file.Key)}
                  className="text-blue-500 hover:text-blue-600 transition duration-300"
                >
                  Download
                </button>
                <button
                  onClick={() => file.Key && handleDelete(file.Key)}
                  className="text-red-500 hover:text-red-600 transition duration-300"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}