import { useState } from "react"
import { z } from "zod"
import { Trash } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Checkbox } from "@/components/ui/checkbox"

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
  saveAsTemplate: z.boolean().optional(),
  templateName: z.string().optional(),
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
  templates?: { id: string; name: string; payee: string; amount: number | null; accountId: string | null; categoryId: string | null; notes: string | null }[]
  onCreateTemplate?: (name: string, data: ApiFormValues) => void
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
  onCreateCategory,
  templates = [],
  onCreateTemplate,
}: Props) => {
  const [isScanning, setIsScanning] = useState(false);
  const isFormDisabled = disabled || isScanning;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defalutValues
  })

  const handleSubmit = (values: FormValues) => {
    const amount = parseFloat(values.amount)
    const amountInMiliunits = convertAmountToMiliunits(amount)

    const transactionData = {
      date: values.date,
      accountId: values.accountId,
      categoryId: values.categoryId,
      payee: values.payee,
      amount: amountInMiliunits,
      notes: values.notes,
    }

    if (values.saveAsTemplate && values.templateName) {
      onCreateTemplate?.(values.templateName, transactionData)
    }

    onSubmit(transactionData)
  }

  const handleTemplateSelect = (templateId?: string) => {
    if (!templateId) return;
    const t = templates.find((x) => x.id === templateId)
    if (t) {
      if (t.payee) form.setValue("payee", t.payee)
      if (t.amount) form.setValue("amount", t.amount.toString())
      if (t.categoryId) form.setValue("categoryId", t.categoryId)
      if (t.accountId) form.setValue("accountId", t.accountId)
      if (t.notes) form.setValue("notes", t.notes)
    }
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
        {templates.length > 0 && (
          <FormItem>
            <FormLabel>Gunakan Template</FormLabel>
            <FormControl>
              <Select
                placeholder="Pilih template..."
                options={templates.map((t) => ({ label: t.name, value: t.id }))}
                onChange={handleTemplateSelect}
                value=""
                disabled={isFormDisabled}
              />
            </FormControl>
          </FormItem>
        )}
        <ReceiptScanner onScanSuccess={handleScanSuccess} onScanStateChange={setIsScanning} disabled={isFormDisabled} />
        <FormField
          name="date"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isFormDisabled}
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
                  disabled={isFormDisabled}
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
                  disabled={isFormDisabled}
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
                  disabled={isFormDisabled}
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
                  disabled={isFormDisabled}
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
                  disabled={isFormDisabled}
                  placeholder="Catatan opsional"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!id && onCreateTemplate && (
          <div className="space-y-4 border p-4 rounded-md mt-4">
            <FormField
              name="saveAsTemplate"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0 rounded-md">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isFormDisabled}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none ml-3">
                    <FormLabel>Simpan sebagai template</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            {form.watch("saveAsTemplate") && (
              <FormField
                name="templateName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Template</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isFormDisabled}
                        placeholder="Misal: Bensin, Belanja Bulanan..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        )}
        <Button className="w-full" disabled={isFormDisabled}>
          {id ? "Simpan" : "Buat transaksi"}
        </Button>
        {!!id && (
          <Button
            type="button"
            disabled={isFormDisabled}
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