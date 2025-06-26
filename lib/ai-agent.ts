import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Define the schema for the AI agent's decision
const EmailProcessingDecisionSchema = z.object({
  shouldProcess: z.boolean().describe('Whether the email should be processed further (true/false)'),
  confidence: z.number().min(0).max(1).describe('Confidence level of the decision (0-1)'),
  reasoning: z.string().describe('Explanation for the decision'),
  category: z.enum([
    'business_inquiry',
    'customer_support',
    'sales_lead',
    'partnership',
    'spam',
    'newsletter',
    'automated',
    'personal',
    'other'
  ]).describe('Category of the email'),
  priority: z.enum(['high', 'medium', 'low']).describe('Priority level for processing'),
  extractedData: z.object({
    sender: z.string().describe('Sender information'),
    subject: z.string().describe('Email subject'),
    keyTopics: z.array(z.string()).describe('Key topics or keywords identified'),
    sentiment: z.enum(['positive', 'neutral', 'negative']).describe('Overall sentiment'),
    hasAttachments: z.boolean().describe('Whether email has attachments'),
    urgencyIndicators: z.array(z.string()).describe('Words or phrases indicating urgency')
  }).describe('Extracted structured data from the email')
});

export type EmailProcessingDecision = z.infer<typeof EmailProcessingDecisionSchema>;

export class EmailProcessingAgent {
  private model;

  constructor() {
    // Initialize the OpenAI model
    this.model = openai('gpt-4.1-mini-2025-04-14', {
      structuredOutputs: true,
    });
  }

  async analyzeEmail(emailData: any): Promise<EmailProcessingDecision> {
    try {
      console.log('\n🤖 AI AGENT ANALYZING EMAIL');
      console.log('============================');
      console.log('📧 Email Data:', JSON.stringify(emailData, null, 2));

      const { object } = await generateObject({
        model: this.model,
        schema: EmailProcessingDecisionSchema,
        prompt: `
You are an intelligent email processing agent for Datrix, a data management platform that handles ecommerce and retail sales data automation.
Your task is to analyze incoming email data and determine whether it contains structured business data relevant to sales operations, such as purchase orders (POs), invoices, order confirmations, payments, or transaction summaries.

PROCESS ONLY if the email:
Contains structured sales or financial data, including:
1. Invoices, purchase orders (POs), receipts, payments, confirmations.
2. Mentions specific keywords such as:
    "Invoice", "Purchase Order", "PO", "Order", "Payment", "Sales Report", "Receipt", "Credit Note"
3. Includes business documents:
    Attachments (PDFs, Excels, DOCs) with relevant names (e.g., invoice_123.pdf, po_march.xlsx)
4. Comes from relevant sources:
    Vendors, B2B clients, accounts/sales/logistics departments.
5. Uses transactional phrases:
    "Please find attached...", "Order summary...", "Payment enclosed...", "Invoice for your order..."

DO NOT PROCESS if the email:
1. Is related to customer support (complaints, inquiries, returns, tracking issues).
2. Is a general business inquiry or non-transactional conversation.
3. Involves marketing, newsletters, or promotions.
4. Comes from unknown/generic senders or domains (e.g., noreply@, info@).
5. Has no attachments or references to financial/business documents.

EMAIL DATA TO ANALYZE:
${JSON.stringify(emailData, null, 2)}

Your response must include:
1. A decision: Process or Discard
2. Confidence level (0.0 to 1.0)
3. Reasoning behind the decision
4. Category classification (e.g., Invoice, PO, Support Ticket, Marketing, etc.)
5. Priority level (High, Medium, Low)
6. Extracted structured data: key topics, attachment info, sentiment, urgency

Be precise and objective. Prioritize transactional value and data usability over conversational content. Ignore emails not relevant to data extraction or sales operations.
        `,
      });

      console.log('🎯 AI Decision:', object.shouldProcess);
      console.log('🎯 Confidence:', object.confidence);
      console.log('📂 Category:', object.category);
      console.log('⚡ Priority:', object.priority);
      console.log('💭 Reasoning:', object.reasoning);
      console.log('📊 Extracted Data:', JSON.stringify(object.extractedData, null, 2));
      console.log('============================\n');

      return object;
    } catch (error) {
      console.error('❌ AI AGENT ERROR:', error);
      
      // Fallback decision if AI fails
      return {
        shouldProcess: false,
        confidence: 0.1,
        reasoning: 'AI analysis failed, defaulting to no processing for safety',
        category: 'other',
        priority: 'low',
        extractedData: {
          sender: emailData.from || emailData.sender || 'unknown',
          subject: emailData.subject || 'No subject',
          keyTopics: [],
          sentiment: 'neutral',
          hasAttachments: Boolean(emailData.attachments?.length),
          urgencyIndicators: []
        }
      };
    }
  }

  async processEmailDecision(emailData: any): Promise<{
    decision: EmailProcessingDecision;
    nextActions: string[];
    shouldStore: boolean;
  }> {
    const decision = await this.analyzeEmail(emailData);
    
    // Determine next actions based on the decision
    const nextActions: string[] = [];
    
    if (decision.shouldProcess) {
      nextActions.push('Extract contact information');
      nextActions.push('Parse email content for data');
      
      if (decision.category === 'sales_lead') {
        nextActions.push('Add to CRM pipeline');
        nextActions.push('Notify sales team');
      }
      
      if (decision.category === 'customer_support') {
        nextActions.push('Create support ticket');
        nextActions.push('Route to appropriate team');
      }
      
      if (decision.priority === 'high') {
        nextActions.push('Send immediate notification');
      }
      
      if (decision.extractedData.hasAttachments) {
        nextActions.push('Process attachments for data extraction');
      }
    } else {
      nextActions.push('Archive email');
      
      if (decision.category === 'spam') {
        nextActions.push('Update spam filters');
      }
    }

    // Decide whether to store the email data
    const shouldStore = decision.shouldProcess || 
                       decision.confidence > 0.7 || 
                       decision.category === 'business_inquiry';

    console.log('🔄 Next Actions:', nextActions);
    console.log('💾 Should Store:', shouldStore);

    return {
      decision,
      nextActions,
      shouldStore
    };
  }
}

// Export a singleton instance
export const emailAgent = new EmailProcessingAgent();