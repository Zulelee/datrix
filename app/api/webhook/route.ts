import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    
    // Get headers for additional context
    const headers = Object.fromEntries(request.headers.entries());
    
    // Create a comprehensive log object
    const webhookData = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      headers: {
        'content-type': headers['content-type'],
        'user-agent': headers['user-agent'],
        'x-forwarded-for': headers['x-forwarded-for'],
        'authorization': headers['authorization'] ? '[REDACTED]' : undefined,
        // Include any custom headers that might be relevant
        ...Object.fromEntries(
          Object.entries(headers).filter(([key]) => 
            key.startsWith('x-') && !key.includes('forwarded')
          )
        )
      },
      body: body,
      bodySize: JSON.stringify(body).length,
      ip: headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown'
    };

    // Log to console with clear formatting
    console.log('\n🔔 WEBHOOK RECEIVED');
    console.log('==================');
    console.log('📅 Timestamp:', webhookData.timestamp);
    console.log('🌐 Method:', webhookData.method);
    console.log('🔗 URL:', webhookData.url);
    console.log('📍 IP:', webhookData.ip);
    console.log('📦 Body Size:', webhookData.bodySize, 'bytes');
    console.log('📋 Headers:', JSON.stringify(webhookData.headers, null, 2));
    console.log('📄 Body:', JSON.stringify(webhookData.body, null, 2));
    console.log('==================\n');

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Webhook received successfully',
      timestamp: webhookData.timestamp,
      dataReceived: {
        bodySize: webhookData.bodySize,
        hasData: Object.keys(body).length > 0
      }
    }, { status: 200 });

  } catch (error) {
    console.error('❌ WEBHOOK ERROR');
    console.error('================');
    console.error('Error:', error);
    console.error('================\n');

    return NextResponse.json({
      success: false,
      message: 'Error processing webhook',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Handle GET requests for webhook verification or testing
  const url = new URL(request.url);
  const challenge = url.searchParams.get('challenge');
  
  console.log('\n🔍 WEBHOOK VERIFICATION');
  console.log('======================');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🔗 URL:', request.url);
  console.log('🎯 Challenge:', challenge);
  console.log('======================\n');

  if (challenge) {
    // Return challenge for webhook verification (common pattern)
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({
    message: 'Webhook endpoint is active',
    timestamp: new Date().toISOString(),
    methods: ['GET', 'POST'],
    usage: {
      POST: 'Send webhook data',
      GET: 'Verify webhook or get status'
    }
  });
}

// Also handle other HTTP methods if needed
export async function PUT(request: NextRequest) {
  return POST(request);
}

export async function PATCH(request: NextRequest) {
  return POST(request);
}