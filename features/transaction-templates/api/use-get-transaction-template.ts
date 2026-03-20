import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono"
import { convertAmountFromMiliunits } from "@/lib/utils";

export const useGetTransactionTemplate = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["transaction-template", { id }],
    queryFn: async () => {
      const response = await client.api["transaction-templates"][":id"].$get({
        param: { id }
      })

      if (!response.ok) {
        throw new Error("Failed to fetch transaction template")
      }

      const { data } = await response.json()
      return {
        ...data,
        amount: data.amount ? convertAmountFromMiliunits(data.amount) : null
      }
    }
  })

  return query
}
