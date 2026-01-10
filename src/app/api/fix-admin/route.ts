import { db } from "@/db";
import { users, members, workspaces } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Find Varun
    const [varun] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'varun@pms.com'))
      .limit(1);
    
    if (!varun) {
      return NextResponse.json({ error: 'Varun not found' }, { status: 404 });
    }

    // 2. Get or create workspace
    let workspace = await db.select().from(workspaces).limit(1);
    
    let workspaceId;
    if (workspace.length === 0) {
      const [newWorkspace] = await db
        .insert(workspaces)
        .values({
          name: 'GGS Workspace',
          userId: varun.id,
          imageUrl: null,
          inviteCode: 'GGS-' + Math.random().toString(36).substring(7).toUpperCase()
        })
        .returning();
      workspaceId = newWorkspace.id;
    } else {
      workspaceId = workspace[0].id;
    }

    // 3. Check if membership exists
    const existingMembership = await db
      .select()
      .from(members)
      .where(eq(members.userId, varun.id))
      .limit(1);

    if (existingMembership.length === 0) {
      // Add as ADMIN
      await db.insert(members).values({
        workspaceId: workspaceId,
        userId: varun.id,
        role: 'ADMIN'
      });

      return NextResponse.json({
        success: true,
        message: 'Added Varun as ADMIN',
        userId: varun.id,
        userEmail: varun.email,
        role: 'ADMIN',
        workspaceId
      });
    } else {
      // Update to ADMIN
      await db
        .update(members)
        .set({ role: 'ADMIN' })
        .where(eq(members.userId, varun.id));

      return NextResponse.json({
        success: true,
        message: 'Updated Varun to ADMIN',
        userId: varun.id,
        userEmail: varun.email,
        previousRole: existingMembership[0].role,
        newRole: 'ADMIN',
        workspaceId: existingMembership[0].workspaceId
      });
    }

  } catch (error) {
    console.error('Error fixing admin:', error);
    return NextResponse.json({ 
      error: 'Failed to fix admin role', 
      details: String(error) 
    }, { status: 500 });
  }
}
