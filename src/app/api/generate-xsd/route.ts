import { postApi } from '@/lib/handlers/api-handlers';
import { NextRequest, NextResponse } from 'next/server';

// This is a placeholder for your actual backend endpoint.
const EXTERNAL_API_URL = 'https://example.com/generate-xsd';

export async function POST(request: NextRequest) {
  try {
    const { xml } = await request.json();

    if (!xml) {
      return NextResponse.json({ error: 'XML content is required' }, { status: 400 });
    }

    // In a real scenario, you might want to forward headers or handle authentication.
    const response = await postApi(EXTERNAL_API_URL, { xml }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error(`Error in /api/generate-xsd: ${error.message}`);
    return NextResponse.json({ error: 'Failed to generate XSD from external API' }, { status: 500 });
  }
}
