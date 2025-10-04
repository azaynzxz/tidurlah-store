import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface DeliveryInfo {
  recipientName: string;
  recipientPhone: string;
  address: string;
}

interface DeliveryInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (deliveryInfo: DeliveryInfo) => void;
  onCancel: () => void;
}

export function DeliveryInfoDialog({ open, onOpenChange, onSubmit, onCancel }: DeliveryInfoDialogProps) {
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    recipientName: '',
    recipientPhone: '',
    address: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deliveryInfo.recipientName.trim() || !deliveryInfo.recipientPhone.trim() || !deliveryInfo.address.trim()) {
      return;
    }

    onSubmit(deliveryInfo);
    
    // Reset form
    setDeliveryInfo({
      recipientName: '',
      recipientPhone: '',
      address: ''
    });
  };

  const handleCancel = () => {
    // Reset form
    setDeliveryInfo({
      recipientName: '',
      recipientPhone: '',
      address: ''
    });
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">
            Informasi Pengiriman
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="recipient-name" className="text-sm font-medium text-gray-700">
              Nama Penerima *
            </Label>
            <Input
              id="recipient-name"
              type="text"
              placeholder="Nama lengkap penerima"
              value={deliveryInfo.recipientName}
              onChange={(e) => setDeliveryInfo(prev => ({ ...prev, recipientName: e.target.value }))}
              className="mt-1 border-[#FF5E01] focus:border-[#FF5E01] focus:ring-[#FF5E01]"
              required
            />
          </div>

          <div>
            <Label htmlFor="recipient-phone" className="text-sm font-medium text-gray-700">
              Nomor Telepon Penerima *
            </Label>
            <Input
              id="recipient-phone"
              type="tel"
              placeholder="Nomor telepon penerima"
              value={deliveryInfo.recipientPhone}
              onChange={(e) => setDeliveryInfo(prev => ({ ...prev, recipientPhone: e.target.value }))}
              className="mt-1 border-[#FF5E01] focus:border-[#FF5E01] focus:ring-[#FF5E01]"
              required
            />
          </div>

          <div>
            <Label htmlFor="address" className="text-sm font-medium text-gray-700">
              Alamat Lengkap *
            </Label>
            <Textarea
              id="address"
              placeholder="Alamat lengkap pengiriman (jalan, nomor, kelurahan, kecamatan, kota)"
              value={deliveryInfo.address}
              onChange={(e) => setDeliveryInfo(prev => ({ ...prev, address: e.target.value }))}
              className="mt-1 border-[#FF5E01] focus:border-[#FF5E01] focus:ring-[#FF5E01] min-h-[80px]"
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#FF5E01] hover:bg-[#e54d00] text-white"
              disabled={!deliveryInfo.recipientName.trim() || !deliveryInfo.recipientPhone.trim() || !deliveryInfo.address.trim()}
            >
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
