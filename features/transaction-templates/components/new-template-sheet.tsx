import { z } from "zod"

import { TemplateForm } from "@/features/transaction-templates/components/template-form"
import { useNewTransactionTemplate } from "@/features/transaction-templates/hooks/use-new-transaction-template"
import { useCreateTransactionTemplate } from "@/features/transaction-templates/api/use-create-transaction-template"

import { insertTransactionTemplateSchema } from "@/db/schema"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet"
import { useCreateCategory } from "@/features/categories/api/use-create-category"
import { useGetCategories } from "@/features/categories/api/use-get-categories"
import { useGetAccouts } from "@/features/accounts/api/use-get-accounts"
import { useCreateAccount } from "@/features/accounts/api/use-create-account"
import { Loader2 } from "lucide-react"

const formSchema = insertTransactionTemplateSchema.omit({
  id: true,
  userId: true,
})

type FormValues = z.input<typeof formSchema>

export const NewTemplateSheet = () => {
  const { isOpen, onClose } = useNewTransactionTemplate()

  const createMutation = useCreateTransactionTemplate()

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
    createMutation.isPending ||
    categoryMutation.isPending ||
    accountMutation.isPending

  const isLoading =
    categoryQuery.isLoading ||
    accountQuery.isLoading

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        onClose()
      }
    })
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>
            Template baru
          </SheetTitle>
          <SheetDescription>
            Buat template transaksi baru untuk mempermudah pencatatan.
          </SheetDescription>
        </SheetHeader>
        {isLoading
          ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="animate-spin size-4 text-muted-foreground" />
            </div>
          )
          : (
            <TemplateForm
              onSubmit={onSubmit}
              disabled={isPending}
              categoryOptions={categoryOptions}
              onCreateCategory={onCreateCategory}
              accountOptions={accountOptions}
              onCreateAccount={onCreateAccount}
              defaultValues={{
                name: "",
                accountId: "",
                categoryId: "",
                amount: "",
                payee: "",
                notes: "",
              }}
            />
          )
        }
      </SheetContent>
    </Sheet>
  )
}
