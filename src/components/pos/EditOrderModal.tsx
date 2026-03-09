import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Save, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { OrderHistoryItem } from "@/utils/api";

interface EditOrderModalProps {
    order: OrderHistoryItem | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedOrder: any) => Promise<void>;
}

export function EditOrderModal({ order, isOpen, onClose, onSave }: EditOrderModalProps) {
    const [formData, setFormData] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [availableProducts, setAvailableProducts] = useState<any[]>([]);

    useEffect(() => {
        if (order) {
            setFormData(JSON.parse(JSON.stringify(order))); // Deep copy
        }
    }, [order]);

    useEffect(() => {
        // Fetch products
        const fetchProducts = async () => {
            try {
                const res = await fetch('/products.json');
                const data = await res.json();

                // Flatten the categorized products for easy dropdown
                const flatProducts: any[] = [];
                Object.values(data).forEach((categoryProducts: any) => {
                    flatProducts.push(...categoryProducts);
                });

                // Sort alphabetically
                flatProducts.sort((a, b) => a.name.localeCompare(b.name));
                setAvailableProducts(flatProducts);
            } catch (err) {
                console.error("Gagal load produk", err);
            }
        };
        fetchProducts();
    }, []);

    if (!formData || !order) return null;

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };

        // If product select changed, auto update price based on the selected product
        if (field === 'name') {
            const selectedProduct = availableProducts.find(p => p.name === value);
            if (selectedProduct) {
                newItems[index].price = selectedProduct.discountPrice || selectedProduct.price || 0;
                if (!newItems[index].quantity) newItems[index].quantity = 1;
            }
        }

        // Auto calculate subtotal
        if (field === 'price' || field === 'quantity' || field === 'name') {
            newItems[index].subtotal = Number(newItems[index].price) * Number(newItems[index].quantity);
        }

        setFormData((prev: any) => ({ ...prev, items: newItems }));
    };

    const handleRemoveItem = (index: number) => {
        const newItems = formData.items.filter((_: any, i: number) => i !== index);
        setFormData((prev: any) => ({ ...prev, items: newItems }));
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);

            // Recalculate totals
            const newSubtotal = formData.items.reduce((acc: number, item: any) => acc + (Number(item.subtotal) || 0), 0);
            const newTotal = newSubtotal - (formData.discount || 0);
            const newRemaining = newTotal - (formData.downPayment || 0);

            const payload = {
                ...formData,
                phoneNumber: formData.customerPhone || '', // Explicitly map to phoneNumber expected by Apps Script
                subtotal: newSubtotal,
                total: newTotal,
                remainingBalance: newRemaining > 0 ? newRemaining : 0,
                orderStatus: formData.downPayment > 0 && formData.downPayment < newTotal ? 'partial' : 'done',
                isEdit: true,
                receiptId: order.orderId
            };

            await onSave(payload);
            toast.success("Pesanan berhasil diperbarui!");
            onClose();
        } catch (err) {
            console.error(err);
            alert("Gagal menyimpan perubahan");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Pesanan {order.orderId}</DialogTitle>
                    <DialogDescription>
                        Ubah data pelanggan, status pembayaran, atau detail barang di pesanan ini.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600">Nama Pelanggan</label>
                            <Input value={formData.customerName || ''} onChange={e => handleChange('customerName', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600">No. WhatsApp</label>
                            <Input value={formData.customerPhone || ''} onChange={e => handleChange('customerPhone', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600">Instansi</label>
                            <Input value={formData.institution || ''} onChange={e => handleChange('institution', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600">Deadline</label>
                            <Input type="datetime-local" value={formData.deadline ? String(formData.deadline).substring(0, 16) : ''} onChange={e => handleChange('deadline', e.target.value)} />
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 px-3 py-2 text-xs font-bold text-gray-600 border-b">Detail Item</div>
                        <div className="p-3 space-y-3 bg-gray-50/50">
                            {formData.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:items-center bg-white p-2 rounded border sm:border-transparent sm:bg-transparent">
                                    <div className="w-full sm:w-1/3 flex flex-col gap-1">
                                        <label className="text-[10px] sm:hidden font-semibold text-gray-500">Nama Produk</label>
                                        <div className="flex flex-col gap-1 w-full">
                                            <Input
                                                list={`products-list-${idx}`}
                                                className="w-full text-sm bg-white"
                                                value={item.name}
                                                onChange={e => handleItemChange(idx, 'name', e.target.value)}
                                                placeholder="Cari atau Ketik Produk..."
                                            />
                                            <datalist id={`products-list-${idx}`}>
                                                {availableProducts.map(p => (
                                                    <option key={p.id} value={p.name} />
                                                ))}
                                            </datalist>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 justify-between sm:justify-start w-full sm:w-auto">
                                        <div className="flex items-center gap-2">
                                            <Input className="w-16 h-8 text-sm px-2 text-center" type="number" min="1" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} placeholder="Qty" />
                                            <div className="text-sm font-semibold text-gray-400">×</div>
                                        </div>
                                        <Input className="w-28 h-8 text-sm" type="number" value={item.price} onChange={e => handleItemChange(idx, 'price', e.target.value)} placeholder="Harga" />
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end w-full sm:flex-1 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-none">
                                        <div className="text-sm font-bold text-gray-800">= Rp {(Number(item.price) * Number(item.quantity)).toLocaleString('id-ID')}</div>
                                        <Button variant="ghost" size="sm" className="text-red-500 h-8 w-8 p-0 shrink-0 ml-2 bg-red-50 sm:bg-transparent hover:bg-red-100" onClick={() => handleRemoveItem(idx)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            <Button variant="outline" size="sm" className="w-full mt-2 border-dashed h-9" onClick={() => {
                                setFormData((prev: any) => ({
                                    ...prev,
                                    items: [...prev.items, { name: 'Pilih Produk', quantity: 1, price: 0, subtotal: 0 }]
                                }));
                            }}>
                                <Plus className="w-4 h-4 mr-2 text-gray-500" /> Tambah Item Lainnya
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600">Diskon (Rp)</label>
                            <Input type="number" value={formData.discount || 0} onChange={e => handleChange('discount', Number(e.target.value))} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600">Uang Muka / Telah Dibayar (Rp)</label>
                            <Input type="number" value={formData.downPayment || 0} onChange={e => handleChange('downPayment', Number(e.target.value))} />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>Batal</Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-[#FF5E01] hover:bg-[#E05301]">
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Simpan Perubahan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
