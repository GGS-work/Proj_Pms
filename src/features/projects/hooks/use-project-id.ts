import { useParams } from "next/navigation";

export const useProjectId = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  console.log('[useProjectId] Extracted from URL:', { params, projectId });
  return projectId;
};
