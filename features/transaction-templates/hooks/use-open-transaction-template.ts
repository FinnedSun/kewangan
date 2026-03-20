import { create } from "zustand"

type OpenTransactionTemplateState = {
    id?: string
    isOpen: boolean
    onOpen: (id: string) => void
    onClose: () => void
}

export const useOpenTransactionTemplate = create<OpenTransactionTemplateState>((set) => ({
    id: undefined,
    isOpen: false,
    onOpen: (id: string) => set({ isOpen: true, id }),
    onClose: () => set({ isOpen: false, id: undefined }),
}))
