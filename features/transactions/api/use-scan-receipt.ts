import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

export interface ScanResponse {
  data?: {
    amount: string;
    date: string;
    payee: string;
    notes: string;
  };
  error?: string;
}

export const useScanReceipt = () => {
  return useMutation<ScanResponse, Error, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("receipt", file);

      const response = await fetch("/api/scan-receipt", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to scan receipt");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Struk berhasil diproses!");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Gagal memproses struk.");
    },
  });
};
