import { NextResponse } from 'next/server';

const MONDAY_API_URL = 'https://api.monday.com/v2';
const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;
const MONDAY_BOARD_ID = process.env.MONDAY_BOARD_ID;

interface MondayLabel {
  id: number;
  name: string;
}

interface MondayColumn {
  id: string;
  title: string;
  type: string;
  settings_str: string;
}

async function mondayRequest(query: string, variables?: Record<string, unknown>) {
  const response = await fetch(MONDAY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: MONDAY_API_TOKEN || '',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Monday.com API error: ${response.statusText}`);
  }

  return response.json();
}

export async function GET() {
  if (!MONDAY_API_TOKEN || !MONDAY_BOARD_ID) {
    return NextResponse.json(
      { error: 'Monday.com configuration missing' },
      { status: 500 }
    );
  }

  try {
    const query = `{
      boards(ids: ${MONDAY_BOARD_ID}) {
        columns {
          id
          title
          type
          settings_str
        }
      }
    }`;

    const data = await mondayRequest(query);
    const columns: MondayColumn[] = data.data.boards[0].columns;

    const areaOfExpertiseColumn = columns.find((col) => col.id === 'dropdown5__1');
    const labelColumn = columns.find((col) => col.id === 'dropdown_mkrv1p9m');

    const parseDropdownOptions = (settingsStr: string): MondayLabel[] => {
      try {
        const settings = JSON.parse(settingsStr);
        return settings.labels || [];
      } catch {
        return [];
      }
    };

    const areaOfExpertiseOptions = areaOfExpertiseColumn
      ? parseDropdownOptions(areaOfExpertiseColumn.settings_str)
      : [];
    const labelOptions = labelColumn
      ? parseDropdownOptions(labelColumn.settings_str)
      : [];

    return NextResponse.json({
      areaOfExpertise: areaOfExpertiseOptions.map((opt) => ({
        id: opt.id,
        name: opt.name,
      })),
      labels: labelOptions.map((opt) => ({
        id: opt.id,
        name: opt.name,
      })),
    });
  } catch (error) {
    console.error('Error fetching Monday.com options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch options from Monday.com' },
      { status: 500 }
    );
  }
}

interface CreateItemRequest {
  fullName: string;
  email: string;
  employer?: string;
  role?: string;
  linkedin?: string;
  location?: string;
  areaOfExpertise: number[];
  labels: number[];
  notes?: string;
}

export async function POST(request: Request) {
  if (!MONDAY_API_TOKEN || !MONDAY_BOARD_ID) {
    return NextResponse.json(
      { error: 'Monday.com configuration missing' },
      { status: 500 }
    );
  }

  try {
    const body: CreateItemRequest = await request.json();

    const columnValues: Record<string, unknown> = {
      email__1: { email: body.email, text: body.email },
    };

    if (body.employer) {
      columnValues['text__1'] = body.employer;
    }

    if (body.role) {
      columnValues['text_mkygh34f'] = body.role;
    }

    if (body.linkedin) {
      columnValues['text_2__1'] = body.linkedin;
    }

    // Note: location__1 is a location type column that requires lat/lng
    // For now, we skip it since we only have text address
    // If you need location, consider adding a text column for it in Monday.com

    if (body.areaOfExpertise && body.areaOfExpertise.length > 0) {
      columnValues['dropdown5__1'] = { ids: body.areaOfExpertise };
    }

    if (body.labels && body.labels.length > 0) {
      columnValues['dropdown_mkrv1p9m'] = { ids: body.labels };
    }

    if (body.notes) {
      columnValues['text_mkygas91'] = body.notes;
    }

    const mutation = `
      mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
        create_item(board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
          id
          name
        }
      }
    `;

    const variables = {
      boardId: MONDAY_BOARD_ID,
      itemName: body.fullName,
      columnValues: JSON.stringify(columnValues),
    };

    const data = await mondayRequest(mutation, variables);

    if (data.errors) {
      console.error('Monday.com mutation errors:', JSON.stringify(data.errors, null, 2));
      console.error('Column values sent:', JSON.stringify(columnValues, null, 2));
      const errorMessage = data.errors[0]?.message || 'Failed to create item in Monday.com';
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      item: data.data.create_item,
    });
  } catch (error) {
    console.error('Error creating Monday.com item:', error);
    return NextResponse.json(
      { error: 'Failed to create item in Monday.com' },
      { status: 500 }
    );
  }
}
