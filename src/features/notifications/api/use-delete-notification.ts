import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await client.api.notifications[":notificationId"].$delete({
        param: { notificationId },
      });

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }

      return await response.json();
    },
    onMutate: async (notificationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      
      // Snapshot previous value
      const previousNotifications = queryClient.getQueryData(["notifications"]);
      
      // Optimistically remove notification
      queryClient.setQueryData(["notifications"], (old: any) => {
        if (!old) return old;
        return old.filter((notification: any) => notification.id !== notificationId);
      });
      
      return { previousNotifications };
    },
    onError: (err, notificationId, context: any) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(["notifications"], context.previousNotifications);
      }
    },
    onSettled: () => {
      // Delayed refetch to avoid flickering
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }, 2000);
    },
  });

  return mutation;
};
