import { supabase } from './supabaseClient';

export interface RunLogData {
  user_id: string;
  data_type: string;
  source: string;
  destination: string;
  status: 'Success' | 'In Progress' | 'Failed';
}

export async function logRun(runData: RunLogData) {
  try {
    console.log('📝 Logging run to database:', runData);
    
    const { data, error } = await supabase
      .from('runs')
      .insert([
        {
          user_id: runData.user_id,
          run_time: new Date().toISOString(),
          data_type: runData.data_type,
          source: runData.source,
          destination: runData.destination,
          status: runData.status
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Error logging run:', error);
      return { data: null, error };
    }

    console.log('✅ Run logged successfully:', data);
    return { data, error: null };
  } catch (error) {
    console.error('❌ Exception while logging run:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

export async function updateRunStatus(runId: string, status: 'Success' | 'Failed') {
  try {
    const { data, error } = await supabase
      .from('runs')
      .update({ status })
      .eq('id', runId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating run status:', error);
      return { data: null, error };
    }

    console.log('✅ Run status updated successfully:', data);
    return { data, error: null };
  } catch (error) {
    console.error('❌ Exception while updating run status:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

// Helper function to determine data type from records
export function inferDataType(records: any[]): string {
  if (!records || records.length === 0) return 'Unknown';
  
  const firstRecord = records[0];
  const fields = firstRecord.fields || firstRecord;
  const fieldNames = Object.keys(fields).map(key => key.toLowerCase());
  
  // Check for common patterns
  if (fieldNames.some(name => ['email', 'name', 'contact'].some(pattern => name.includes(pattern)))) {
    return 'Contacts';
  }
  
  if (fieldNames.some(name => ['deal', 'opportunity', 'sale', 'revenue'].some(pattern => name.includes(pattern)))) {
    return 'Deals';
  }
  
  if (fieldNames.some(name => ['order', 'purchase', 'invoice', 'payment'].some(pattern => name.includes(pattern)))) {
    return 'Orders';
  }
  
  if (fieldNames.some(name => ['product', 'item', 'inventory'].some(pattern => name.includes(pattern)))) {
    return 'Products';
  }
  
  if (fieldNames.some(name => ['task', 'todo', 'activity'].some(pattern => name.includes(pattern)))) {
    return 'Tasks';
  }
  
  if (fieldNames.some(name => ['lead', 'prospect'].some(pattern => name.includes(pattern)))) {
    return 'Leads';
  }
  
  // Default to generic data type
  return 'Data Records';
}