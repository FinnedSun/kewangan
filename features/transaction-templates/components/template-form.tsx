import { z } from "zod"
import { Trash } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { insertTransactionTemplateSchema } from "@/db/schema"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { AmountInput } from "@/components/amount-input"
import { convertAmountToMiliunits } from "@/lib/utils"

const formSchema = z.object({
  name: z.string().min(1, "Nama template diperlukan"),
  accountId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  payee: z.string().min(1, "Penerima/Pembayaran diperlukan"),
  amount: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

const apiSchema = insertTransactionTemplateSchema.omit({
  id: true,
  userId: true,
})

type FormValues = z.input<typeof formSchema>
type ApiFormValues = z.input<typeof apiSchema>

type Props = {
  id?: string
  defaultValues?: FormValues
  onSubmit: (values: ApiFormValues) => void
  onDelete?: () => void
  disabled?: boolean
  accountOptions: { label: string, value: string }[]
  categoryOptions: { label: string, value: string }[]
  onCreateAccount: (name: string) => void | Promise<any>
  onCreateCategory: (name: string) => void | Promise<any>
}

export const TemplateForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
  accountOptions,
  categoryOptions,
  onCreateAccount,
  onCreateCategory
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      name: "",
      accountId: "",
      categoryId: "",
      payee: "",
      amount: "",
      notes: ""
    }
  })

  const handleSubmit = (values: FormValues) => {
    let amountInMiliunits = undefined
    if (values.amount) {
      const parsedAmount = parseFloat(values.amount)
      amountInMiliunits = convertAmountToMiliunits(parsedAmount)
    }

    onSubmit({
      ...values,
      amount: amountInMiliunits,
    })
  }

  const handleDelete = () => {
    onDelete?.()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 pt-4"
      >
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nama Template
              </FormLabel>
              <FormControl>
                <Input
                  disabled={disabled}
                  placeholder="Misal: Makan Siang, Bensin..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="accountId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Akun (Opsional)
              </FormLabel>
              <FormControl>
                <Select
                  placeholder="Pilih akun"
                  options={accountOptions}
                  onCreate={onCreateAccount}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="categoryId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Kategori (Opsional)
              </FormLabel>
              <FormControl>
                <Select
                  placeholder="Pilih kategori"
                  options={categoryOptions}
                  onCreate={onCreateCategory}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="payee"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Pembayaran
              </FormLabel>
              <FormControl>
                <Input
                  disabled={disabled}
                  placeholder="Tambahkan pembayaran"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="amount"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Jumlah (Opsional)
              </FormLabel>
              <FormControl>
                <AmountInput
                  {...field}
                  value={field.value ?? ""}
                  disabled={disabled}
                  placeholder="0.00"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="notes"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Catatan (Opsional)
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  disabled={disabled}
                  placeholder="Catatan opsional"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" disabled={disabled}>
          {id ? "Simpan Perubahan" : "Buat Template"}
        </Button>
        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={handleDelete}
            className="w-full"
            variant={"outline"}
          >
            <Trash className="size-4 mr-2" />
            Hapus template
          </Button>
        )}
      </form>
    </Form>
  )
}
