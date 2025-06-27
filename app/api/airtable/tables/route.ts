import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get token and baseId from query parameters
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const baseId = searchParams.get('baseId');
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'token query parameter is required'
      }, { status: 400 });
    }
    
    if (!baseId) {
      return NextResponse.json({
        success: false,
        message: 'baseId query parameter is required'
      }, { status: 400 });
    }
    
    // Make request to Airtable API
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
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
        message: 'Failed to fetch tables from Airtable',
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
    console.error('Error fetching Airtable tables:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get token and baseId from request body
    const body = await request.json();
    const { token, baseId } = body;
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'token is required in request body'
      }, { status: 400 });
    }
    
    if (!baseId) {
      return NextResponse.json({
        success: false,
        message: 'baseId is required in request body'
      }, { status: 400 });
    }
    
    // Make request to Airtable API
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
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
        message: 'Failed to fetch tables from Airtable',
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
    console.error('Error fetching Airtable tables:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 