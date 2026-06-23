import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Plus, Pencil, Trash2, Tag, Copy, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
} from '@/services/products';
import type { Json } from '@/types/supabase';
import { useAdminPromos } from '@/hooks/useSupabaseQuery';
import type { Database } from '@/types/supabase';

type PromoRow = Database['public']['Tables']['promo_codes']['Row'];

const emptyForm = {
  code: '',
  description: '',
  type: 'percentage' as 'percentage' | 'override',
  discount_percent: 0,
  product_ids: '' ,
  min_quantity: null as number | null,
  is_active: true,
  valid_from: '',
  valid_until: '',
  max_uses: null as number | null,
};

export function PromosTab() {
  const { data: promos = [], isLoading: loading, error: loadError, refetch: loadPromos } = useAdminPromos();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  function openCreate() {
    setEditingPromo(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(promo: PromoRow) {
    setEditingPromo(promo);
    setForm({
      code: promo.code,
      description: promo.description || '',
      type: promo.type,
      discount_percent: promo.discount_percent,
      product_ids: promo.product_ids ? (promo.product_ids as number[]).join(', ') : '',
      min_quantity: promo.min_quantity,
      is_active: promo.is_active,
      valid_from: promo.valid_from ? promo.valid_from.slice(0, 16) : '',
      valid_until: promo.valid_until ? promo.valid_until.slice(0, 16) : '',
      max_uses: promo.max_uses,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.code) {
      toast.error('Kode promo wajib diisi');
      return;
    }

    const productIds = form.product_ids.trim()
      ? form.product_ids.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n))
      : null;

    const payload = {
      code: form.code.toUpperCase(),
      description: form.description,
      type: form.type,
      discount_percent: form.discount_percent,
      product_ids: productIds as Json,
      min_quantity: form.min_quantity,
      is_active: form.is_active,
      valid_from: form.valid_from ? new Date(form.valid_from).toISOString() : null,
      valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
      max_uses: form.max_uses,
    };

    setSaving(true);
    try {
      if (editingPromo) {
        await updatePromoCode(editingPromo.id, payload);
        toast.success('Promo berhasil diperbarui');
      } else {
        await createPromoCode(payload);
        toast.success('Promo berhasil ditambahkan');
      }
      setDialogOpen(false);
      loadPromos();
    } catch (err: unknown) {
      toast.error('Gagal menyimpan: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await deletePromoCode(id);
      toast.success('Promo berhasil dihapus');
      setConfirmDeleteId(null);
      loadPromos();
    } catch (err: unknown) {
      toast.error('Gagal menghapus: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleActive(promo: PromoRow) {
    try {
      await updatePromoCode(promo.id, { is_active: !promo.is_active });
      loadPromos();
    } catch (err: unknown) {
      toast.error('Gagal mengubah status: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  function isExpired(promo: PromoRow) {
    if (!promo.valid_until) return false;
    return new Date(promo.valid_until) < new Date();
  }

  function isMaxed(promo: PromoRow) {
    if (!promo.max_uses) return false;
    return promo.current_uses >= promo.max_uses;
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    toast.success(`Kode "${code}" disalin`);
  }

  function formatDate(d: string | null) {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="text-center py-12 space-y-3">
        <AlertCircle className="w-8 h-8 mx-auto text-red-400" />
        <p className="text-sm text-gray-500">Gagal memuat promo. Periksa koneksi Anda.</p>
        <Button size="sm" variant="outline" onClick={() => loadPromos()}>Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Kelola Promo</h2>
          <p className="text-xs text-gray-500">{promos.length} kode promo</p>
        </div>
        <Button size="sm" onClick={openCreate} className="bg-[#FF5E01] hover:bg-[#e55500]">
          <Plus className="w-4 h-4 mr-1" /> Tambah Promo
        </Button>
      </div>

      {/* Promo List */}
      <div className="space-y-2">
        {promos.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Tag className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Belum ada kode promo</p>
          </div>
        ) : (
          promos.map(promo => (
            <div
              key={promo.id}
              className={`bg-white border rounded-lg p-3 ${!promo.is_active || isExpired(promo) || isMaxed(promo) ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center gap-3">
                {/* Code */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-bold text-[#FF5E01] bg-orange-50 px-2 py-0.5 rounded">
                      {promo.code}
                    </code>
                    <button onClick={() => copyCode(promo.code)} className="text-gray-400 hover:text-gray-600">
                      <Copy className="w-3 h-3" />
                    </button>
                    {promo.type === 'percentage' && (
                      <Badge variant="secondary" className="text-[10px] h-4">{promo.discount_percent}%</Badge>
                    )}
                    {promo.type === 'override' && (
                      <Badge variant="secondary" className="text-[10px] h-4">Override</Badge>
                    )}
                    {isExpired(promo) && <Badge variant="outline" className="text-[10px] h-4 text-red-500">Expired</Badge>}
                    {isMaxed(promo) && <Badge variant="outline" className="text-[10px] h-4 text-yellow-600">Limit</Badge>}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {promo.description && <span>{promo.description} · </span>}
                    <span>{formatDate(promo.valid_from)} — {formatDate(promo.valid_until)}</span>
                    {promo.max_uses && <span> · {promo.current_uses}/{promo.max_uses} used</span>}
                    {promo.min_quantity && <span> · Min {promo.min_quantity} item</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Switch
                    checked={promo.is_active}
                    onCheckedChange={() => handleToggleActive(promo)}
                    className="scale-75"
                  />
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(promo)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  {confirmDeleteId === promo.id ? (
                    <div className="flex gap-1">
                      <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleDelete(promo.id)} disabled={deletingId === promo.id}>
                        {deletingId === promo.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Ya'}
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setConfirmDeleteId(null)}>Batal</Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500" onClick={() => setConfirmDeleteId(promo.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto overflow-x-hidden scrollbar-hide">
          <DialogHeader>
            <DialogTitle>{editingPromo ? 'Edit Promo' : 'Tambah Promo'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Kode *</Label>
                <Input
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="DISCOUNT10"
                  className="mt-1 font-mono"
                />
              </div>
              <div>
                <Label className="text-xs">Tipe</Label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as 'percentage' | 'override' }))}
                  className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="percentage">Persentase</option>
                  <option value="override">Override Harga</option>
                </select>
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Deskripsi</Label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Diskon HUT..." className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Diskon (%)</Label>
                <Input type="number" min="0" max="100" value={form.discount_percent} onChange={e => setForm(f => ({ ...f, discount_percent: Number(e.target.value) }))} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Min Quantity</Label>
                <Input type="number" value={form.min_quantity ?? ''} onChange={e => setForm(f => ({ ...f, min_quantity: e.target.value ? Number(e.target.value) : null }))} placeholder="Opsional" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Berlaku Dari</Label>
                <Input type="datetime-local" value={form.valid_from} onChange={e => setForm(f => ({ ...f, valid_from: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Berlaku Hingga</Label>
                <Input type="datetime-local" value={form.valid_until} onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Maks Penggunaan</Label>
                <Input type="number" value={form.max_uses ?? ''} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value ? Number(e.target.value) : null }))} placeholder="Unlimited" className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Product IDs (pisahkan koma)</Label>
                <Input value={form.product_ids} onChange={e => setForm(f => ({ ...f, product_ids: e.target.value }))} placeholder="1, 2, 3 — kosongkan untuk semua" className="mt-1" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} className="scale-75" />
              Aktif
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-[#FF5E01] hover:bg-[#e55500]">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Menyimpan...</> : 'Simpan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
