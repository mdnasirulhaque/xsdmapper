import { postApi } from '@/lib/handlers/api-handlers';
import { NextRequest, NextResponse } from 'next/server';
import { GENERATE_XSD_API_URL } from '@/lib/constants';


export async function POST(request: NextRequest) {
  try {
    const { xml } = await request.json();

    if (!xml) {
      return NextResponse.json({ error: 'XML content is required' }, { status: 400 });
    }

    // In a real scenario, you might want to forward headers or handle authentication.
    const response = await postApi(GENERATE_XSD_API_URL, { xml }, {
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
