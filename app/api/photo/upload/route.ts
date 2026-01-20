import { NextResponse } from 'next/server';
import { adminStorage } from '@/lib/firebase-admin';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const EXTENSIONS = ['jpg', 'jpeg', 'png'];

const MONDAY_API_URL = 'https://api.monday.com/v2';
const MONDAY_BOARD_ID = process.env.MONDAY_BOARD_ID;
const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;
const PIC_COLUMN_ID = 'text_mkzsavej';

// Find a unique filename by checking for existing files and adding numeric suffix if needed
async function findUniqueFilename(
  bucket: ReturnType<typeof adminStorage.bucket>,
  baseName: string,
  extension: string
): Promise<string> {
  // First, check if baseName.ext exists
  const baseFilename = `${baseName}.${extension}`;
  const baseFile = bucket.file(`pictures/${baseFilename}`);
  const [baseExists] = await baseFile.exists();

  if (!baseExists) {
    // Also check other extensions for the base name
    let anyBaseExists = false;
    for (const ext of EXTENSIONS) {
      if (ext === extension) continue;
      const [exists] = await bucket.file(`pictures/${baseName}.${ext}`).exists();
      if (exists) {
        anyBaseExists = true;
        break;
      }
    }
    if (!anyBaseExists) {
      return baseFilename;
    }
  }

  // Base name exists, find next available number
  let counter = 1;
  while (counter < 100) {
    // Safety limit
    const numberedName = `${baseName}${counter}`;
    let numberExists = false;

    for (const ext of EXTENSIONS) {
      const [exists] = await bucket.file(`pictures/${numberedName}.${ext}`).exists();
      if (exists) {
        numberExists = true;
        break;
      }
    }

    if (!numberExists) {
      return `${numberedName}.${extension}`;
    }
    counter++;
  }

  // Fallback: use timestamp
  return `${baseName}_${Date.now()}.${extension}`;
}

// Update the pic column for an item in Monday.com
async function updateItemPicColumn(itemId: string, picFilename: string): Promise<boolean> {
  if (!MONDAY_API_TOKEN || !MONDAY_BOARD_ID) {
    console.error('Monday.com configuration missing');
    return false;
  }

  const mutation = `
    mutation {
      change_simple_column_value(
        board_id: ${MONDAY_BOARD_ID},
        item_id: ${itemId},
        column_id: "${PIC_COLUMN_ID}",
        value: "${picFilename}"
      ) {
        id
      }
    }
  `;

  try {
    const response = await fetch(MONDAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: MONDAY_API_TOKEN,
      },
      body: JSON.stringify({ query: mutation }),
    });

    const data = await response.json();

    if (!response.ok || data.errors) {
      console.error('Monday.com update error:', JSON.stringify(data, null, 2));
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to update Monday.com pic column:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const baseName = formData.get('baseName') as string | null;
    const itemId = formData.get('itemId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!baseName) {
      return NextResponse.json({ error: 'No baseName provided' }, { status: 400 });
    }

    if (!itemId) {
      return NextResponse.json({ error: 'No itemId provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, JPEG, and PNG are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get file extension from uploaded file
    const extension = file.type === 'image/png' ? 'png' : 'jpg';

    // Upload to Firebase Storage
    const bucket = adminStorage.bucket();

    // Find a unique filename
    const uniqueFilename = await findUniqueFilename(bucket, baseName, extension);
    const filePath = `pictures/${uniqueFilename}`;
    const fileRef = bucket.file(filePath);

    // Upload file
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // Update Monday.com pic column
    const mondayUpdated = await updateItemPicColumn(itemId, uniqueFilename);
    if (!mondayUpdated) {
      console.warn('Photo uploaded but failed to update Monday.com pic column');
    }

    return NextResponse.json({
      success: true,
      path: filePath,
      filename: uniqueFilename,
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to upload photo',
      },
      { status: 500 }
    );
  }
}
