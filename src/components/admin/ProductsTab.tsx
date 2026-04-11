import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Plus, Pencil, Trash2, Search, Package, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/services/products';
import { useAdminProducts } from '@/hooks/useSupabaseQuery';
import type { Database } from '@/types/supabase';

type ProductRow = Database['public']['Tables']['products']['Row'];

const CATEGORIES = [
  'Plakat', 'Papan Bunga', 'Merchandise', 'Banner & Spanduk',
  'Undangan', 'Stiker', 'Packaging', 'Percetakan',
];

const emptyForm = {
  name: '',
  slug: '',
  image: '',
  description: '',
  price: 0,
  discount_price: null as number | null,
  category: 'Plakat',
  time: '',
  rating: 5,
  bestseller: false,
  unit: 'pcs',
  is_available: true,
  is_active: true,
  sort_order: 0,
};

export function ProductsTab() {
  const { data: products = [], isLoading: loading, error: loadError, refetch: loadProducts } = useAdminProducts();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  function openCreate() {
    setEditingProduct(null);
    setForm({ ...emptyForm, sort_order: products.length + 1 });
    setDialogOpen(true);
  }

  function openEdit(product: ProductRow) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      image: product.image,
      description: product.description || '',
      price: product.price,
      discount_price: product.discount_price,
      category: product.category,
      time: product.time || '',
      rating: product.rating,
      bestseller: product.bestseller,
      unit: product.unit || 'pcs',
      is_available: product.is_available,
      is_active: product.is_active,
      sort_order: product.sort_order,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name || !form.slug || !form.category) {
      toast.error('Nama, slug, dan kategori wajib diisi');
      return;
    }
    setSaving(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: form.name,
          slug: form.slug,
          image: form.image,
          description: form.description,
          price: form.price,
          discount_price: form.discount_price,
          category: form.category,
          time: form.time,
          rating: form.rating,
          bestseller: form.bestseller,
          unit: form.unit,
          is_available: form.is_available,
          is_active: form.is_active,
          sort_order: form.sort_order,
        });
        toast.success('Produk berhasil diperbarui');
      } else {
        await createProduct({
          id: Math.max(0, ...products.map(p => p.id)) + 1,
          name: form.name,
          slug: form.slug,
          image: form.image,
          description: form.description,
          price: form.price,
          discount_price: form.discount_price,
          category: form.category,
          time: form.time,
          rating: form.rating,
          bestseller: form.bestseller,
          unit: form.unit,
          is_available: form.is_available,
          is_active: form.is_active,
          sort_order: form.sort_order,
        });
        toast.success('Produk berhasil ditambahkan');
      }
      setDialogOpen(false);
      loadProducts();
    } catch (err: unknown) {
      toast.error('Gagal menyimpan: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await deleteProduct(id);
      toast.success('Produk berhasil dihapus');
      setConfirmDeleteId(null);
      loadProducts();
    } catch (err: unknown) {
      toast.error('Gagal menghapus: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleActive(product: ProductRow) {
    try {
      await updateProduct(product.id, { is_active: !product.is_active });
      loadProducts();
    } catch (err: unknown) {
      toast.error('Gagal mengubah status: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  const filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.slug.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && p.category !== categoryFilter) return false;
    return true;
  });

  const formatCurrency = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

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
        <p className="text-sm text-gray-500">Gagal memuat produk. Periksa koneksi Anda.</p>
        <Button size="sm" variant="outline" onClick={() => loadProducts()}>Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Kelola Produk</h2>
          <p className="text-xs text-gray-500">{products.length} produk total</p>
        </div>
        <Button size="sm" onClick={openCreate} className="bg-[#FF5E01] hover:bg-[#e55500]">
          <Plus className="w-4 h-4 mr-1" /> Tambah Produk
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari produk..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Semua Kategori</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Product List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Tidak ada produk ditemukan</p>
          </div>
        ) : (
          filtered.map(product => (
            <div
              key={product.id}
              className={`bg-white border rounded-lg p-3 flex items-center gap-3 ${!product.is_active ? 'opacity-50' : ''}`}
            >
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Package className="w-5 h-5" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{product.name}</span>
                  {product.bestseller && <Badge variant="secondary" className="text-[10px] h-4">Best</Badge>}
                  {!product.is_active && <Badge variant="outline" className="text-[10px] h-4 text-red-500">Nonaktif</Badge>}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <span>{product.category}</span>
                  <span>•</span>
                  <span className="font-medium text-green-600">
                    {product.discount_price ? (
                      <><s className="text-gray-400">{formatCurrency(product.price)}</s> {formatCurrency(product.discount_price)}</>
                    ) : formatCurrency(product.price)}
                  </span>
                  <span>•</span>
                  <span>#{product.sort_order}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Switch
                  checked={product.is_active}
                  onCheckedChange={() => handleToggleActive(product)}
                  className="scale-75"
                />
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(product)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                {confirmDeleteId === product.id ? (
                  <div className="flex gap-1">
                    <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleDelete(product.id)} disabled={deletingId === product.id}>
                      {deletingId === product.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Ya'}
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setConfirmDeleteId(null)}>Batal</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500" onClick={() => setConfirmDeleteId(product.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Produk' : 'Tambah Produk'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs">Nama Produk *</Label>
                <Input value={form.name} onChange={e => {
                  const name = e.target.value;
                  setForm(f => ({ ...f, name, slug: editingProduct ? f.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }));
                }} placeholder="Plakat Akrilik" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Slug *</Label>
                <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="plakat-akrilik" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Kategori *</Label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs">Harga (Rp)</Label>
                <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Harga Diskon (Rp)</Label>
                <Input type="number" value={form.discount_price ?? ''} onChange={e => setForm(f => ({ ...f, discount_price: e.target.value ? Number(e.target.value) : null }))} placeholder="Kosongkan jika tidak ada" className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">URL Gambar</Label>
                <Input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="/product-image/..." className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Deskripsi</Label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px] resize-y"
                  placeholder="Deskripsi produk..."
                />
              </div>
              <div>
                <Label className="text-xs">Waktu Pengerjaan</Label>
                <Input value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} placeholder="3-5 hari" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Unit</Label>
                <Input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="pcs" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Rating</Label>
                <Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: Number(e.target.value) }))} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Urutan</Label>
                <Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} className="mt-1" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={form.bestseller} onCheckedChange={v => setForm(f => ({ ...f, bestseller: v }))} className="scale-75" />
                Bestseller
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={form.is_available} onCheckedChange={v => setForm(f => ({ ...f, is_available: v }))} className="scale-75" />
                Tersedia
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} className="scale-75" />
                Aktif
              </label>
            </div>
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
