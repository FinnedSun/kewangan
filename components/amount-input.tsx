import CurrencyInput from "react-currency-input-field"
import {
  Info,
  MinusSquare,
  PlusCircle
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

type Props = {
  value: string,
  onChange: (value: string | undefined) => void
  placeholder?: string
  disabled?: boolean
}

export const AmountInput = ({
  value,
  onChange,
  placeholder,
  disabled,
}: Props) => {
  const parsedValue = parseFloat(value)
  const isIncome = parsedValue > 0
  const isExpanse = parsedValue < 0

  const onReverseValue = () => {
    if (!value) return
    const newValue = parseFloat(value) * -1
    onChange(newValue.toString())
  }

  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onReverseValue}
              className={cn(
                "bg-slate-400 hover:bg-slate-500 absolute top-1.5 left-1.5 rounded-md p-2 flex items-center justify-center transition",
                isIncome && "bg-emerald-500 hover:bg-emerald-600",
                isExpanse && "bg-rose-500 hover:bg-rose-600"
              )}
            >
              {!parsedValue && <Info className="size-3 text-white" />}
              {isIncome && <PlusCircle className="size-3 text-white" />}
              {isExpanse && <MinusSquare className="size-3 text-white" />}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            Gunakan [+] untuk pemasukan [-] untuk pengeluaran
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <CurrencyInput
        prefix="Rp."
        className="pl-10 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        placeholder={placeholder}
        value={value}
        allowDecimals={false}
        decimalSeparator=","
        groupSeparator="."
        onValueChange={onChange}
        disabled={disabled}
      />
      <p className="text-sm text-muted-foreground mt-2">
        {isIncome && "Ini akan dihitung sebagai pemasukan"}
        {isExpanse && "Ini akan dihitung sebagai pengeluaran"}
      </p>
    </div>
  )
}