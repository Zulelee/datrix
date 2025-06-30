import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { getUserDataSources } from '@/lib/saveDataSource';
import { decrypt } from '@/lib/encryption';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

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
      
      case 'upsertRecords':
        return await upsertAirtableRecords(token, params, userId);
      
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
            baseId: base.id,
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

async function upsertAirtableRecords(token: string, params: any, userId: string) {
  const { baseId, tableName, records } = params;
  
  console.log('=== AIRTABLE UPSERT DEBUG ===');
  console.log('Token (first 10 chars):', token ? token.substring(0, 10) + '...' : 'NO TOKEN');
  console.log('Base ID:', baseId);
  console.log('Table Name:', tableName);
  console.log('Records to insert:', JSON.stringify(records, null, 2));
  
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
    
    if (!records || !Array.isArray(records) || records.length === 0) {
      return { 
        success: false, 
        error: 'Missing or invalid records parameter. You must provide an array of records to insert.' 
      };
    }
    
    const requestBody = {
      token,
      baseId,
      tableIdOrName: tableName,
      records: records.map((record: any, index: number) => {
        console.log(`Record ${index} input:`, JSON.stringify(record, null, 2));
        
        // Check if record already has a 'fields' property (from AI)
        let processedRecord;
        if (record.fields) {
          processedRecord = { fields: record.fields };  // Use the nested fields
          console.log(`Record ${index} had nested fields, extracted:`, JSON.stringify(processedRecord, null, 2));
        } else {
          processedRecord = { fields: record };  // Wrap the record in fields
          console.log(`Record ${index} wrapped in fields:`, JSON.stringify(processedRecord, null, 2));
        }
        
        return processedRecord;
      })
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/airtable/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    console.log('Airtable response status:', response.status);
    console.log('Airtable response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const error = await response.json();
      console.log('Airtable error response:', error);
      
      // Provide more detailed error message based on common issues
      let errorMessage = error.message || 'Failed to create records';
      
      if (error.error?.type === 'INVALID_PERMISSIONS_ERROR') {
        errorMessage = 'Permission error: The API key does not have access to this base or table.';
      } else if (error.error?.type === 'TABLE_NOT_FOUND') {
        errorMessage = `Table not found: "${tableName}" does not exist in the specified base.`;
      } else if (error.error?.type === 'INVALID_FIELD_NAME') {
        errorMessage = 'Invalid field name: One or more field names do not exist in the table schema.';
      } else if (error.error?.type === 'INVALID_VALUE_FOR_COLUMN') {
        errorMessage = 'Invalid value: One or more values do not match the required format for their fields.';
      } else if (error.error?.type === 'INVALID_MULTIPLE_CHOICE_OPTIONS') {
        errorMessage = 'Invalid option: One or more select/multiselect values are not in the list of allowed options.';
      }
      
      return { success: false, error: errorMessage, details: error };
    }

    const data = await response.json();
    console.log('Airtable success response:', data);
    
    return {
      success: true,
      integrationType: 'airtable',
      tableName,
      recordsProcessed: records.length,
      recordsCreated: data.data.records.length,
      recordsUpdated: 0,
      message: `Successfully added ${data.data.records.length} record(s) to ${tableName} in Airtable`
    };

  } catch (error) {
    console.error('Error upserting Airtable records:', error);
    
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
  const { messages, userId } = await req.json();
  
  console.log('Chat API called with userId:', userId);
  console.log('Messages:', messages.length, 'messages');

  
  const result = await (streamText as any)({
    model: openai('gpt-4.1-mini'),
    verbose: true,
    toolChoice: 'auto',
    maxToolRoundtrips: 10,
    messages,
    onFinish: (result: any) => {
      console.log('=== AI RESPONSE FINISHED ===');
      console.log('Final text:', result.text);
      console.log('Tool calls:', result.toolCalls);
      console.log('Tool results:', result.toolResults);
      console.log('=== END AI RESPONSE ===');
    },
    system: `You are DatrixAI, an intelligent and autonomous data assistant. Your primary job is to help users process and organize their data into connected systems like Airtable, PostgreSQL, and Notion.

MAIN DATA PROCESSING FLOW:
When users provide data (either by uploading files or pasting/typing data), you MUST AUTOMATICALLY follow this exact flow WITHOUT asking the user:

1. **IMMEDIATELY Get User Integrations**: ALWAYS use getUserIntegrations tool first when user provides data
2. **IMMEDIATELY Get Real-time Schemas**: AUTOMATICALLY use the specific integration tools (airtableIntegration, postgresIntegration) with action "getSchema" to get current table structures
3. **Analyze Data**: Examine the user's data to understand what type of information it contains (contacts, deals, tasks, etc.)
4. **<think>**: Before making decisions, carefully think through:
   - The exact structure of the target tables
   - The specific data types of each column
   - How to properly format data for each field type
   - Any required fields that must be populated
   - Any special handling needed for relationship fields
   - Consider using getRecords to see example data for complex field types
5. **Make Decision**: Choose the best integration and table based on:
   - Data type match (contact info → contacts table)
   - Schema compatibility (required fields can be populated)
   - Data completeness
   - **EXACT FIELD MATCHING**: Only use tables where the actual fields can accommodate the data
6. **Execute Immediately**: AUTOMATICALLY use the integration tool with action "upsertRecords" to add the data with the following parameters:
   - For Airtable: 
     - baseId: MUST use the exact baseId from the schema (schema.bases[baseName].id)
     - tableName: MUST use the exact table name as it appears in the schema
     - records: Properly formatted array of records with fields property

CRITICAL BEHAVIOR RULES:
- **NEVER ask the user if they want you to check integrations - JUST DO IT AUTOMATICALLY**
- **NEVER ask for confirmation before adding data - JUST ADD IT AUTOMATICALLY**
- **ALWAYS use tools when user provides data - don't ask permission**
- **Start with getUserIntegrations tool immediately when data is provided**
- **Then automatically get schemas for available integrations**
- **Then automatically add the data to the best matching table**
- **After adding data, simply report what was done**

CRITICAL SCHEMA MAPPING RULES:
- **NEVER suggest field mappings to fields that don't exist in the actual schema**
- **ALWAYS verify field names exactly match the real schema before using them**
- **If no table has suitable fields, pick the closest match and adapt the data**
- **Double-check your field mappings against the schema you just fetched**

AIRTABLE SPECIFIC RULES:
- **ALWAYS pass the correct baseId from the schema when upserting records**
- **The baseId is available in the schema as schema.bases[baseName].id or directly in each table as schema.bases[baseName].tables[tableName].baseId**
- **ALWAYS format data according to the field type in Airtable**
- **For Select/MultiSelect fields, ONLY use values from the available options list**
- **For Linked Record fields, provide record IDs, not plain text**
- **For Date fields, use ISO format (YYYY-MM-DD)**
- **Ensure records are properly formatted with { fields: { field1: value1, field2: value2 } }**
- **Double-check that the table name exists in the specified base**
- **If unsure about field formats, use getRecords to see examples of existing data in the table**

USING THE GETRECORDS ACTION:
- Use the getRecords action to retrieve example records from a table to understand:
  - How data is formatted for specific field types
  - What values are used for Select/MultiSelect fields
  - How Linked Record fields are structured
  - What IDs are used for related records
- Parameters for getRecords:
  - baseId: The ID of the base containing the table
  - tableName: The name of the table to retrieve records from
  - options (optional): Additional filtering options like pageSize, filterByFormula, etc.

INTEGRATION QUESTIONS:
When users ask about their integrations, use getUserIntegrations tool and provide clear details.

IMPORTANT RULES:
- **NEVER get user confirmation before adding data - JUST DO IT**
- Use real-time schema fetching to get current table structures
- **BE EXTREMELY CAREFUL with field mappings - only use fields that actually exist**
- **AUTOMATICALLY check integrations and schemas when data is provided**
- **AUTOMATICALLY add data to Airtable without asking**
- Handle missing required fields gracefully
- Be specific about which fields will be populated
- If data doesn't fit well into any available schema, pick the closest match and adapt the data

Be helpful, thorough, and focus on practical data organization solutions.`,
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
        description: 'Interact with Airtable integration. Actions: "getSchema" to get real-time table structures, "upsertRecords" to add/update data, "getRecords" to retrieve records from a table.',
        parameters: z.object({
          action: z.enum(['getSchema', 'upsertRecords', 'getRecords']).describe('The action to perform'),
          params: z.any().optional().describe('Parameters for the action. For "upsertRecords", you MUST provide: baseId (from schema.bases[baseName].id), tableName (exact name as in schema), and records (array of records formatted according to field types). For "getRecords", provide: baseId, tableName, and optional filtering options.')
        }),
        execute: async ({ action, params }) => {
          return await airtableIntegrationTool(userId, action, params);
        }
      }),
      postgresIntegration: tool({
        description: 'Interact with PostgreSQL integration. Actions: "getSchema" to get table structures, "upsertRecords" to add/update data.',
        parameters: z.object({
          action: z.enum(['getSchema', 'upsertRecords']).describe('The action to perform'),
          params: z.any().optional().describe('Parameters for the action (required for upsertRecords: tableName, records)')
        }),
        execute: async ({ action, params }) => {
          return await postgresIntegrationTool(userId, action, params);
        }
      })
    }
  });

  return (result as any).toDataStreamResponse();
}