import { NextRequest, NextResponse } from 'next/server';
import { emailAgent } from '@/lib/ai-agent';
import { supabase } from '@/lib/supabaseRoleClient';

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

    // Check if this is Google Apps Script email data
    let aiAnalysis = null;
    let processingResult = null;
    let documentProcessingResult = null;
    let integrationResult = null;
    let userId = null;

    // Detect if the webhook contains Google Apps Script email data
    const isGoogleAppsScriptData = body.source === 'google-apps-script' && 
                                  body.data && 
                                  body.data.action === 'fetch_emails' &&
                                  body.data.emailsProcessed > 0 &&
                                  body.data.data && 
                                  Array.isArray(body.data.data) && 
                                  body.data.data.length > 0;

    if (isGoogleAppsScriptData) {
      console.log('\n📧 GOOGLE APPS SCRIPT EMAIL DATA DETECTED');
      console.log('==========================================');
      console.log('📊 Emails Processed:', body.data.emailsProcessed);
      console.log('🔍 Search Query:', body.data.searchQuery);
      console.log('📧 Number of Emails:', body.data.data.length);
      console.log('==========================================\n');

      // Process each email in the array
      for (const emailData of body.data.data) {
        console.log(`\n📧 PROCESSING EMAIL: ${emailData.subject}`);
        console.log('=====================================');
        
        try {
          // Extract recipient email to get user ID from Supabase
          const recipientEmail = extractEmailFromRecipient(emailData.recipient);
          console.log('📧 Recipient Email:', recipientEmail);
          
          if (recipientEmail) {
            // Get user ID from Supabase using email
            userId = await getUserIdByEmail(recipientEmail);
            
            if (!userId) {
              console.log('⚠️  User not found in Supabase for email:', recipientEmail);
              console.log('🔄 Continuing with default user ID');
              userId = 'default-user';
            } else {
              console.log('✅ User ID found:', userId);
            }
          } else {
            console.log('⚠️  No recipient email found, using default user ID');
            userId = 'default-user';
          }

          // Format email data for AI processing
          const formattedEmailData = {
            from: emailData.sender,
            subject: emailData.subject,
            body: emailData.bodyPlainText || emailData.bodyHtml,
            timestamp: emailData.date,
            attachments: emailData.attachments || [],
            recipient: emailData.recipient,
            messageId: emailData.messageId,
            threadId: emailData.threadId,
            isRead: emailData.isRead,
            userId: userId
          };

          console.log('📧 Formatted Email Data:', {
            from: formattedEmailData.from,
            subject: formattedEmailData.subject,
            timestamp: formattedEmailData.timestamp,
            attachments: formattedEmailData.attachments.length,
            hasBody: Boolean(formattedEmailData.body),
            bodyLength: formattedEmailData.body ? formattedEmailData.body.length : 0,
            userId: formattedEmailData.userId
          });

          // Ensure we have email content to process
          if (!formattedEmailData.body || formattedEmailData.body.trim().length === 0) {
            console.log('⚠️  Skipping email - no content to process');
            continue;
          }

          // Process with AI agent that decides if the email should be processed further
          processingResult = await emailAgent.processEmailDecision(formattedEmailData);
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
            console.log('🚀 CHECKING FOR ATTACHMENTS');
            console.log('==========================================');
            
            // Check if there are attachments to process
            const hasAttachments = emailData.attachments && emailData.attachments.length > 0;
            console.log('📎 Has Attachments:', hasAttachments);
            console.log('📎 Attachment Count:', emailData.attachments ? emailData.attachments.length : 0);
            
            if (hasAttachments) {
              console.log('📎 Attachment Details:', emailData.attachments.map((att: any) => ({
                name: att.name,
                contentType: att.contentType,
                hasExtractedText: Boolean(att.extractedText),
                hasDriveUrl: Boolean(att.driveUrl),
                hasError: Boolean(att.error)
              })));
            }
            
            if (hasAttachments) {
              console.log('🚀 SENDING TO DOCUMENT PROCESSING ENDPOINT');
              console.log('==========================================');
              
              try {
                documentProcessingResult = await sendToDocumentProcessor(formattedEmailData, aiAnalysis);
                
                console.log('✅ DOCUMENT PROCESSING SUCCESS');
                console.log('==============================');
                console.log('📤 Sent to:', 'http://0.0.0.0:8080/test/process-document');
                console.log('📊 Response:', JSON.stringify(documentProcessingResult, null, 2));
                console.log('==============================\n');

                // Now send the document processing result to the automation agent
                if (documentProcessingResult.status === 200 && documentProcessingResult.data) {
                  console.log('🔗 SENDING TO AUTOMATION AGENT');
                  console.log('===============================');
                  
                  try {
                    integrationResult = await sendToAutomationAgent(documentProcessingResult.data, formattedEmailData, aiAnalysis, userId);
                    
                    console.log('✅ AUTOMATION AGENT SUCCESS');
                    console.log('===========================');
                    console.log('📊 Integration Result:', JSON.stringify(integrationResult, null, 2));
                    console.log('===========================\n');
                    
                  } catch (autoError) {
                    console.error('❌ AUTOMATION AGENT ERROR');
                    console.error('==========================');
                    console.error('Error:', autoError);
                    console.error('==========================\n');
                    
                    integrationResult = {
                      error: 'Automation agent failed',
                      message: autoError instanceof Error ? autoError.message : 'Unknown automation error'
                    };
                  }
                  
                } else {
                  console.log('⏸️  AUTOMATION SKIPPED - DOCUMENT PROCESSING FAILED');
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
              console.log('⏸️  SKIPPING DOCUMENT PROCESSING - NO ATTACHMENTS');
              console.log('==================================================');
              console.log('📝 Reason: No attachments to process');
              console.log('🔄 Sending email data directly to automation agent');
              console.log('==================================================\n');
              
              try {
                // Send email data directly to automation agent without document processing
                integrationResult = await sendToAutomationAgent(formattedEmailData, formattedEmailData, aiAnalysis, userId);
                
                console.log('✅ AUTOMATION AGENT SUCCESS (NO DOCUMENT PROCESSING)');
                console.log('===================================================');
                console.log('📊 Integration Result:', JSON.stringify(integrationResult, null, 2));
                console.log('===================================================\n');
                
              } catch (autoError) {
                console.error('❌ AUTOMATION AGENT ERROR');
                console.error('==========================');
                console.error('Error:', autoError);
                console.error('==========================\n');
                
                integrationResult = {
                  error: 'Automation agent failed',
                  message: autoError instanceof Error ? autoError.message : 'Unknown automation error'
                };
              }
            }
          } else {
            console.log('⏸️  EMAIL PROCESSING SKIPPED - NOT SENT TO DOCUMENT PROCESSOR');
            console.log('============================================================');
            console.log('📝 Reason:', aiAnalysis.reasoning);
            console.log('============================================================\n');
          }

        } catch (emailError) {
          console.error(`❌ ERROR PROCESSING EMAIL: ${emailData.subject}`);
          console.error('==========================================');
          console.error('Error:', emailError);
          console.error('==========================================\n');
        }
      }
    } else {
      console.log('⏸️  NO GOOGLE APPS SCRIPT EMAIL DATA DETECTED');
      console.log('==============================================');
      console.log('📝 Reason: Body does not match expected Google Apps Script format');
      console.log('==============================================\n');
    }

    // Return success response with all processing results
    const response = {
      success: true,
      message: 'Webhook received successfully',
      timestamp: webhookData.timestamp,
      dataReceived: {
        bodySize: webhookData.bodySize,
        hasData: Object.keys(body).length > 0,
        isGoogleAppsScriptData: isGoogleAppsScriptData,
        emailsProcessed: isGoogleAppsScriptData ? body.data.emailsProcessed : 0
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

    // Log the automation run to database
    if (isGoogleAppsScriptData) {
      if (integrationResult) {
        // Log successful or failed automation run
        await logAutomationRun({
          dataType: aiAnalysis?.category || 'Email Data',
          source: 'Email',
          destination: integrationResult.selectedIntegration || 'Unknown',
          status: integrationResult.error ? 'Failed' : 'Processed',
          userId: userId,
          details: {
            emailSubject: aiAnalysis?.subject || 'Unknown',
            aiCategory: aiAnalysis?.category,
            aiPriority: aiAnalysis?.priority,
            integrationResult: integrationResult,
            emailsProcessed: body.data.emailsProcessed
          }
        });
      } else if (aiAnalysis) {
        // Log AI decision (processed or skipped)
        await logAutomationRun({
          dataType: aiAnalysis.category || 'Email Data',
          source: 'Email',
          destination: aiAnalysis.shouldProcess ? 'Airtable' : 'Skipped',
          status: aiAnalysis.shouldProcess ? 'Processed' : 'Skip',
          userId: userId,
          details: {
            emailSubject: aiAnalysis.subject || 'Unknown',
            aiCategory: aiAnalysis.category,
            aiPriority: aiAnalysis.priority,
            aiReasoning: aiAnalysis.reasoning,
            shouldProcess: aiAnalysis.shouldProcess,
            emailsProcessed: body.data.emailsProcessed,
            processingType: aiAnalysis.shouldProcess ? 'processed_by_ai' : 'skipped_by_ai'
          }
        });
      }
    }

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

// Helper function to extract email from recipient string
function extractEmailFromRecipient(recipient: string): string | null {
  if (!recipient) return null;
  
  // Extract email from formats like "datrix <datrix.saledata@gmail.com>"
  const emailMatch = recipient.match(/<(.+?)>/);
  if (emailMatch) {
    return emailMatch[1];
  }
  
  // If no angle brackets, check if it's a valid email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(recipient)) {
    return recipient;
  }
  
  return null;
}

// Function to send email data to document processing endpoint
async function sendToDocumentProcessor(emailData: any, aiAnalysis: any) {
  const DOCUMENT_PROCESSOR_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/test/process-document`;
  
  // Prepare the email content as text
  const emailText = formatEmailAsText(emailData, aiAnalysis);
  
  // Create FormData for multipart/form-data request
  const formData = new FormData();
  
  // Add the email content as text
  formData.append('text', emailText);
  
  // Handle attachments if they exist (optional)
  if (emailData.attachments && emailData.attachments.length > 0) {
    console.log('📎 Processing attachments:', emailData.attachments.length);
    
    for (const attachment of emailData.attachments) {
      try {
        console.log(`📎 Processing attachment: ${attachment.name} (${attachment.contentType})`);
        
        // Check if we have extracted text from Google Drive
        if (attachment.extractedText && attachment.extractedText !== "PDF content extraction requires Google Cloud Document AI.") {
          console.log(`📄 Using extracted text for: ${attachment.name}`);
          const textBlob = new Blob([attachment.extractedText], { type: 'text/plain' });
          formData.append('file', textBlob, `${attachment.name}.txt`);
        } else if (attachment.driveUrl) {
          console.log(`📄 Fetching from Google Drive: ${attachment.name}`);
          // Try to fetch from Google Drive URL
          try {
            const response = await fetch(attachment.driveUrl);
            if (response.ok) {
              const blob = await response.blob();
              formData.append('file', blob, attachment.name);
            } else {
              console.warn(`Failed to fetch from Google Drive: ${attachment.name}`);
              // Create placeholder with attachment info
              const attachmentInfo = `Attachment: ${attachment.name}\nType: ${attachment.contentType}\nDrive URL: ${attachment.driveUrl}\nNote: Could not fetch file from Google Drive`;
              const blob = new Blob([attachmentInfo], { type: 'text/plain' });
              formData.append('file', blob, `${attachment.name}.txt`);
            }
          } catch (driveError) {
            console.warn(`Error fetching from Google Drive: ${attachment.name}`, driveError);
            // Create placeholder with attachment info
            const attachmentInfo = `Attachment: ${attachment.name}\nType: ${attachment.contentType}\nDrive URL: ${attachment.driveUrl}\nError: ${driveError instanceof Error ? driveError.message : 'Unknown error'}`;
            const blob = new Blob([attachmentInfo], { type: 'text/plain' });
            formData.append('file', blob, `${attachment.name}.txt`);
          }
        } else {
          console.log(`📄 Creating placeholder for: ${attachment.name}`);
          // Create a placeholder file with attachment metadata
          const attachmentInfo = `Attachment: ${attachment.name}\nType: ${attachment.contentType}\nDrive File ID: ${attachment.driveFileId || 'N/A'}\nNote: No extracted text or drive URL available`;
          const blob = new Blob([attachmentInfo], { type: 'text/plain' });
          formData.append('file', blob, `${attachment.name}.txt`);
        }
      } catch (error) {
        console.warn(`Failed to process attachment ${attachment.name}:`, error);
        // Create a placeholder file
        const attachmentInfo = `Failed to load attachment: ${attachment.name}\nError: ${error instanceof Error ? error.message : 'Unknown error'}`;
        const blob = new Blob([attachmentInfo], { type: 'text/plain' });
        formData.append('file', blob, `${attachment.name}.txt`);
      }
    }
  }
  
  // Always create a text file with email content since the endpoint expects a file
  // This ensures processing works even without attachments
  const emailBlob = new Blob([emailText], { type: 'text/plain' });
  formData.append('file', emailBlob, `email_${Date.now()}.txt`);
  
  console.log('📤 Sending to document processor...');
  console.log('📧 Email text length:', emailText.length, 'characters');
  console.log('📎 Attachments:', emailData.attachments ? emailData.attachments.length : 0);
  console.log('📄 Email file created for processing');
  
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

// Function to send processed document data to automation agent
async function sendToAutomationAgent(documentData: any, emailData: any, aiAnalysis: any, userId: string) {
  const AUTOMATION_URL = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/automation`;
  
  // Prepare the message for the automation agent
  const message = {
    role: 'user',
    content: `I have processed email data and extracted the following information. Please automatically add this data to the appropriate integration:

Email Subject: ${emailData.subject || 'No Subject'}
Email From: ${emailData.from || emailData.sender || 'Unknown'}
AI Category: ${aiAnalysis.category}
AI Priority: ${aiAnalysis.priority}

Extracted Data from Document Processing:
${JSON.stringify(documentData, null, 2)}

Please process this data and add it to the most appropriate integration automatically.`
  };

  console.log('🤖 Sending to automation agent...');
  console.log('📧 Message:', message.content);
  
  // Send the request to the automation agent
  const response = await fetch(AUTOMATION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [message],
      userId: userId
    })
  });
  
  if (!response.ok) {
    throw new Error(`Automation agent responded with status: ${response.status} ${response.statusText}`);
  }
  
  // Handle streaming response
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body reader available');
  }

  let fullResponse = '';
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      fullResponse += chunk;
    }
  } finally {
    reader.releaseLock();
  }

  // Parse the streaming response
  let result;
  try {
    // The response might be multiple JSON objects separated by newlines
    const lines = fullResponse.trim().split('\n');
    const lastLine = lines[lines.length - 1];
    result = JSON.parse(lastLine);
  } catch (parseError) {
    console.warn('Failed to parse automation response as JSON, using raw response');
    result = { text: fullResponse };
  }

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

export const getUserIdByEmail = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.error('Error fetching users:', error.message)
      return null
    }

    const user = data?.users?.find((user: any) => user.email === email)
    return user?.id || null
  } catch (error) {
    console.error('Error in getUserIdByEmail:', error)
    return null
  }
}

// Helper function to log automation run to database
async function logAutomationRun(data: {
  dataType: string;
  source: string;
  destination: string;
  status: 'Success' | 'Failed' | 'Processed' | 'Skip';
  userId?: string;
  details?: any;
}) {
  try {
    const { data: runData, error } = await supabase
      .from('runs')
      .insert({
        user_id: data.userId || null,
        run_time: new Date().toISOString(),
        data_type: data.dataType,
        source: data.source,
        destination: data.destination,
        status: data.status
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to log automation run to database:', error);
      return null;
    }

    console.log('✅ Automation run logged to database:', {
      id: runData.id,
      dataType: data.dataType,
      source: data.source,
      destination: data.destination,
      status: data.status,
      userId: data.userId
    });

    return runData;
  } catch (error) {
    console.error('❌ Error logging automation run to database:', error);
    return null;
  }
}