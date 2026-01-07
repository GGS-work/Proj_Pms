import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { useCurrent } from "@/features/auth/api/use-current";

export const useGetNotifications = () => {
  const { data: user } = useCurrent();
  
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await client.api.notifications.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const { data } = await response.json();
      return data;
    },
    refetchInterval: 60000, // Refetch every 60 seconds (reduced frequency)
    enabled: !!user, // Only fetch when user is authenticated
    staleTime: 30000, // Consider data fresh for 30 seconds to reduce flickering
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: 1, // Only retry once on failure
    refetchOnWindowFocus: false, // Prevent refetch on tab focus
    refetchOnMount: false, // Don't refetch on component mount
    refetchOnReconnect: false, // Don't refetch on reconnect
  });

  return query;
};

export const useGetUnreadCount = () => {
  const { data: notifications = [] } = useGetNotifications();
  const unreadCount = notifications.filter((n: any) => n.isRead === "false").length;
  return unreadCount;
};
