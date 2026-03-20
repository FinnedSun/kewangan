import { z } from "zod"
import { Loader2 } from "lucide-react"

import { TemplateForm } from "@/features/transaction-templates/components/template-form"
import { useOpenTransactionTemplate } from "@/features/transaction-templates/hooks/use-open-transaction-template"
import { useGetTransactionTemplate } from "@/features/transaction-templates/api/use-get-transaction-template"
import { useEditTransactionTemplate } from "@/features/transaction-templates/api/use-edit-transaction-template"
import { useDeleteTransactionTemplate } from "@/features/transaction-templates/api/use-delete-transaction-template"
import { useCreateCategory } from "@/features/categories/api/use-create-category"
import { useGetCategories } from "@/features/categories/api/use-get-categories"
import { useGetAccouts } from "@/features/accounts/api/use-get-accounts"
import { useCreateAccount } from "@/features/accounts/api/use-create-account"

import { insertTransactionTemplateSchema } from "@/db/schema"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet"
import { useConfirm } from "@/hooks/use-confirm"

const formSchema = insertTransactionTemplateSchema.omit({
  id: true,
  userId: true,
})

type FormValues = z.input<typeof formSchema>

export const EditTemplateSheet = () => {
  const { isOpen, onClose, id } = useOpenTransactionTemplate()
  const [ConfirmDialog, confirm] = useConfirm(
    "Apakah kamu yakin?",
    "Kamu mau menghapus template ini."
  )

  const templateQuery = useGetTransactionTemplate(id)
  const editMutation = useEditTransactionTemplate(id)
  const deleteMutation = useDeleteTransactionTemplate(id)

  const categoryQuery = useGetCategories()
  const categoryMutation = useCreateCategory()
  const onCreateCategory = (name: string) => categoryMutation.mutateAsync({ name })
  const categoryOptions = (categoryQuery.data ?? []).map((category) => ({
    label: category.name,
    value: category.id
  }))

  const accountQuery = useGetAccouts()
  const accountMutation = useCreateAccount()
  const onCreateAccount = (name: string) => accountMutation.mutateAsync({ name })
  const accountOptions = (accountQuery.data ?? []).map((account) => ({
    label: account.name,
    value: account.id
  }))

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    categoryMutation.isPending ||
    accountMutation.isPending

  const isLoading =
    templateQuery.isLoading ||
    categoryQuery.isLoading ||
    accountQuery.isLoading

  const onSubmit = (values: FormValues) => {
    editMutation.mutate(values, {
      onSuccess: () => {
        onClose()
      }
    })
  }

  const onDelete = async () => {
    const ok = await confirm()

    if (ok) {
      deleteMutation.mutate(undefined, {
        onSuccess: () => {
          onClose()
        }
      })
    }
  }

  const defaultValues = templateQuery.data ? {
    name: templateQuery.data.name,
    accountId: templateQuery.data.accountId ?? "",
    categoryId: templateQuery.data.categoryId ?? "",
    payee: templateQuery.data.payee,
    amount: templateQuery.data.amount ? templateQuery.data.amount.toString() : "",
    notes: templateQuery.data.notes ?? "",
  } : {
    name: "",
    accountId: "",
    categoryId: "",
    amount: "",
    payee: "",
    notes: "",
  }

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4">
          <SheetHeader>
            <SheetTitle>
              Edit Template
            </SheetTitle>
            <SheetDescription>
              Ubah detail template transaksi yang sudah ada.
            </SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <TemplateForm
              id={id}
              defaultValues={defaultValues}
              onSubmit={onSubmit}
              disabled={isPending}
              onDelete={onDelete}
              categoryOptions={categoryOptions}
              onCreateCategory={onCreateCategory}
              accountOptions={accountOptions}
              onCreateAccount={onCreateAccount}
            />
          )}

        </SheetContent>
      </Sheet>
    </>
  )
}
