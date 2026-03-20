'use client'

import { useOpenTransactionTemplate } from "@/features/transaction-templates/hooks/use-open-transaction-template"

import { Edit, MoreHorizontal, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useDeleteTransactionTemplate } from "@/features/transaction-templates/api/use-delete-transaction-template"
import { useConfirm } from "@/hooks/use-confirm"

type Props = {
  id: string
}

export const Actions = ({
  id
}: Props) => {
  const [ConfirmDialog, confirm] = useConfirm(
    "Apa kamu yakin?",
    "Kamu akan menghapus template transaksi ini."
  )
  const deleteMutation = useDeleteTransactionTemplate(id)
  const { onOpen } = useOpenTransactionTemplate()

  const handleDelete = async () => {
    const ok = await confirm()

    if (ok) {
      deleteMutation.mutate()
    }
  }

  return (
    <>
      <ConfirmDialog />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="size-8 p-0" variant={"ghost"}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            disabled={deleteMutation.isPending}
            onClick={() => onOpen(id)}
          >
            <Edit className="size-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={deleteMutation.isPending}
            onClick={handleDelete}
          >
            <Trash className="size-4 mr-2" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
