import { create } from "zustand"

type NewTransactionTemplateState = {
    isOpen: boolean
    onOpen: () => void
    onClose: () => void
}

export const useNewTransactionTemplate = create<NewTransactionTemplateState>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}))
