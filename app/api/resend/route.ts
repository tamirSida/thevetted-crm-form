import { NextResponse } from 'next/server';

const RESEND_API_URL = 'https://api.resend.com';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

interface ResendSegment {
  id: string;
  name: string;
  created_at: string;
}

interface ResendSegmentsResponse {
  object: string;
  has_more: boolean;
  data: ResendSegment[];
}

interface ResendContact {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  unsubscribed: boolean;
}

interface CreateContactRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  segmentIds: string[];
}

async function resendRequest(
  endpoint: string,
  options: {
    method?: string;
    body?: Record<string, unknown>;
  } = {}
) {
  const { method = 'GET', body } = options;

  const response = await fetch(`${RESEND_API_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Resend API error: ${response.statusText}`
    );
  }

  return response.json();
}

export async function GET() {
  if (!RESEND_API_KEY) {
    return NextResponse.json(
      { error: 'Resend API key not configured' },
      { status: 500 }
    );
  }

  try {
    const data: ResendSegmentsResponse = await resendRequest('/segments');

    return NextResponse.json({
      segments: data.data.map((segment) => ({
        id: segment.id,
        name: segment.name,
      })),
    });
  } catch (error) {
    console.error('Error fetching Resend segments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch segments from Resend' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!RESEND_API_KEY) {
    return NextResponse.json(
      { error: 'Resend API key not configured' },
      { status: 500 }
    );
  }

  try {
    const body: CreateContactRequest = await request.json();

    // Step 1: Create the contact
    const contactData: ResendContact = await resendRequest('/contacts', {
      method: 'POST',
      body: {
        email: body.email,
        first_name: body.firstName || '',
        last_name: body.lastName || '',
        unsubscribed: false,
      },
    });

    const contactId = contactData.id;

    // Step 2: Add contact to each selected segment
    const segmentResults = await Promise.all(
      body.segmentIds.map(async (segmentId) => {
        try {
          await resendRequest(`/contacts/${contactId}/segments/${segmentId}`, {
            method: 'POST',
          });
          return { segmentId, success: true };
        } catch (error) {
          console.error(`Error adding contact to segment ${segmentId}:`, error);
          return { segmentId, success: false, error: String(error) };
        }
      })
    );

    const failedSegments = segmentResults.filter((r) => !r.success);

    if (failedSegments.length > 0) {
      console.warn(
        'Some segments failed to add:',
        JSON.stringify(failedSegments, null, 2)
      );
    }

    return NextResponse.json({
      success: true,
      contactId,
      segmentResults,
    });
  } catch (error) {
    console.error('Error creating Resend contact:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create contact in Resend',
      },
      { status: 500 }
    );
  }
}
