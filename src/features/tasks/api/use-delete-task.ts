import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ param }: { param: { taskId: string } }) => {
      const response = await fetch(`/api/tasks/${param.taskId}/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete task");
      }

      return await response.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Task deleted.");
      
      // Optimized: Remove from cache and update lists directly
      queryClient.removeQueries({ queryKey: ["task", data.id] });
      
      // Optimistically remove from task lists
      queryClient.setQueriesData(
        { queryKey: ["tasks"], exact: false },
        (old: any) => {
          if (!old?.documents) return old;
          return {
            ...old,
            documents: old.documents.filter((task: any) => task.id !== data.id),
            total: Math.max(0, old.total - 1)
          };
        }
      );
      
      // Invalidate all analytics (we don't have projectId/workspaceId from delete response)
      queryClient.invalidateQueries({ 
        queryKey: ["project-analytics"],
        exact: false 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["workspace-analytics"],
        exact: false
      });
    },
    onError: () => {
      toast.error("Failed to delete task.");
    },
  });

  return mutation;
};
