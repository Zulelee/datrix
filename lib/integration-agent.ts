import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { tool } from 'ai';
import { supabase } from './supabaseClient';
import { getUserDataSources } from './saveDataSource';

// Schema for the final integration decision
const IntegrationDecisionSchema = z.object({
  selectedIntegration: z.string().describe('The ID of the chosen integration (e.g., "airtable", "postgres")'),
  tableName: z.string().describe('The target table/collection name for data insertion'),
  mappedData: z.record(z.any()).describe('Data mapped to the target schema'),
  confidence: z.number().min(0).max(1).describe('Confidence in the integration choice'),
  reasoning: z.string().describe('Explanation for the integration and mapping choices'),
  status: z.enum(['success', 'error']).describe('Status of the data preparation'),
  explanation: z.string().max(50).describe('5-7 words explanation of the result')
});

export type IntegrationDecision = z.infer<typeof IntegrationDecisionSchema>;

export class IntegrationAgent {
  private model;

  constructor() {
    this.model = openai('gpt-4o-mini', {
      structuredOutputs: true,
    });
  }

  // Tool 1: Get user's integrations
  private getUserIntegrations = tool({
    description: 'Get the list of integrations configured for a user',
    parameters: z.object({
      userId: z.string().describe('The user ID to get integrations for')
    }),
    execute: async ({ userId }) => {
      console.log(`🔌 Getting integrations for user: ${userId}`);
      
      try {
        const { data, error } = await getUserDataSources(userId);
        
        if (error) {
          console.error('❌ Error fetching integrations:', error);
          return { success: false, integrations: [], error: error.message };
        }

        const integrations = data?.map(source => ({
          id: source.source_type,
          type: source.source_type,
          name: source.source_type.charAt(0).toUpperCase() + source.source_type.slice(1),
          connected: true,
          hasCredentials: Boolean(source.credentials),
          lastUpdated: source.updated_at
        })) || [];

        console.log(`✅ Found ${integrations.length} integrations:`, integrations.map(i => i.name).join(', '));
        
        return { 
          success: true, 
          integrations,
          count: integrations.length 
        };
      } catch (error) {
        console.error('❌ Exception getting integrations:', error);
        return { 
          success: false, 
          integrations: [], 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    }
  });

  // Tool 2: Get schema for a specific integration
  private getIntegrationSchema = tool({
    description: 'Get the schema/structure for a specific integration to understand what data it can accept',
    parameters: z.object({
      integrationType: z.string().describe('The type of integration (e.g., "airtable", "postgres")')
    }),
    execute: async ({ integrationType }) => {
      console.log(`📋 Getting schema for integration: ${integrationType}`);
      
      // Mock schemas for different integration types
      const schemas = {
        airtable: {
          tables: {
            'Contacts': {
              fields: {
                'Name': { type: 'text', required: true },
                'Email': { type: 'email', required: true },
                'Company': { type: 'text', required: false },
                'Phone': { type: 'phone', required: false },
                'Status': { type: 'select', options: ['Active', 'Inactive', 'Pending'], required: false },
                'Notes': { type: 'longText', required: false },
                'Created': { type: 'datetime', required: false }
              }
            },
            'Deals': {
              fields: {
                'Deal Name': { type: 'text', required: true },
                'Contact': { type: 'link', linkedTable: 'Contacts', required: false },
                'Amount': { type: 'currency', required: false },
                'Stage': { type: 'select', options: ['Lead', 'Qualified', 'Proposal', 'Closed Won', 'Closed Lost'], required: false },
                'Close Date': { type: 'date', required: false },
                'Description': { type: 'longText', required: false }
              }
            },
            'Tasks': {
              fields: {
                'Task': { type: 'text', required: true },
                'Assignee': { type: 'text', required: false },
                'Due Date': { type: 'date', required: false },
                'Priority': { type: 'select', options: ['High', 'Medium', 'Low'], required: false },
                'Status': { type: 'select', options: ['To Do', 'In Progress', 'Done'], required: false },
                'Notes': { type: 'longText', required: false }
              }
            }
          }
        },
        postgres: {
          tables: {
            'contacts': {
              columns: {
                'id': { type: 'serial', primaryKey: true },
                'name': { type: 'varchar(255)', required: true },
                'email': { type: 'varchar(255)', required: true, unique: true },
                'company': { type: 'varchar(255)', required: false },
                'phone': { type: 'varchar(50)', required: false },
                'status': { type: 'varchar(50)', required: false },
                'notes': { type: 'text', required: false },
                'created_at': { type: 'timestamp', default: 'now()' },
                'updated_at': { type: 'timestamp', default: 'now()' }
              }
            },
            'deals': {
              columns: {
                'id': { type: 'serial', primaryKey: true },
                'deal_name': { type: 'varchar(255)', required: true },
                'contact_id': { type: 'integer', foreignKey: 'contacts.id', required: false },
                'amount': { type: 'decimal(10,2)', required: false },
                'stage': { type: 'varchar(100)', required: false },
                'close_date': { type: 'date', required: false },
                'description': { type: 'text', required: false },
                'created_at': { type: 'timestamp', default: 'now()' },
                'updated_at': { type: 'timestamp', default: 'now()' }
              }
            },
            'tasks': {
              columns: {
                'id': { type: 'serial', primaryKey: true },
                'task': { type: 'varchar(500)', required: true },
                'assignee': { type: 'varchar(255)', required: false },
                'due_date': { type: 'date', required: false },
                'priority': { type: 'varchar(50)', required: false },
                'status': { type: 'varchar(50)', required: false },
                'notes': { type: 'text', required: false },
                'created_at': { type: 'timestamp', default: 'now()' },
                'updated_at': { type: 'timestamp', default: 'now()' }
              }
            }
          }
        }
      };

      const schema = schemas[integrationType as keyof typeof schemas];
      
      if (!schema) {
        console.log(`❌ No schema found for integration: ${integrationType}`);
        return { 
          success: false, 
          schema: null, 
          error: `Schema not available for ${integrationType}` 
        };
      }

      console.log(`✅ Schema retrieved for ${integrationType}:`, Object.keys(schema.tables || schema).join(', '));
      
      return { 
        success: true, 
        schema,
        integrationType,
        availableTables: Object.keys(schema.tables || schema)
      };
    }
  });

  // Tool 3: Send data to integration
  private sendToIntegration = tool({
    description: 'Send prepared data to the selected integration',
    parameters: z.object({
      integrationType: z.string().describe('The integration type'),
      tableName: z.string().describe('The target table name'),
      data: z.record(z.any()).describe('The mapped data to insert'),
      userId: z.string().describe('The user ID for authentication')
    }),
    execute: async ({ integrationType, tableName, data, userId }) => {
      console.log(`📤 Sending data to ${integrationType}.${tableName} for user ${userId}`);
      console.log('📊 Data to insert:', JSON.stringify(data, null, 2));
      
      try {
        // In a real implementation, you would:
        // 1. Get the user's credentials for this integration
        // 2. Use the appropriate API/SDK to insert data
        // 3. Handle authentication and error cases
        
        // For now, we'll simulate the insertion
        const simulatedResult = await this.simulateDataInsertion(integrationType, tableName, data);
        
        console.log(`✅ Data insertion ${simulatedResult.success ? 'successful' : 'failed'}`);
        
        return {
          success: simulatedResult.success,
          insertedId: simulatedResult.insertedId,
          message: simulatedResult.message,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        console.error('❌ Error sending to integration:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        };
      }
    }
  });

  // Simulate data insertion (replace with real API calls)
  private async simulateDataInsertion(integrationType: string, tableName: string, data: any) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Simulate success/failure based on data completeness
    const hasRequiredFields = this.validateRequiredFields(integrationType, tableName, data);
    const success = hasRequiredFields && Math.random() > 0.1; // 90% success rate for valid data
    
    return {
      success,
      insertedId: success ? `${integrationType}_${Date.now()}` : null,
      message: success 
        ? `Successfully inserted into ${integrationType}.${tableName}` 
        : `Failed to insert into ${integrationType}.${tableName}: ${hasRequiredFields ? 'API error' : 'Missing required fields'}`
    };
  }

  // Validate required fields based on schema
  private validateRequiredFields(integrationType: string, tableName: string, data: any): boolean {
    // Simple validation - in real implementation, use actual schema validation
    const requiredFields = {
      airtable: {
        'Contacts': ['Name', 'Email'],
        'Deals': ['Deal Name'],
        'Tasks': ['Task']
      },
      postgres: {
        'contacts': ['name', 'email'],
        'deals': ['deal_name'],
        'tasks': ['task']
      }
    };

    const required = requiredFields[integrationType as keyof typeof requiredFields]?.[tableName] || [];
    return required.every(field => data[field] && data[field].toString().trim().length > 0);
  }

  // Main processing function
  async processDocumentData(documentData: any, userId: string): Promise<IntegrationDecision> {
    console.log('\n🤖 INTEGRATION AGENT PROCESSING');
    console.log('===============================');
    console.log('👤 User ID:', userId);
    console.log('📄 Document Data:', JSON.stringify(documentData, null, 2));

    try {
      const { object } = await generateObject({
        model: this.model,
        schema: IntegrationDecisionSchema,
        tools: {
          getUserIntegrations: this.getUserIntegrations,
          getIntegrationSchema: this.getIntegrationSchema,
          sendToIntegration: this.sendToIntegration
        },
        prompt: `
You are an intelligent integration agent for Datrix. Your job is to:

1. Get the user's available integrations
2. Analyze the document data to understand what type of information it contains
3. Get schemas for relevant integrations to understand their structure
4. Choose the best integration and table for this data
5. Map the document data to the target schema
6. Send the data to the integration
7. Return the status and a brief explanation

USER ID: ${userId}

DOCUMENT DATA TO PROCESS:
${JSON.stringify(documentData, null, 2)}

PROCESSING STEPS:
1. First, call getUserIntegrations to see what integrations are available
2. Analyze the document data to determine what type of business data it contains (contacts, deals, tasks, etc.)
3. For each relevant integration, call getIntegrationSchema to understand the data structure
4. Choose the best integration and table based on:
   - Data type match (contact info → contacts table)
   - Schema compatibility
   - Data completeness
5. Map the document data to match the target schema exactly
6. Call sendToIntegration to insert the data
7. Provide a clear status and brief explanation

IMPORTANT MAPPING RULES:
- Extract contact information (names, emails, companies) for contacts tables
- Extract deal/opportunity information for deals tables  
- Extract task/action items for tasks tables
- Map field names exactly to match the target schema
- Handle missing data gracefully
- Ensure required fields are populated

Be thorough in your analysis and provide clear reasoning for your choices.
        `,
      });

      console.log('🎯 Integration Decision Complete');
      console.log('===============================');
      console.log('🔌 Selected Integration:', object.selectedIntegration);
      console.log('📋 Target Table:', object.tableName);
      console.log('🎯 Confidence:', object.confidence);
      console.log('📊 Mapped Data:', JSON.stringify(object.mappedData, null, 2));
      console.log('💭 Reasoning:', object.reasoning);
      console.log('✅ Status:', object.status);
      console.log('📝 Explanation:', object.explanation);
      console.log('===============================\n');

      return object;
    } catch (error) {
      console.error('❌ INTEGRATION AGENT ERROR:', error);
      
      // Fallback response
      return {
        selectedIntegration: 'none',
        tableName: 'none',
        mappedData: {},
        confidence: 0.0,
        reasoning: 'Integration agent failed to process the data',
        status: 'error',
        explanation: 'Processing failed due to error'
      };
    }
  }
}

// Export singleton instance
export const integrationAgent = new IntegrationAgent();