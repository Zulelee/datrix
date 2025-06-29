import { openai } from '@ai-sdk/openai';
import { generateObject, tool, streamText } from 'ai';
import { z } from 'zod';
import { getUserDataSources } from '@/lib/saveDataSource';
import { decrypt } from '@/lib/encryption';

// Allow responses up to 30 seconds
export const maxDuration = 30;

// Define the schema for chart components
const ChartDatasetSchema = z.object({
  label: z.string(),
  data: z.array(z.number()),
  backgroundColor: z.union([z.string(), z.array(z.string())]),
});

const ChartDataSchema = z.object({
  labels: z.array(z.string()),
  datasets: z.array(ChartDatasetSchema),
});

const ChartComponentSchema = z.object({
  id: z.string(),
  type: z.enum(['chart', 'table', 'metric', 'text']),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.object({
    title: z.string(),
    chartType: z.enum(['bar', 'line', 'pie', 'area', 'donut']),
    dataset: ChartDataSchema,
  }),
});

const AnalysisResultSchema = z.object({
  explanation: z.string().describe('A brief explanation of the analysis results'),
  components: z.array(ChartComponentSchema).describe('Array of chart components to display on the board'),
});

async function getUserDataSourcesTool(userId: string) {
  if (!userId) {
    console.log('No userId provided to tool');
    return {
      success: false,
      integrations: [],
      error: 'User not authenticated',
      message: 'You need to be logged in to view your integrations.'
    };
  }
  try {
    console.log('Calling getUserDataSources with userId:', userId);
    const { data, error } = await getUserDataSources(userId);
    
    console.log('getUserDataSources result:', { data, error });
    
    if (error) {
      console.log('Error from getUserDataSources:', error);
      return { 
        success: false, 
        integrations: [], 
        error: error.message,
        message: `Error fetching integrations: ${error.message}`
      };
    }

    const integrations = data?.map(source => ({
      id: source.source_type,
      type: source.source_type,
      name: source.source_type.charAt(0).toUpperCase() + source.source_type.slice(1),
      connected: true,
      lastUpdated: source.updated_at,
      // Don't expose credentials in the response
      hasCredentials: Boolean(source.credentials)
    })) || [];

    console.log('Final integrations result:', integrations);

    const message = integrations.length > 0 
      ? `Found ${integrations.length} connected integration${integrations.length === 1 ? '' : 's'}: ${integrations.map(i => i.name).join(', ')}`
      : 'No integrations are currently connected. You can set up integrations in your Profile page or through the Onboarding flow.';

    return { 
      success: true, 
      integrations,
      count: integrations.length,
      message
    };
  } catch (error) {
    console.log('Exception in getUserIntegrations:', error);
    return { 
      success: false, 
      integrations: [], 
      error: error instanceof Error ? error.message : 'Unknown error',
      message: `An error occurred while fetching your integrations: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function airtableIntegrationTool(userId: string, action: string, params: any) {
  console.log('=== AIRTABLE INTEGRATION TOOL DEBUG ===');
  console.log('User ID:', userId);
  console.log('Action:', action);
  console.log('Params:', JSON.stringify(params, null, 2));
  
  try {
    // Get user's Airtable credentials
    const { data: dataSources, error } = await getUserDataSources(userId);
    console.log('Data sources result:', { data: dataSources, error });
    
    if (error) {
      console.log('Error getting data sources:', error);
      return { success: false, error: error.message };
    }
    
    const airtableSource = dataSources?.find(source => source.source_type === 'airtable');
    console.log('Airtable source found:', airtableSource ? 'YES' : 'NO');
    
    if (!airtableSource) {
      return { 
        success: false, 
        error: 'Airtable integration not found. Please connect your Airtable account first.' 
      };
    }

    const credentials = airtableSource.credentials;
    console.log('Credentials keys:', Object.keys(credentials || {}));
    console.log('API Key present:', credentials?.apiKey ? 'YES' : 'NO');
    console.log('API Key (first 10 chars):', credentials?.apiKey ? credentials.apiKey.substring(0, 10) + '...' : 'NO KEY');
    
    const token = credentials.apiKey;

    switch (action) {
      case 'getSchema':
        return await getAirtableSchema(token);
      case 'getRecords':
        return await getAirtableRecords(token, params);
        
      default:
        return { success: false, error: `Unknown action: ${action}` };
    }
  } catch (error) {
    console.error('Error in airtableIntegrationTool:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function getAirtableSchema(token: string) {
  try {
    // First, get all bases
    const basesResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/airtable/bases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    if (!basesResponse.ok) {
      const error = await basesResponse.json();
      return { success: false, error: error.message || 'Failed to fetch bases' };
    }

    const basesData = await basesResponse.json();
    const bases = basesData.data.bases;

    // Get tables for each base
    const schema = { bases: {} };
    
    for (const base of bases) {
      const tablesResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/airtable/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, baseId: base.id })
      });

      if (tablesResponse.ok) {
        const tablesData = await tablesResponse.json();
        schema.bases[base.name] = {
          id: base.id,
          tables: {}
        };

        for (const table of tablesData.data.tables) {
          schema.bases[base.name].tables[table.name] = {
            id: table.id,
            baseId: base.id, // Explicitly include baseId with each table for easier reference
            fields: {},
            fieldsList: [] // Add explicit list of field names for validation
          };

          // Process fields with more detail
          const fieldsList = [];
          for (const field of table.fields) {
            const fieldInfo = {
              type: field.type,
              required: field.required || false,
              options: field.options || null,
              description: field.description || null
            };
            
            schema.bases[base.name].tables[table.name].fields[field.name] = fieldInfo;
            fieldsList.push(field.name);
          }
          
          schema.bases[base.name].tables[table.name].fieldsList = fieldsList;
        }
      }
    }

    console.log('Airtable schema fetched:', JSON.stringify(schema, null, 2));

    return {
      success: true,
      schema,
      integrationType: 'airtable',
      schemaValidation: {
        totalBases: bases.length,
        totalTables: Object.values(schema.bases).reduce((acc: number, base: any) => acc + Object.keys(base.tables).length, 0),
        message: 'Schema fetched successfully. Always verify field names exist before mapping data.'
      }
    };

  } catch (error) {
    console.error('Error getting Airtable schema:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function getAirtableRecords(token: string, params: any) {
  const { baseId, tableName, options } = params;
  
  console.log('=== AIRTABLE GET RECORDS DEBUG ===');
  console.log('Token (first 10 chars):', token ? token.substring(0, 10) + '...' : 'NO TOKEN');
  console.log('Base ID:', baseId);
  console.log('Table Name:', tableName);
  console.log('Options:', options);
  
  try {
    // Validate required parameters
    if (!baseId) {
      return { 
        success: false, 
        error: 'Missing baseId parameter. You must provide the exact baseId from the schema.' 
      };
    }
    
    if (!tableName) {
      return { 
        success: false, 
        error: 'Missing tableName parameter. You must provide the exact table name as it appears in the schema.' 
      };
    }
    
    // Build URL with query parameters
    const url = new URL(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/airtable/records`);
    url.searchParams.append('token', token);
    url.searchParams.append('baseId', baseId);
    url.searchParams.append('tableIdOrName', tableName);
    
    // Add optional query parameters if provided
    if (options) {
      if (options.pageSize) url.searchParams.append('pageSize', options.pageSize.toString());
      if (options.offset) url.searchParams.append('offset', options.offset);
      if (options.filterByFormula) url.searchParams.append('filterByFormula', options.filterByFormula);
      if (options.sort) url.searchParams.append('sort', JSON.stringify(options.sort));
      if (options.view) url.searchParams.append('view', options.view);
    }
    
    console.log('Request URL:', url.toString());
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('Airtable response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.log('Airtable error response:', error);
      
      // Provide more detailed error message based on common issues
      let errorMessage = error.message || 'Failed to retrieve records';
      
      if (error.error?.type === 'INVALID_PERMISSIONS_ERROR') {
        errorMessage = 'Permission error: The API key does not have access to this base or table.';
      } else if (error.error?.type === 'TABLE_NOT_FOUND') {
        errorMessage = `Table not found: "${tableName}" does not exist in the specified base.`;
      }
      
      return { success: false, error: errorMessage, details: error };
    }

    const data = await response.json();
    console.log('Airtable success response records count:', data.data.records?.length);
    
    return {
      success: true,
      integrationType: 'airtable',
      tableName,
      records: data.data.records,
      offset: data.data.offset, // Include offset if returned by Airtable for pagination
      recordCount: data.data.records?.length || 0,
      message: `Successfully retrieved ${data.data.records?.length || 0} record(s) from ${tableName} in Airtable`
    };

  } catch (error) {
    console.error('Error getting Airtable records:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function postgresIntegrationTool(userId: string, action: string, params: any) {
  console.log('PostgreSQL integration tool called:', { userId, action, params });
  
  // Mock implementation for now - you can implement real PostgreSQL integration later
  switch (action) {
    case 'getSchema':
      return {
        success: true,
        schema: {
          database: 'main',
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
            }
          }
        },
        integrationType: 'postgres'
      };
    
    case 'upsertRecords':
      // Mock success response
      return {
        success: true,
        integrationType: 'postgres',
        tableName: params.tableName,
        recordsProcessed: params.records.length,
        recordsCreated: params.records.length,
        recordsUpdated: 0,
        message: `Successfully added ${params.records.length} record(s) to ${params.tableName} in PostgreSQL (mock)`
      };
    
    default:
      return { success: false, error: `Unknown action: ${action}` };
  }
}

export async function POST(req: Request) {
  const { messages, userId, analysisType } = await req.json();
  
  console.log('Analysis API called with userId:', userId);
  console.log('Analysis type:', analysisType);
  console.log('Messages:', messages.length, 'messages');

  // Select the appropriate system prompt based on analysis type
  let systemPrompt = '';
  
  if (analysisType === 'sales-reporting') {
    systemPrompt = `You are a specialized Sales Reporting AI Agent designed to fetch, analyze, and report sales data from CRM systems and databases. Your primary responsibility is to generate accurate, timely, and actionable sales reports for business stakeholders.

Core Responsibilities:
Data Collection
- Connect to and query CRM systems and databases to retrieve sales data
- Ensure data integrity and handle missing or inconsistent data appropriately
- Validate data sources and flag any anomalies or discrepancies
- Maintain data security and access protocols at all times

Key Metrics Calculation:
1. Total Sales Revenue
   Formula: Revenue = Σ(Price × Quantity Sold)
   Calculate across specified time periods (daily, weekly, monthly, quarterly, yearly)
   Breakdown by product, region, sales rep, or other relevant dimensions
   Include currency conversions when dealing with multi-currency data

2. Sales Growth Rate
   Formula: Sale Growth Rate = ((Current Period Sales - Previous Period Sales) / Previous Period Sales) × 100
   Compare periods consistently (month-over-month, quarter-over-quarter, year-over-year)
   Provide context for growth patterns and identify significant changes
   Handle negative growth scenarios appropriately

3. Average Order Value (AOV)
   Formula: AOV = Total Revenue / Number of Orders
   Calculate for different customer segments and time periods
   Track AOV trends and identify factors influencing changes
   Exclude returns and refunds unless specifically requested

ANALYSIS WORKFLOW:
1. Get the user's integrations using getUserIntegrations tool
2. Check the schema of the integration's tables using the appropriate integration tool with getSchema action
3. Plan your analysis based on available data and user's request
4. Perform your analysis by retrieving necessary data using getRecords action
5. Calculate key metrics and prepare visualizations
6. Return your analysis with chart components in the structured output format

CHART COMPONENTS FORMAT:
When returning analysis results, you must provide components in the following format:
{
  "explanation": "Brief explanation of the analysis",
  "components": [
    {
      "id": "unique-id-1",
      "type": "chart", 
      "position": { "x": 0, "y": 0 },
      "data": {
        "title": "Chart Title",
        "chartType": "bar", // IMPORTANT: Only use these supported types: "bar", "pie", "line", "area", or "donut"
        "dataset": {
          "labels": ["Label1", "Label2", "Label3"],
          "datasets": [
            {
              "label": "Dataset Label",
              "data": [10, 20, 30],
              "backgroundColor": "rgba(75, 192, 192, 0.2)"
            }
          ]
        }
      }
    }
  ]
}

CRITICAL: For chartType, you MUST ONLY use one of these five supported types: "bar", "pie", "line", "area", or "donut".
Do NOT use any other chart types like "metric", "table", "scatter", etc. - they will cause errors.
For metrics or single values, use a "bar" chart with one data point.

Be thorough, accurate, and focus on providing actionable insights from the data.`;
  } else {
    // Default prompt if no specific analysis type is selected
    systemPrompt = `You are an AI Analysis Agent designed to help users analyze their data from various integrations.`;
  }
  
  try {
    const model = openai('gpt-4.1-mini');
    
    // Use streamText to generate analysis with tools
    const result = await (streamText as any)({
      model,
      verbose: true,
      toolChoice: 'auto',
      maxToolRoundtrips: 10,
      messages,
      system: systemPrompt,
      tools: {
        getUserIntegrations: tool({
          description: 'Get the list of integrations/data sources configured for the current user. Always use this when users ask about their integrations or when processing data.',
          parameters: z.object({}),
          execute: async () => {
            console.log('getUserIntegrations tool called with userId:', userId);
            return await getUserDataSourcesTool(userId);
          }
        }),
        airtableIntegration: tool({
          description: 'Interact with Airtable integration. Actions: "getSchema" to get real-time table structures, "getRecords" to retrieve records from a table.',
          parameters: z.object({
            action: z.enum(['getSchema', 'getRecords']).describe('The action to perform'),
            params: z.any().optional().describe('Parameters for the action. For "getRecords", you MUST provide: baseId (from schema.bases[baseName].id), tableName (exact name as in schema), and optional filtering options.')
          }),
          execute: async ({ action, params }) => {
            return await airtableIntegrationTool(userId, action, params);
          }
        }),
        postgresIntegration: tool({
          description: 'Interact with PostgreSQL integration. Actions: "getSchema" to get table structures.',
          parameters: z.object({
            action: z.enum(['getSchema']).describe('The action to perform'),
            params: z.any().optional().describe('Parameters for the action')
          }),
          execute: async ({ action, params }) => {
            return await postgresIntegrationTool(userId, action, params);
          }
        })
      }
    });
    
    // Return the streaming response
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in analysis:', error);
    return Response.json({ 
      error: 'Failed to generate analysis',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 