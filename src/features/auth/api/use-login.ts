import { toast } from "sonner";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<(typeof client.api.auth.login)["$post"]>;
type RequestType = InferRequestType<(typeof client.api.auth.login)["$post"]>;

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.auth.login.$post({ json });
      
      if (!response.ok) {
        // Check content type to determine if response is JSON or HTML
        const contentType = response.headers.get("content-type");
        
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          throw new Error("error" in errorData ? errorData.error : "Invalid credentials");
        } else {
          // Server returned HTML (likely 500 error page)
          const text = await response.text();
          console.error("Server error response:", text.substring(0, 200));
          throw new Error("Server error. Please check if the database is running and try again.");
        }
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Logged in successfully");
      router.refresh();
      queryClient.invalidateQueries({ queryKey: ["current"] });
      queryClient.invalidateQueries({ queryKey: ["current-user-role"] });
    },
    onError: (error) => {
      toast.error(error.message || "Invalid credentials");
    },
  });

  return mutation;
};
