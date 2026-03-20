import { toast } from "sonner";
import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono"

type ResponseType = InferResponseType<(typeof client.api)["transaction-templates"][":id"]["$delete"]>

export const useDeleteTransactionTemplate = (id?: string) => {
  const queryClient = useQueryClient()

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api["transaction-templates"][":id"]["$delete"]({
        param: { id },
      })
      return await response.json()
    },
    onSuccess: () => {
      toast.success("Template transaksi dihapus!")
      queryClient.invalidateQueries({ queryKey: ["transaction-template", { id }] })
      queryClient.invalidateQueries({ queryKey: ["transaction-templates"] })
    },
    onError: () => {
      toast.error("Gagal menghapus template.")
    },
  })

  return mutation
}
