import { NextRequest, NextResponse } from 'next/server'
import { listFiles, getSignedUrlForDownload, deleteFile } from '@/utils/r2'

export async function GET() {
  try {
    const files = await listFiles()
    return NextResponse.json(files)
  } catch (error) {
    return NextResponse.json({ error: 'Error listing files' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { key } = await request.json()

  try {
    const signedUrl = await getSignedUrlForDownload(key)
    return NextResponse.json({ signedUrl })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error generating download URL' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const { key } = await request.json()

  try {
    await deleteFile(key)
    return NextResponse.json({ message: 'File deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting file' }, { status: 500 })
  }
}
