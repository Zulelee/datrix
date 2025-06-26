import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { tool } from 'ai';
import { getUserDataSources } from './saveDataSource';

// Schema for data analysis and integration recommendation
const DataAnalysisSchema = z.object({
  dataType: z.enum([
    'contacts',
    'deals',
    'tasks',
    'invoices',
    'orders',
    'customers',
    'products',
    'events',
    'mixed',
    'unknown'
  ]).describe('Type of data identified in the input'),
  extractedData: z.array(z.record(z.any())).describe('Structured data extracted from the input'),
  recommendedIntegration: z.string().describe('Recommended integration ID (e.g., "airtable", "postgres")'),
  recommendedTable: z.string().describe('Recommended table/collection name'),
  confidence: z.number().min(0).max(1).describe('Confidence in the recommendation'),
  reasoning: z.string().describe('Explanation for the recommendation'),
  summary: z.string().describe('Brief summary of what data was found'),
  recordCount: z.number().describe('Number of records that would be created')
});

// Schema for final integration execution
const IntegrationExecutionSchema = z.object({
  status: z.enum(['success', 'error']).describe('Status of the integration'),
  explanation: z.string().max(50).describe('5-7 words explanation of the result'),
  insertedRecords: z.number().describe('Number of records successfully inserted'),
  errors: z.array(z.string()).describe('Any errors encountered during insertion'),
  integrationDetails: z.object({
    integration: z.string(),
    table: z.string(),
    timestamp: z.string()
  }).describe('Details about where the data was inserted')
});

export type DataAnalysis = z.infer<typeof DataAnalysisSchema>;
export type IntegrationExecution = z.infer<typeof IntegrationExecutionSchema>;

export class DatrixAIAgent {
  constructor() {}

  // Tool: Get user's available integrations
  private getUserIntegrations = tool({
    description: 'Get the list of integrations available for the user',
    parameters: z.object({
      userId: z.string().describe('The user ID to get integrations for')
    }),
    execute: async ({ userId }) => {
      console.log(`🔌 DatrixAI: Getting integrations for user: ${userId}`);
      
      try {
        const { data, error } = await getUserDataSources(userId);
        
        if (error) {
          console.error('❌ Error fetching integrations:', error);
          return { success: false, integrations: [], error: error.message };
        }

        const integrations = data?.map(source => ({
          id: source.source_type,
          name: source.source_type.charAt(0).toUpperCase() + source.source_type.slice(1),
          type: source.source_type,
          connected: true,
          tables: this.getAvailableTables(source.source_type),
          credentials: source.credentials // Include credentials for possible use
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

  // Tool: Execute integration (insert data)
  private executeIntegrationTool = tool({
    description: 'Execute the data insertion into the selected integration',
    parameters: z.object({
      userId: z.string().describe('The user ID'),
      integration: z.string().describe('The integration ID'),
      table: z.string().describe('The target table name'),
      data: z.array(z.record(z.any())).describe('The data records to insert')
    }),
    execute: async ({ userId, integration, table, data }) => {
      console.log(`📤 DatrixAI: Executing integration ${integration}.${table} for user ${userId}`);
      console.log(`📊 Inserting ${data.length} records`);
      
      try {
        // Simulate the integration execution
        const result = await this.simulateIntegrationExecution(integration, table, data);
        
        console.log(`✅ Integration execution ${result.success ? 'successful' : 'failed'}`);
        console.log(`📝 ${result.explanation}`);
        
        return {
          success: result.success,
          insertedRecords: result.insertedRecords,
          errors: result.errors,
          explanation: result.explanation,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        console.error('❌ Error executing integration:', error);
        return {
          success: false,
          insertedRecords: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          explanation: 'Integration execution failed',
          timestamp: new Date().toISOString()
        };
      }
    }
  });

  // Get available tables for each integration type
  private getAvailableTables(integrationType: string): string[] {
    const tables = {
      airtable: ['Contacts', 'Deals', 'Tasks', 'Companies', 'Products'],
      postgres: ['contacts', 'deals', 'tasks', 'companies', 'products'],
      sheets: ['Contacts', 'Deals', 'Tasks', 'Companies', 'Products'],
      notion: ['Contacts', 'Deals', 'Tasks', 'Companies', 'Products']
    };
    
    return tables[integrationType as keyof typeof tables] || [];
  }

  // Simulate integration execution
  private async simulateIntegrationExecution(integration: string, table: string, data: any[]) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simulate success/failure
    const successRate = 0.9; // 90% success rate
    const success = Math.random() < successRate;
    
    if (success) {
      const insertedRecords = data.length;
      return {
        success: true,
        insertedRecords,
        errors: [],
        explanation: `Successfully added ${insertedRecords} records`
      };
    } else {
      return {
        success: false,
        insertedRecords: 0,
        errors: ['API connection failed', 'Invalid credentials'],
        explanation: 'Integration failed to connect'
      };
    }
  }

  // Analyze data and recommend integration
  async analyzeData(input: string, userId: string): Promise<DataAnalysis> {
    console.log('\n🤖 DATRIX AI: ANALYZING DATA');
    console.log('============================');
    console.log('👤 User ID:', userId);
    console.log('📄 Input length:', input.length, 'characters');

    try {
      const { object } = await (generateObject as any)({
        model: openai('gpt-4o-mini'),
        schema: DataAnalysisSchema,
        tools: {
          getUserIntegrations: this.getUserIntegrations
        },
        prompt: `
You are DatrixAI, an intelligent data analysis agent. Your job is to:

1. Analyze the provided data to understand what type of business information it contains
2. Extract structured data from the input
3. Get the user's available integrations
4. Recommend the best integration and table for this data
5. Provide clear reasoning and confidence scores

USER ID: ${userId}

DATA TO ANALYZE:
${input}

ANALYSIS STEPS:
1. First, call getUserIntegrations to see what integrations are available for this user
2. Analyze the input data to identify:
   - What type of business data it contains (contacts, deals, tasks, etc.)
   - Extract structured records from the text/data
   - Identify key fields like names, emails, companies, amounts, dates, etc.
3. Based on the data type and available integrations, recommend:
   - The best integration to use
   - The most appropriate table/collection
   - Provide confidence score and reasoning

DATA TYPE IDENTIFICATION:
- Contacts: Names, emails, phone numbers, companies, addresses
- Deals: Deal names, amounts, stages, close dates, contact info
- Tasks: Task descriptions, assignees, due dates, priorities
- Invoices: Invoice numbers, amounts, dates, customer info
- Orders: Order details, products, quantities, customer info
- Customers: Customer information, purchase history
- Products: Product names, descriptions, prices, categories
- Events: Event names, dates, locations, attendees

EXTRACTION RULES:
- Extract each distinct record as a separate object
- Normalize field names to match common schema patterns
- Handle missing data gracefully
- Ensure data quality and consistency
- Count the total number of records that would be created

RECOMMENDATION LOGIC:
- Match data type to appropriate table (contacts → Contacts table)
- Consider integration capabilities and user's available options
- Prefer integrations that best match the data structure
- Provide high confidence for clear matches, lower for ambiguous data

Be thorough and accurate in your analysis.
        `,
      });

      console.log('🎯 Data Analysis Complete');
      console.log('=========================');
      console.log('📊 Data Type:', object.dataType);
      console.log('📈 Record Count:', object.recordCount);
      console.log('🔌 Recommended Integration:', object.recommendedIntegration);
      console.log('📋 Recommended Table:', object.recommendedTable);
      console.log('🎯 Confidence:', object.confidence);
      console.log('💭 Reasoning:', object.reasoning);
      console.log('📝 Summary:', object.summary);
      console.log('=========================\n');

      return object;
    } catch (error) {
      console.error('❌ DATRIX AI ANALYSIS ERROR:', error);
      
      // Fallback analysis
      return {
        dataType: 'unknown',
        extractedData: [],
        recommendedIntegration: 'none',
        recommendedTable: 'none',
        confidence: 0.0,
        reasoning: 'Failed to analyze data due to error',
        summary: 'Analysis failed',
        recordCount: 0
      };
    }
  }

  // Execute the integration after user confirmation
  async executeIntegration(
    userId: string, 
    integration: string, 
    table: string, 
    data: any[]
  ): Promise<IntegrationExecution> {
    console.log('\n🚀 DATRIX AI: EXECUTING INTEGRATION');
    console.log('===================================');
    console.log('👤 User ID:', userId);
    console.log('🔌 Integration:', integration);
    console.log('📋 Table:', table);
    console.log('📊 Records:', data.length);

    try {
      const { object } = await (generateObject as any)({
        model: openai('gpt-4o-mini'),
        schema: IntegrationExecutionSchema,
        tools: {
          executeIntegration: this.executeIntegrationTool
        },
        prompt: `
You are executing a data integration for DatrixAI. 

USER ID: ${userId}
INTEGRATION: ${integration}
TABLE: ${table}
DATA RECORDS: ${data.length}

DATA TO INSERT:
${JSON.stringify(data, null, 2)}

EXECUTION STEPS:
1. Call executeIntegration with the provided parameters
2. Process the results and provide a clear status
3. Return success/error status with a brief explanation (5-7 words)
4. Include details about what was inserted and any errors

Execute the integration now.
        `,
      });

      console.log('✅ Integration Execution Complete');
      console.log('=================================');
      console.log('✅ Status:', object.status);
      console.log('📝 Explanation:', object.explanation);
      console.log('📊 Inserted Records:', object.insertedRecords);
      console.log('❌ Errors:', object.errors.length);
      console.log('=================================\n');

      return object;
    } catch (error) {
      console.error('❌ DATRIX AI EXECUTION ERROR:', error);
      
      // Fallback execution result
      return {
        status: 'error',
        explanation: 'Execution failed due to error',
        insertedRecords: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        integrationDetails: {
          integration,
          table,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // Process file through document processor endpoint
  async processFile(file: File, userId: string): Promise<string> {
    console.log('\n📄 DATRIX AI: PROCESSING FILE');
    console.log('=============================');
    console.log('📁 File:', file.name);
    console.log('📏 Size:', file.size, 'bytes');
    console.log('🏷️ Type:', file.type);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('text', `File uploaded by user ${userId} for processing`);

      const response = await fetch('http://0.0.0.0:8080/test/process-document', {
        method: 'POST',
        body: formData,
        headers: {
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Document processor responded with status: ${response.status}`);
      }

      const result = await response.json();
      
      console.log('✅ File processing successful');
      console.log('📊 Extracted data length:', JSON.stringify(result).length, 'characters');
      
      // Convert the result to a string format for analysis
      return typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    } catch (error) {
      console.error('❌ File processing error:', error);
      throw new Error(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const datrixAIAgent = new DatrixAIAgent();