import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono"

type ResponseType = InferResponseType<(typeof client.api)["transaction-templates"][":id"]["$patch"]>
type RequestType = InferRequestType<(typeof client.api)["transaction-templates"][":id"]["$patch"]>["json"]

export const useEditTransactionTemplate = (id?: string) => {
  const queryClient = useQueryClient()

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api["transaction-templates"][":id"]["$patch"]({
        param: { id },
        json,
      })
      return await response.json()
    },
    onSuccess: () => {
      toast.success("Template transaksi diubah!")
      queryClient.invalidateQueries({ queryKey: ["transaction-template", { id }] })
      queryClient.invalidateQueries({ queryKey: ["transaction-templates"] })
    },
    onError: () => {
      toast.error("Gagal mengubah template.")
    },
  })

  return mutation
}
