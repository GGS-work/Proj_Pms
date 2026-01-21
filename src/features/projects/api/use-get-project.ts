import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetProjectProps {
  projectId: string;
}

export const useGetProject = ({ projectId }: UseGetProjectProps) => {
  // Debug logging
  const isEnabled = !!projectId && projectId !== "skip" && projectId !== "undefined";
  console.log('[useGetProject] Hook called:', { projectId, isEnabled });

  const query = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      console.log('[useGetProject] Fetching project:', projectId);
      const response = await client.api.projects[":projectId"].$get({
        param: { projectId },
      });

      if (!response.ok) {
        console.error('[useGetProject] Fetch failed:', response.status);
        throw new Error("Failed to fetch the project.");
      }

      const { data } = await response.json();
      console.log('[useGetProject] Fetch success:', data);
      return data;
    },
    enabled: isEnabled, // Only fetch if we have a valid projectId
  });

  return query;
};
