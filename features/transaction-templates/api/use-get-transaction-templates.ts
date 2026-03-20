import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono"
import { convertAmountFromMiliunits } from "@/lib/utils";

export const useGetTransactionTemplates = () => {
  const query = useQuery({
    queryKey: ["transaction-templates"],
    queryFn: async () => {
      const response = await client.api["transaction-templates"].$get()

      if (!response.ok) {
        throw new Error("Failed to fetch transaction templates")
      }

      const { data } = await response.json()
      return data.map((template) => ({
        ...template,
        amount: template.amount ? convertAmountFromMiliunits(template.amount) : null
      }))
    }
  })

  return query
}
