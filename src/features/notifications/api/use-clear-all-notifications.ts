import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/rpc";

export const useClearAllNotifications = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      console.log('[Clear All] Starting mutation');
      const response = await client.api.notifications["clear-all"].$delete();

      console.log('[Clear All] Response status:', response.status, response.ok);

      if (!response.ok) {
        // Try to parse error as JSON, fallback to text
        let errorMessage = "Failed to clear notifications";
        try {
          const errorData = await response.json() as any;
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('[Clear All] Error response:', errorData);
        } catch (parseError) {
          // If JSON parsing fails, try to get text
          try {
            const errorText = await response.text();
            console.error('[Clear All] Error text:', errorText);
            if (errorText) errorMessage = errorText;
          } catch (textError) {
            console.error('[Clear All] Could not parse error');
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json() as any;
      console.log('[Clear All] Success:', result);
      return result;
    },
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      
      // Snapshot previous value
      const previousNotifications = queryClient.getQueryData(["notifications"]);
      
      // Optimistically clear all
      queryClient.setQueryData(["notifications"], []);
      
      return { previousNotifications };
    },
    onSuccess: (data) => {
      console.log('[Clear All] Success');
      toast.success(data.message || "All notifications cleared");
    },
    onError: (error: Error, _, context: any) => {
      console.error('[Clear All] Mutation error:', error);
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(["notifications"], context.previousNotifications);
      }
      toast.error(error.message || "Failed to clear notifications");
    },
    // No need to refetch - we already set empty array
    onSettled: () => {
      // Light refetch after 3 seconds just to be sure
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }, 3000);
    },
  });

  return mutation;
};
