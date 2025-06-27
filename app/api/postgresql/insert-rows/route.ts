import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

export async function POST(request: NextRequest) {
  try {
    const { connectionString, tableName, rows } = await request.json();
    if (!connectionString || !tableName || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ success: false, message: 'connectionString, tableName, and rows (array) are required' }, { status: 400 });
    }
    const sql = postgres(connectionString, { max: 1 });
    let inserted = 0;
    for (const row of rows) {
      const keys = Object.keys(row);
      const values = Object.values(row);
      await sql.unsafe(
        `INSERT INTO "${tableName}" (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${values.map((_, i) => `$${i+1}`).join(', ')})`,
        values
      );
      inserted++;
    }
    await sql.end();
    return NextResponse.json({ success: true, inserted });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 