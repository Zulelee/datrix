import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

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
  }).optional(),
  data: z.object({
    title: z.string(),
    chartType: z.enum(['bar', 'pie', 'line', 'area', 'donut']),
    dataset: ChartDataSchema,
  }),
});

const AnalysisResultSchema = z.object({
  explanation: z.string(),
  components: z.array(ChartComponentSchema),
});

export async function POST(req: Request) {
  try {
    const { analysisText } = await req.json();
    
    const model = openai('gpt-4.1-mini');
    
    // Format the analysis text into proper JSON structure
    const { object } = await (generateObject as any)({
      model,
      schema: AnalysisResultSchema,
      system: `You are a data formatting assistant. Your job is to take the analysis text and format it into a structured JSON object according to the schema. The input text contains analysis results that need to be extracted and formatted properly.
      
The analysis text may already contain JSON components, but they might be embedded in markdown or text. Extract these components carefully.

If the analysis text doesn't contain proper components, create appropriate chart components based on the analysis content.

IMPORTANT: 
- Each chart component must have a unique id
- Chart types must be one of: bar, pie, line, area, donut
- Do NOT use 'metric' as a chart type - convert any metrics to bar charts instead
- Dataset must have matching labels and data arrays
- Colors should be valid CSS colors or color arrays`,
      messages: [
        {
          role: 'user',
          content: `Format this analysis result into the proper JSON structure with explanation and components:\n\n${analysisText}`
        }
      ]
    });
    
    // Handle metric type by converting to bar chart
    const processedObject = {
      ...object,
      components: object.components.map(component => {
        if (component.data.chartType === 'metric') {
          return {
            ...component,
            data: {
              ...component.data,
              chartType: 'bar' // Convert metric to bar chart
            }
          };
        }
        return component;
      })
    };
    
    console.log('=== FORMATTING COMPLETED ===');
    console.log('Formatted result:', JSON.stringify(processedObject, null, 2));
    console.log('=== END FORMATTING ===');
    
    return Response.json(processedObject);
  } catch (error) {
    console.error('Error in formatting:', error);
    return Response.json({ 
      error: 'Failed to format analysis',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 