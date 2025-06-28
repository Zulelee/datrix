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
    let documentProcessingResult = null;
    let integrationResult = null;

    // Detect if the webhook contains email data
    const isEmailData = true;

    if (isEmailData) {
      console.log('\n📧 EMAIL DATA DETECTED - ACTIVATING AI AGENT');
      console.log('=============================================');
      
      try {
        // Extract email data from various possible structures
        const emailData = body.email_data || body.data || body;
        
        // Process with AI agent that decides if the email should be processed further
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

        // Send to document processing endpoint if AI decides to process
        if (aiAnalysis.shouldProcess) {
          console.log('🚀 SENDING TO DOCUMENT PROCESSING ENDPOINT');
          console.log('==========================================');
          
          try {
            documentProcessingResult = await sendToDocumentProcessor(emailData, aiAnalysis);
            
            console.log('✅ DOCUMENT PROCESSING SUCCESS');
            console.log('==============================');
            console.log('📤 Sent to:', 'http://0.0.0.0:8080/test/process-document');
            console.log('📊 Response:', JSON.stringify(documentProcessingResult, null, 2));
            console.log('==============================\n');

            // Now send the document processing result to the integration agent
            if (documentProcessingResult.status === 200 && documentProcessingResult.data) {
              console.log('🔗 SENDING TO INTEGRATION AGENT');
              console.log('===============================');
              
              // TODO: Send the document processing result to an agent that is similar to datrixai 
              // and sends the data to the appropriate integration
              
            } else {
              console.log('⏸️  INTEGRATION SKIPPED - DOCUMENT PROCESSING FAILED');
              console.log('===================================================');
              console.log('📝 Reason: Document processor did not return valid data');
              console.log('===================================================\n');
            }
            
          } catch (docError) {
            console.error('❌ DOCUMENT PROCESSING ERROR');
            console.error('============================');
            console.error('Error:', docError);
            console.error('============================\n');
            
            documentProcessingResult = {
              error: 'Document processing failed',
              message: docError instanceof Error ? docError.message : 'Unknown document processing error'
            };
          }
        } else {
          console.log('⏸️  EMAIL PROCESSING SKIPPED - NOT SENT TO DOCUMENT PROCESSOR');
          console.log('============================================================');
          console.log('📝 Reason:', aiAnalysis.reasoning);
          console.log('============================================================\n');
        }

      } catch (aiError) {
        console.error('❌ AI AGENT ERROR:', aiError);
        aiAnalysis = {
          error: 'AI processing failed',
          message: aiError instanceof Error ? aiError.message : 'Unknown AI error'
        };
      }
    }

    // Return success response with all processing results
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
      }),
      ...(documentProcessingResult && {
        documentProcessing: documentProcessingResult
      }),
      ...(integrationResult && {
        integration: {
          selectedIntegration: integrationResult.selectedIntegration,
          tableName: integrationResult.tableName,
          status: integrationResult.status,
          explanation: integrationResult.explanation,
          confidence: integrationResult.confidence,
          reasoning: integrationResult.reasoning
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

// Function to send email data to document processing endpoint
async function sendToDocumentProcessor(emailData: any, aiAnalysis: any) {
  const DOCUMENT_PROCESSOR_URL = 'http://0.0.0.0:8080/test/process-document';
  
  // Prepare the email content as text
  const emailText = formatEmailAsText(emailData, aiAnalysis);
  
  // Create FormData for multipart/form-data request
  const formData = new FormData();
  
  // Add the email content as text
  formData.append('text', emailText);
  
  // If there are attachments mentioned, we'll note them in the text
  // In a real implementation, you'd need to fetch and attach actual files
  if (emailData.attachments && emailData.attachments.length > 0) {
    // For now, we'll create a simple text file with attachment info
    const attachmentInfo = `Attachments mentioned: ${emailData.attachments.join(', ')}`;
    const blob = new Blob([attachmentInfo], { type: 'text/plain' });
    formData.append('file', blob, 'email_attachments_info.txt');
  } else {
    // Create a minimal text file since the endpoint expects a file
    const emailBlob = new Blob([emailText], { type: 'text/plain' });
    formData.append('file', emailBlob, `email_${Date.now()}.txt`);
  }
  
  console.log('📤 Sending to document processor...');
  console.log('📧 Email text length:', emailText.length, 'characters');
  console.log('📎 Attachments:', emailData.attachments || 'None');
  
  // Send the request
  const response = await fetch(DOCUMENT_PROCESSOR_URL, {
    method: 'POST',
    body: formData,
    headers: {
      'accept': 'application/json',
      // Don't set Content-Type header - let the browser set it with boundary for multipart/form-data
    }
  });
  
  if (!response.ok) {
    throw new Error(`Document processor responded with status: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json();
  return {
    status: response.status,
    statusText: response.statusText,
    data: result,
    sentAt: new Date().toISOString()
  };
}

// Helper function to format email data as structured text
function formatEmailAsText(emailData: any, aiAnalysis: any): string {
  const lines = [];
  
  lines.push('=== EMAIL DATA FOR PROCESSING ===');
  lines.push('');
  
  // Basic email info
  lines.push(`From: ${emailData.from || emailData.sender || 'Unknown'}`);
  lines.push(`Subject: ${emailData.subject || 'No Subject'}`);
  lines.push(`Timestamp: ${emailData.timestamp || new Date().toISOString()}`);
  lines.push(`Priority: ${emailData.priority || 'normal'}`);
  lines.push('');
  
  // AI Analysis results
  lines.push('=== AI ANALYSIS ===');
  lines.push(`Category: ${aiAnalysis.category}`);
  lines.push(`Priority: ${aiAnalysis.priority}`);
  lines.push(`Confidence: ${Math.round(aiAnalysis.confidence * 100)}%`);
  lines.push(`Sentiment: ${aiAnalysis.extractedData.sentiment}`);
  lines.push(`Key Topics: ${aiAnalysis.extractedData.keyTopics.join(', ')}`);
  lines.push(`Urgency Indicators: ${aiAnalysis.extractedData.urgencyIndicators.join(', ')}`);
  lines.push('');
  
  // Email body
  lines.push('=== EMAIL CONTENT ===');
  lines.push(emailData.body || emailData.content || 'No content available');
  lines.push('');
  
  // Attachments info
  if (emailData.attachments && emailData.attachments.length > 0) {
    lines.push('=== ATTACHMENTS ===');
    emailData.attachments.forEach((attachment: string, index: number) => {
      lines.push(`${index + 1}. ${attachment}`);
    });
    lines.push('');
  }
  
  // Processing metadata
  lines.push('=== PROCESSING METADATA ===');
  lines.push(`Processed At: ${new Date().toISOString()}`);
  lines.push(`AI Reasoning: ${aiAnalysis.reasoning}`);
  lines.push('');
  
  return lines.join('\n');
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
    message: 'Webhook endpoint is active with full AI processing pipeline',
    timestamp: new Date().toISOString(),
    methods: ['GET', 'POST'],
    features: {
      aiEmailProcessing: true,
      documentProcessorIntegration: true,
      integrationAgentProcessing: true,
      documentProcessorEndpoint: 'http://0.0.0.0:8080/test/process-document',
      supportedEmailFormats: [
        'type: "email"',
        'event: "email_received"',
        'email_data: {...}',
        'data: { subject, from, sender, ... }'
      ]
    },
    pipeline: [
      '1. Email received via webhook',
      '2. AI agent analyzes email content',
      '3. If approved, sent to document processor',
      '4. Document data sent to integration agent',
      '5. Integration agent routes to appropriate CRM/database',
      '6. Complete status returned'
    ],
    usage: {
      POST: 'Send webhook data (full AI processing pipeline)',
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