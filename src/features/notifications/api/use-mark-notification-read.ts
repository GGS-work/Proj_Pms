import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (notificationId: string) => {
      console.log('[Mark Read API] Starting request for:', notificationId);
      
      // Call Next.js API route instead of Hono route to avoid serialization issues
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        credentials: 'include',
      });

      console.log('[Mark Read API] Response status:', response.status);
      if (!response.ok) {
        const error = await response.json();
        console.error('[Mark Read API] Error response:', error);
        throw new Error(error.error || "Failed to mark notification as read");
      }

      const result = await response.json();
      console.log('[Mark Read API] Success:', result);
      return result;
    },
    // Optimistic update - update cache immediately without refetching
    onMutate: async (notificationId) => {
      console.log('[Mark Read] onMutate - Optimistically updating for:', notificationId);
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      
      // Snapshot previous value
      const previousNotifications = queryClient.getQueryData(["notifications"]);
      console.log('[Mark Read] Previous notifications count:', (previousNotifications as any)?.length);
      
      // Optimistically update
      queryClient.setQueryData(["notifications"], (old: any) => {
        if (!old) return old;
        const updated = old.map((notification: any) =>
          notification.id === notificationId
            ? { ...notification, isRead: "true", readAt: new Date() }
            : notification
        );
        const unreadBefore = old.filter((n: any) => n.isRead === "false").length;
        const unreadAfter = updated.filter((n: any) => n.isRead === "false").length;
        console.log('[Mark Read] Unread count:', unreadBefore, '→', unreadAfter);
        return updated;
      });
      
      return { previousNotifications };
    },
    // Rollback on error
    onError: (err, notificationId, context: any) => {
      console.error('[Mark Read] Error occurred:', err);
      if (context?.previousNotifications) {
        queryClient.setQueryData(["notifications"], context.previousNotifications);
      }
    },
    // Don't refetch - trust the optimistic update
    onSettled: () => {
      console.log('[Mark Read] onSettled - Will invalidate in 2 seconds');
      // Only refetch after 2 seconds to avoid flickering
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }, 2000);
    },
  });

  return mutation;
};
