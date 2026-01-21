export enum MemberRole {
  ADMIN = "ADMIN",
  EMPLOYEE = "EMPLOYEE",
  // MEMBER = "MEMBER", // Reserved for future use
  // PROJECT_MANAGER = "PROJECT_MANAGER", // Reserved for future use
  // TEAM_LEAD = "TEAM_LEAD", // Reserved for future use
  // MANAGEMENT = "MANAGEMENT", // Reserved for future use
  // CLIENT = "CLIENT", // View-only access to specific project - Reserved for future use
}

export type Member = {
  id: string;
  workspaceId: string;
  userId: string;
  role: MemberRole;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  projectId?: string | null; // For CLIENT role - scoped to specific project
};
