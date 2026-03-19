import { z } from "zod"
import { Trash } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { DatePicker } from "@/components/date-picker"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { insertTransactionSchema } from "@/db/schema"
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
import { ReceiptScanner } from "./receipt-scanner"

const formSchema = z.object({
  date: z.coerce.date(),
  accountId: z.string(),
  categoryId: z.string().nullable().optional(),
  payee: z.string(),
  amount: z.string(),
  notes: z.string().nullable().optional(),
})

const apiSchema = insertTransactionSchema.omit({
  id: true,
})

type FormValues = z.input<typeof formSchema>
type ApiFormValues = z.input<typeof apiSchema>

type Props = {
  id?: string
  defalutValues?: FormValues
  onSubmit: (values: ApiFormValues) => void
  onDelete?: () => void
  disabled?: boolean
  accountOptions: { label: string, value: string }[]
  categoryOptions: { label: string, value: string }[]
  onCreateAccount: (name: string) => void | Promise<any>
  onCreateCategory: (name: string) => void | Promise<any>
}

export const TransactionForm = ({
  id,
  defalutValues,
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
    defaultValues: defalutValues
  })

  const handleSubmit = (values: FormValues) => {
    const amount = parseFloat(values.amount)
    const amountInMiliunits = convertAmountToMiliunits(amount)


    onSubmit({
      ...values,
      amount: amountInMiliunits,
    })
  }

  const handleDelete = () => {
    onDelete?.()
  }

  const handleScanSuccess = async (data: { amount: string; date: string; payee: string; notes: string; category?: string; account?: string }) => {
    if (data.amount) form.setValue("amount", data.amount);
    if (data.date) {
      const d = new Date(data.date);
      if (!isNaN(d.getTime())) {
        form.setValue("date", d);
      }
    }
    if (data.payee) form.setValue("payee", data.payee);
    if (data.notes) form.setValue("notes", data.notes);

    if (data.category) {
      const existingCategory = categoryOptions.find((c) => c.label.toLowerCase() === data.category!.toLowerCase());
      if (existingCategory) {
        form.setValue("categoryId", existingCategory.value);
      } else {
        const res = await onCreateCategory(data.category);
        if (res && res.data && res.data.id) {
          form.setValue("categoryId", res.data.id);
        }
      }
    }

    if (data.account) {
      const existingAccount = accountOptions.find((a) => a.label.toLowerCase() === data.account!.toLowerCase());
      if (existingAccount) {
        form.setValue("accountId", existingAccount.value);
      } else {
        const res = await onCreateAccount(data.account);
        if (res && res.data && res.data.id) {
          form.setValue("accountId", res.data.id);
        }
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 pt-4"
      >
        <ReceiptScanner onScanSuccess={handleScanSuccess} disabled={disabled} />
        <FormField
          name="date"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <DatePicker
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
          name="accountId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Akun
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
                Kategori
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
                Jumlah
              </FormLabel>
              <FormControl>
                <AmountInput
                  {...field}
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
                Catatan
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
          {id ? "Simpan" : "Buat transaksi"}
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
            Hapus transaksi
          </Button>
        )}
      </form>
    </Form>
  )
}