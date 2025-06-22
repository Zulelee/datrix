import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Define the schema for the AI agent's decision
const EmailProcessingDecisionSchema = z.object({
  shouldProcess: z.boolean().describe('Whether the email should be processed further'),
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
    this.model = openai('gpt-4o-mini', {
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
You are an intelligent email processing agent for Datrix, a data management platform. 
Your job is to analyze incoming email data and decide whether it should be processed further.

PROCESSING CRITERIA:
- Business inquiries, sales leads, customer support requests should be processed
- Spam, newsletters, automated notifications should generally NOT be processed
- Consider sender reputation, content quality, and business relevance
- Look for actionable content that could benefit from data extraction

EMAIL DATA TO ANALYZE:
${JSON.stringify(emailData, null, 2)}

Analyze this email data and provide:
1. A clear decision on whether to process it
2. Your confidence level (0-1)
3. Detailed reasoning for your decision
4. Appropriate category classification
5. Priority level for processing
6. Extracted structured data including key topics, sentiment, and urgency indicators

IMPORTANT: Make sure to provide ALL required fields in extractedData:
- sender: The email sender (required)
- subject: The email subject (required)
- keyTopics: Array of key topics found
- sentiment: positive, neutral, or negative
- hasAttachments: true/false
- urgencyIndicators: Array of urgent phrases found

Be thorough but concise in your analysis. Focus on business value and data quality.
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