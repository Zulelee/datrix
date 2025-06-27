import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get token from query parameters
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'token query parameter is required'
      }, { status: 400 });
    }
    
    // Make request to Airtable API
    const response = await fetch('https://api.airtable.com/v0/meta/bases', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch bases from Airtable',
        error: errorData,
        status: response.status
      }, { status: response.status });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Error fetching Airtable bases:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get token from request body
    const body = await request.json();
    const { token } = body;
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'token is required in request body'
      }, { status: 400 });
    }
    
    // Make request to Airtable API
    const response = await fetch('https://api.airtable.com/v0/meta/bases', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch bases from Airtable',
        error: errorData,
        status: response.status
      }, { status: response.status });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Error fetching Airtable bases:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 