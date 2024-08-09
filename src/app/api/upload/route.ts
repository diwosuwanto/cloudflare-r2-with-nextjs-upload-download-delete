import { NextRequest, NextResponse } from 'next/server'
import { getSignedUrlForUpload } from '@/utils/r2'

export async function POST(request: NextRequest) {
  const { fileName, fileType } = await request.json()

  try {
    const signedUrl = await getSignedUrlForUpload(fileName, fileType)
    return NextResponse.json({ signedUrl })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error generating signed URL' },
      { status: 500 }
    )
  }
}
