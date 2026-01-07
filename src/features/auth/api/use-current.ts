import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

export const useCurrent = () => {
  const query = useQuery({
    queryKey: ["current"],
    queryFn: async () => {
      try {
        const response = await client.api.auth.current.$get();

        if (!response.ok) {
          // Return null for 401 (unauthenticated), but throw for other errors
          if (response.status === 401) {
            return null;
          }
          throw new Error(`Auth check failed: ${response.status}`);
        }

        const { data } = await response.json();
        return data;
      } catch (error) {
        // Network errors or server errors should return null in auth context
        console.warn('[useCurrent] Auth check error:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - aggressive caching to prevent flickering
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    retry: false, // Don't retry auth checks to prevent loops
    refetchOnWindowFocus: false, // Prevent refetch on tab focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
    refetchOnReconnect: false, // Don't refetch on network reconnect
  });

  return query;
};
