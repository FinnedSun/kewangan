import { useRef } from "react";
import { Camera, Image as ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useScanReceipt } from "@/features/transactions/api/use-scan-receipt";

type Props = {
  onScanSuccess: (data: { amount: string; date: string; payee: string; notes: string }) => void;
  disabled?: boolean;
};

export const ReceiptScanner = ({ onScanSuccess, disabled }: Props) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanMutation = useScanReceipt();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      scanMutation.mutate(file, {
        onSuccess: (response) => {
          if (response.data) {
            onScanSuccess(response.data);
          }
        }
      });
      // Clear inputs so the same file can be selected again
      if (cameraInputRef.current) {
        cameraInputRef.current.value = "";
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const isPending = scanMutation.isPending || disabled;

  return (
    <div className="flex items-center gap-x-2 w-full mb-4">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        className="w-full border-dashed border-2"
        onClick={() => cameraInputRef.current?.click()}
      >
        <Camera className="size-4 mr-2" />
        Foto Struk
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        className="w-full border-dashed border-2"
        onClick={() => fileInputRef.current?.click()}
      >
        <ImageIcon className="size-4 mr-2" />
        Upload Image
      </Button>
    </div>
  );
};
