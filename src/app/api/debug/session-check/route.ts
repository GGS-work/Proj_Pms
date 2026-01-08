import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sql as rawSql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session-token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ 
        error: 'No session cookie found',
        cookieName: 'session-token'
      });
    }

    console.log('[DEBUG] Checking session token:', sessionToken.substring(0, 10) + '...');

    // Check if 'sessions' table exists
    const tablesResult: any = await db.execute(rawSql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('sessions', 'user_sessions')
    `);

    const tableNames = Array.isArray(tablesResult) ? tablesResult.map((t: any) => t.table_name) : 
                       tablesResult.rows ? tablesResult.rows.map((t: any) => t.table_name) : [];
    console.log('[DEBUG] Tables found:', tableNames);

    // Try to find session in 'sessions' table using Drizzle
    const sessionResult = await db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionToken, sessionToken))
      .limit(1);

    const sessionInSessions = sessionResult[0] || null;
    console.log('[DEBUG] Session in "sessions" table:', sessionInSessions ? 'FOUND' : 'NOT FOUND');

    // Try to find session in 'user_sessions' table with raw SQL
    let sessionInUserSessions: any = null;
    try {
      const result: any = await db.execute(rawSql`
        SELECT session_token, user_id, expires 
        FROM user_sessions 
        WHERE session_token = ${sessionToken}
        LIMIT 1
      `);
      const rows = Array.isArray(result) ? result : result.rows || [];
      sessionInUserSessions = rows[0] || null;
      console.log('[DEBUG] Session in "user_sessions" table:', sessionInUserSessions ? 'FOUND' : 'NOT FOUND');
    } catch (err) {
      console.log('[DEBUG] "user_sessions" table does not exist or error:', err);
    }

    // Count total sessions
    const sessionsCountResult: any = await db.execute(rawSql`SELECT COUNT(*) as count FROM sessions`);
    const sessionsRows = Array.isArray(sessionsCountResult) ? sessionsCountResult : sessionsCountResult.rows || [];
    const sessionsCount = parseInt(sessionsRows[0]?.count as string || '0');

    let userSessionsCount = 0;
    try {
      const countResult: any = await db.execute(rawSql`SELECT COUNT(*) as count FROM user_sessions`);
      const userRows = Array.isArray(countResult) ? countResult : countResult.rows || [];
      userSessionsCount = parseInt(userRows[0]?.count as string || '0');
    } catch (err) {
      console.log('[DEBUG] user_sessions table does not exist');
    }

    return NextResponse.json({
      sessionToken: sessionToken.substring(0, 10) + '...',
      tablesFound: tableNames,
      sessionInSessions: sessionInSessions ? {
        found: true,
        userId: sessionInSessions.userId,
        expires: sessionInSessions.expires
      } : { found: false },
      sessionInUserSessions: sessionInUserSessions ? {
        found: true,
        userId: sessionInUserSessions.user_id,
        expires: sessionInUserSessions.expires
      } : { found: false },
      totalSessionsCount: sessionsCount,
      totalUserSessionsCount: userSessionsCount,
      recommendation: sessionInUserSessions 
        ? 'Session exists in user_sessions table - need to migrate data'
        : sessionInSessions 
        ? 'Session found in sessions table - authentication should work'
        : 'Session not found in either table - please sign in again'
    });
  } catch (error) {
    console.error('[DEBUG] Error:', error);
    return NextResponse.json({ 
      error: 'Debug check failed', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
