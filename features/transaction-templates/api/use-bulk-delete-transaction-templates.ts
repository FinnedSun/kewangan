import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono"

type ResponseType = InferResponseType<(typeof client.api)["transaction-templates"]["bulk-delete"]["$post"]>
type RequestType = InferRequestType<(typeof client.api)["transaction-templates"]["bulk-delete"]["$post"]>["json"]

export const useBulkDeleteTransactionTemplates = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api["transaction-templates"]["bulk-delete"]["$post"]({ json })
      return await response.json()
    },
    onSuccess: () => {
      toast.success("Template transaksi dihapus!")
      queryClient.invalidateQueries({ queryKey: ["transaction-templates"] })
    },
    onError: () => {
      toast.error("Gagal menghapus template transaksi.")
    },
  })

  return mutation
}
