/**
 * Seed Admin User Script
 * Creates a default admin user, workspace, and assigns admin role
 * Run with: node seed-admin-user.js
 */

import { db } from "./src/db/index.js";
import { users, workspaces, members } from "./src/db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const ADMIN_CONFIG = {
  name: "Admin User",
  email: "admin@ggs.com",
  password: "Admin@123",
  designation: "System Administrator",
  department: "IT",
};

const WORKSPACE_CONFIG = {
  name: "GGS Management Workspace",
  inviteCode: randomBytes(8).toString("hex").toUpperCase(),
};

async function seedAdminUser() {
  console.log("🌱 Starting admin user seed...\n");

  try {
    // Check if admin already exists
    console.log("📋 Checking for existing admin user...");
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, ADMIN_CONFIG.email))
      .limit(1);

    if (existingUser.length > 0) {
      console.log("⚠️  Admin user already exists!");
      console.log(`   Email: ${ADMIN_CONFIG.email}`);
      console.log("\n💡 To reset the admin user:");
      console.log("   1. Delete the existing user from database");
      console.log("   2. Run this script again\n");
      process.exit(0);
    }

    // Hash password
    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(ADMIN_CONFIG.password, 10);

    // Create admin user
    console.log("👤 Creating admin user...");
    const [adminUser] = await db
      .insert(users)
      .values({
        name: ADMIN_CONFIG.name,
        email: ADMIN_CONFIG.email,
        password: hashedPassword,
        emailVerified: new Date(),
        designation: ADMIN_CONFIG.designation,
        department: ADMIN_CONFIG.department,
        dateOfJoining: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log("✅ Admin user created successfully!");
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Email: ${adminUser.email}`);

    // Create workspace
    console.log("\n🏢 Creating workspace...");
    const [workspace] = await db
      .insert(workspaces)
      .values({
        name: WORKSPACE_CONFIG.name,
        userId: adminUser.id,
        inviteCode: WORKSPACE_CONFIG.inviteCode,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log("✅ Workspace created successfully!");
    console.log(`   ID: ${workspace.id}`);
    console.log(`   Name: ${workspace.name}`);
    console.log(`   Invite Code: ${workspace.inviteCode}`);

    // Add user as admin member
    console.log("\n👥 Adding user as admin member...");
    const [member] = await db
      .insert(members)
      .values({
        userId: adminUser.id,
        workspaceId: workspace.id,
        role: "ADMIN",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log("✅ Admin member role assigned!");
    console.log(`   Member ID: ${member.id}`);
    console.log(`   Role: ${member.role}`);

    // Display login credentials
    console.log("\n" + "=".repeat(60));
    console.log("🎉 ADMIN USER SETUP COMPLETE!");
    console.log("=".repeat(60));
    console.log("\n📝 Login Credentials:");
    console.log(`   Email:    ${ADMIN_CONFIG.email}`);
    console.log(`   Password: ${ADMIN_CONFIG.password}`);
    console.log("\n🏢 Workspace Details:");
    console.log(`   Name:        ${workspace.name}`);
    console.log(`   Invite Code: ${workspace.inviteCode}`);
    console.log("\n⚠️  IMPORTANT SECURITY NOTES:");
    console.log("   1. Change the admin password immediately after first login");
    console.log("   2. Store the workspace invite code securely");
    console.log("   3. Never commit credentials to version control");
    console.log("\n🚀 You can now login at your application URL");
    console.log("=".repeat(60) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding admin user:");
    console.error(error);
    process.exit(1);
  }
}

// Run the seed function
seedAdminUser();
