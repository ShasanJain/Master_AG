import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export async function GET() {
  try {
    const dbPath = path.resolve(process.cwd(), '../tokens.db');
    
    // Open the database
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Check if table exists
    const tableExists = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='token_usage'");
    
    if (!tableExists) {
      return NextResponse.json({ error: "Token database not initialized." }, { status: 404 });
    }

    // Aggregate tokens for today
    const now = Date.now() / 1000;
    const oneDayAgo = now - 24 * 3600;

    const todayUsage = await db.all(`
      SELECT model, SUM(prompt_tokens) as prompt_tokens, SUM(completion_tokens) as completion_tokens
      FROM token_usage
      WHERE timestamp >= ?
      GROUP BY model
    `, [oneDayAgo]);

    // Aggregate total usage all time
    const totalUsage = await db.all(`
      SELECT model, SUM(prompt_tokens) as prompt_tokens, SUM(completion_tokens) as completion_tokens
      FROM token_usage
      GROUP BY model
    `);

    // Aggregate daily sums for the past 7 days (for chart)
    const sevenDaysAgo = now - 7 * 24 * 3600;
    const historyRows = await db.all(`
      SELECT 
        cast((? - timestamp) / (24 * 3600) as integer) as days_ago,
        SUM(prompt_tokens + completion_tokens) as total_tokens
      FROM token_usage
      WHERE timestamp >= ?
      GROUP BY days_ago
      ORDER BY days_ago DESC
    `, [now, sevenDaysAgo]);

    // Format history to always have 7 days
    const history = Array(7).fill(0);
    for (const row of historyRows) {
      if (row.days_ago >= 0 && row.days_ago < 7) {
        // days_ago = 0 is today (rightmost), days_ago = 6 is oldest (leftmost)
        history[6 - row.days_ago] = row.total_tokens;
      }
    }

    await db.close();

    return NextResponse.json({
      today: todayUsage,
      total: totalUsage,
      history: history
    });
  } catch (error) {
    console.error('Error fetching token usage:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
