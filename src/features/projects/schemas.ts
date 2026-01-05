import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required."),
  image: z
    .union([
      z.instanceof(File),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
  workspaceId: z.string().optional(), // Made optional for project-centric approach
  postDate: z.string().min(1, "Start date is required."),
  tentativeEndDate: z.string().min(1, "End date is required."),
  assignees: z
    .union([
      z.array(z.string()),
      z.string().transform((val) => {
        if (!val) return [];
        try {
          return JSON.parse(val);
        } catch {
          return [val];
        }
      }),
    ])
    .optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1, "Minimum 1 character required.").optional(),
  image: z
    .union([
      z.instanceof(File),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
});
