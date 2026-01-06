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
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!user, // Only fetch when user is authenticated
    staleTime: 10000, // Consider data fresh for 10 seconds to reduce flickering
  });

  return query;
};

export const useGetUnreadCount = () => {
  const { data: notifications = [] } = useGetNotifications();
  const unreadCount = notifications.filter((n: any) => n.isRead === "false").length;
  return unreadCount;
};
