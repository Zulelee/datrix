import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

export async function POST(request: NextRequest) {
  try {
    const { connectionString } = await request.json();
    if (!connectionString) {
      return NextResponse.json({ success: false, message: 'connectionString is required' }, { status: 400 });
    }
    const sql = postgres(connectionString, { max: 1 });
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`;
    await sql.end();
    return NextResponse.json({ success: true, tables: tables.map((r: any) => r.table_name) });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 