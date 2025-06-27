import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    const { token, baseId, tableIdOrName, records } = body;
    
    // Validate required fields
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
    
    if (!tableIdOrName) {
      return NextResponse.json({
        success: false,
        message: 'tableIdOrName is required in request body'
      }, { status: 400 });
    }
    
    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'records array is required in request body'
      }, { status: 400 });
    }
    
    // Prepare the request payload
    const payload = {
      records: records.map((record: any) => ({
        fields: record.fields || {}
      }))
    };
    
    // Make request to Airtable API
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableIdOrName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({
        success: false,
        message: 'Failed to create records in Airtable',
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
    console.error('Error creating Airtable records:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Also support GET method to retrieve records
export async function GET(request: NextRequest) {
  try {
    // Get token, baseId and tableIdOrName from query parameters
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const baseId = searchParams.get('baseId');
    const tableIdOrName = searchParams.get('tableIdOrName');
    
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
    
    if (!tableIdOrName) {
      return NextResponse.json({
        success: false,
        message: 'tableIdOrName query parameter is required'
      }, { status: 400 });
    }
    
    // Build URL with optional query parameters
    const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableIdOrName}`);
    
    // Add any additional query parameters that might be useful
    const pageSize = searchParams.get('pageSize');
    const offset = searchParams.get('offset');
    const filterByFormula = searchParams.get('filterByFormula');
    const sort = searchParams.get('sort');
    const view = searchParams.get('view');
    
    if (pageSize) url.searchParams.set('pageSize', pageSize);
    if (offset) url.searchParams.set('offset', offset);
    if (filterByFormula) url.searchParams.set('filterByFormula', filterByFormula);
    if (sort) url.searchParams.set('sort', sort);
    if (view) url.searchParams.set('view', view);
    
    // Make request to Airtable API
    const response = await fetch(url.toString(), {
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
        message: 'Failed to fetch records from Airtable',
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
    console.error('Error fetching Airtable records:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 