import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

export const useCurrent = () => {
  const query = useQuery({
    queryKey: ["current"],
    queryFn: async () => {
      const response = await client.api.auth.current.$get();

      if (!response.ok) {
        return null;
      }

      const { data } = await response.json();

      return data;
    },
    staleTime: 60000, // 1 minute - prevent constant refetching
    retry: 1, // Only retry once on failure
    refetchOnWindowFocus: false, // Prevent refetch on tab focus to reduce flickering
  });

  return query;
};
