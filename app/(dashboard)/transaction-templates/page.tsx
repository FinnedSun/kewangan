"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle
} from "@/components/ui/card"
import { useNewTransactionTemplate } from "@/features/transaction-templates/hooks/use-new-transaction-template"
import { Loader2, Plus } from "lucide-react"
import { columns } from "./columns"
import { DataTable } from "@/components/data-table"
import { useGetTransactionTemplates } from "@/features/transaction-templates/api/use-get-transaction-templates"
import { Skeleton } from "@/components/ui/skeleton"
import { useBulkDeleteTransactionTemplates } from "@/features/transaction-templates/api/use-bulk-delete-transaction-templates"

const TransactionTemplatesPage = () => {
  const newTemplate = useNewTransactionTemplate()
  const deleteTemplates = useBulkDeleteTransactionTemplates()
  const templatesQuery = useGetTransactionTemplates()
  const templates = templatesQuery.data || []

  const isDisabled = templatesQuery.isLoading || deleteTemplates.isPending

  if (templatesQuery.isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
        <Card className="border-none drop-shadow-sm">
          <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-32" />
          </CardHeader>
          <CardContent>
            <div className="h-[500px] w-full flex items-center justify-center">
              <Loader2 className="size-6 text-slate-300 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">
            Template Transaksi
          </CardTitle>
          <Button size="sm" onClick={newTemplate.onOpen}>
            <Plus className="size-4 mr-2" />
            Add new
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            onDelete={(row) => {
              const ids = row.map((r) => r.original.id)
              deleteTemplates.mutate({ ids })
            }}
            filterKey="name"
            columns={columns}
            data={templates}
            disabled={isDisabled}
          />
        </CardContent>
      </Card>
    </div>
  )
}
export default TransactionTemplatesPage
