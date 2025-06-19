import { supabase } from './supabaseClient';
import { encrypt, decrypt } from './encryption';

export async function saveUserDataSource(
  userId: string,
  sourceType: 'airtable' | 'postgres',
  credentials: any
) {
  // Encrypt each credential value
  const encryptedCredentials = await Promise.all(
    Object.entries(credentials).map(async ([key, value]) => [
      key,
      await encrypt(value as string, userId)
    ])
  );

  const { data, error } = await supabase
    .from('user_data_sources')
    .upsert([
      {
        user_id: userId,
        source_type: sourceType,
        credentials: Object.fromEntries(encryptedCredentials),
        updated_at: new Date().toISOString(),
      }
    ], { onConflict: 'user_id,source_type' });

  return { data, error };
}

export async function deleteUserDataSource(userId: string, sourceType: 'airtable' | 'postgres') {
  return await supabase
    .from('user_data_sources')
    .delete()
    .eq('user_id', userId)
    .eq('source_type', sourceType);
}

export async function getUserDataSources(userId: string) {
  const { data, error } = await supabase
    .from('user_data_sources')
    .select('*')
    .eq('user_id', userId);

  // Decrypt credentials before returning
  if (data) {
    const decryptedData = await Promise.all(
      data.map(async row => ({
        ...row,
        credentials: Object.fromEntries(
          await Promise.all(
            Object.entries(row.credentials).map(async ([key, value]) => [
              key,
              await decrypt(value as string, userId)
            ])
          )
        )
      }))
    );
    return { data: decryptedData, error };
  }

  return { data, error };
}