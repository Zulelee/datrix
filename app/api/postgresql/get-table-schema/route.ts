import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

export async function POST(request: NextRequest) {
  try {
    const { connectionString, tableName } = await request.json();
    if (!connectionString || !tableName) {
      return NextResponse.json({ success: false, message: 'connectionString and tableName are required' }, { status: 400 });
    }
    const sql = postgres(connectionString, { max: 1 });
    const columns = await sql`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = ${tableName} ORDER BY ordinal_position;`;
    await sql.end();
    return NextResponse.json({ success: true, columns });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 