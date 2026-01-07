import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await client.api.notifications[":notificationId"]["read"].$patch({
        param: { notificationId },
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      return await response.json();
    },
    // Optimistic update - update cache immediately without refetching
    onMutate: async (notificationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      
      // Snapshot previous value
      const previousNotifications = queryClient.getQueryData(["notifications"]);
      
      // Optimistically update
      queryClient.setQueryData(["notifications"], (old: any) => {
        if (!old) return old;
        return old.map((notification: any) =>
          notification.id === notificationId
            ? { ...notification, isRead: "true", readAt: new Date() }
            : notification
        );
      });
      
      return { previousNotifications };
    },
    // Rollback on error
    onError: (err, notificationId, context: any) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(["notifications"], context.previousNotifications);
      }
    },
    // Don't refetch - trust the optimistic update
    onSettled: () => {
      // Only refetch after 2 seconds to avoid flickering
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }, 2000);
    },
  });

  return mutation;
};
