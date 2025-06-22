import { NextRequest, NextResponse } from 'next/server';
import { emailAgent } from '@/lib/ai-agent';

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

    // Check if this is email data and process with AI agent
    let aiAnalysis = null;
    let processingResult = null;

    // Detect if the webhook contains email data
    const isEmailData = body.type === 'email' || 
                       body.event === 'email_received' ||
                       body.subject || 
                       body.from || 
                       body.sender ||
                       body.email_data ||
                       (body.data && (body.data.subject || body.data.from || body.data.sender));

    if (isEmailData) {
      console.log('\n📧 EMAIL DATA DETECTED - ACTIVATING AI AGENT');
      console.log('=============================================');
      
      try {
        // Extract email data from various possible structures
        const emailData = body.email_data || body.data || body;
        
        // Process with AI agent
        processingResult = await emailAgent.processEmailDecision(emailData);
        aiAnalysis = processingResult.decision;

        console.log('🤖 AI ANALYSIS COMPLETE');
        console.log('=======================');
        console.log('✅ Should Process:', aiAnalysis.shouldProcess);
        console.log('🎯 Confidence:', aiAnalysis.confidence);
        console.log('📂 Category:', aiAnalysis.category);
        console.log('⚡ Priority:', aiAnalysis.priority);
        console.log('💭 Reasoning:', aiAnalysis.reasoning);
        console.log('📊 Extracted Data:', JSON.stringify(aiAnalysis.extractedData, null, 2));
        console.log('🔄 Next Actions:', processingResult.nextActions);
        console.log('💾 Should Store:', processingResult.shouldStore);
        console.log('=======================\n');

        // Execute next actions based on AI decision
        if (aiAnalysis.shouldProcess) {
          console.log('🚀 EXECUTING PROCESSING ACTIONS');
          console.log('===============================');
          
          for (const action of processingResult.nextActions) {
            console.log(`📋 Action: ${action}`);
            // Here you would implement actual processing logic
            // For now, we're just logging the actions
          }
          
          console.log('===============================\n');
        } else {
          console.log('⏸️  EMAIL PROCESSING SKIPPED');
          console.log('============================');
          console.log('📝 Reason:', aiAnalysis.reasoning);
          console.log('============================\n');
        }

      } catch (aiError) {
        console.error('❌ AI AGENT ERROR:', aiError);
        aiAnalysis = {
          error: 'AI processing failed',
          message: aiError instanceof Error ? aiError.message : 'Unknown AI error'
        };
      }
    }

    // Return success response with AI analysis if available
    const response = {
      success: true,
      message: 'Webhook received successfully',
      timestamp: webhookData.timestamp,
      dataReceived: {
        bodySize: webhookData.bodySize,
        hasData: Object.keys(body).length > 0,
        isEmailData: isEmailData
      },
      ...(aiAnalysis && {
        aiAnalysis: {
          shouldProcess: aiAnalysis.shouldProcess,
          confidence: aiAnalysis.confidence,
          category: aiAnalysis.category,
          priority: aiAnalysis.priority,
          reasoning: aiAnalysis.reasoning,
          extractedData: aiAnalysis.extractedData
        }
      }),
      ...(processingResult && {
        processing: {
          nextActions: processingResult.nextActions,
          shouldStore: processingResult.shouldStore
        }
      })
    };

    return NextResponse.json(response, { status: 200 });

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
    message: 'Webhook endpoint is active with AI email processing',
    timestamp: new Date().toISOString(),
    methods: ['GET', 'POST'],
    features: {
      aiEmailProcessing: true,
      supportedEmailFormats: [
        'type: "email"',
        'event: "email_received"',
        'email_data: {...}',
        'data: { subject, from, sender, ... }'
      ]
    },
    usage: {
      POST: 'Send webhook data (email data will be processed by AI)',
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