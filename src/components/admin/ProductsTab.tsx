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
import { uploadFile, getPublicUrl } from '@/services/storage';
import { useAdminProducts } from '@/hooks/useSupabaseQuery';
import type { Database } from '@/types/supabase';

type ProductRow = Database['public']['Tables']['products']['Row'];

const CATEGORIES = [
  'ID Card & Lanyard',
  'Media Promosi',
  'Merchandise',
  'Papan Bunga',
  'Apparel',
];

const emptyForm = {
  name: '',
  slug: '',
  image: '',
  description: '',
  price: 0,
  discount_price: null as number | null,
  category: 'ID Card & Lanyard',
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
  const [uploadingImage, setUploadingImage] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const uploadedPath = await uploadFile('products', filePath, file);
      if (!uploadedPath) {
        throw new Error('Upload failed');
      }

      const publicUrl = getPublicUrl('products', uploadedPath);
      if (!publicUrl) {
        throw new Error('Failed to get public URL');
      }

      setForm(f => ({ ...f, image: publicUrl }));
      toast.success('Gambar berhasil diunggah');
    } catch (err: unknown) {
      toast.error('Gagal mengunggah gambar: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setUploadingImage(false);
    }
  }

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
      <div>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Tidak ada produk ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map(product => (
              <div
                key={product.id}
                className={`bg-white border rounded-lg p-2.5 flex flex-col justify-between gap-2.5 relative ${!product.is_active ? 'opacity-60' : ''}`}
              >
                {/* Product Thumbnail */}
                <div className="aspect-[4/3] w-full rounded-md overflow-hidden bg-gray-100 flex-shrink-0 relative">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package className="w-8 h-8" />
                    </div>
                  )}
                  
                  {/* Badge Overlay */}
                  <div className="absolute top-1 left-1 flex flex-col gap-1 z-10">
                    {product.bestseller && <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 bg-yellow-400 text-yellow-900 border-none font-bold">Best</Badge>}
                    {!product.is_active && <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-red-50 text-red-500 border-red-200">Nonaktif</Badge>}
                  </div>
                  
                  <div className="absolute bottom-1 right-1 z-10">
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-white/80 backdrop-blur-xs text-gray-700">
                      #{product.sort_order}
                    </Badge>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 min-h-[2.25rem] leading-tight" title={product.name}>
                      {product.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">{product.category}</p>
                  </div>
                  <div className="mt-1.5">
                    <div className="text-xs font-bold text-green-600">
                      {product.discount_price ? (
                        <span className="flex flex-col">
                          <s className="text-[9px] text-gray-400 font-normal leading-none mb-0.5">{formatCurrency(product.price)}</s>
                          <span className="leading-none">{formatCurrency(product.discount_price)}</span>
                        </span>
                      ) : (
                        <span className="leading-none">{formatCurrency(product.price)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-1 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={product.is_active}
                      onCheckedChange={() => handleToggleActive(product)}
                      className="scale-75 origin-left"
                    />
                    <span className="text-[9px] text-gray-400 font-medium select-none">
                      {product.is_active ? 'Aktif' : 'Off'}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(product)} title="Edit">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    {confirmDeleteId === product.id ? (
                      <div className="flex gap-1">
                        <Button size="sm" variant="destructive" className="h-6 px-1.5 text-[9px] font-bold" onClick={() => handleDelete(product.id)} disabled={deletingId === product.id}>
                          {deletingId === product.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Ya'}
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 px-1.5 text-[9px]" onClick={() => setConfirmDeleteId(null)}>No</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setConfirmDeleteId(product.id)} title="Hapus">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto overflow-x-hidden scrollbar-hide">
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
                <div className="flex gap-2 mt-1">
                  <Input
                    value={form.image}
                    onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                    placeholder="/product-image/... atau https://..."
                    className="flex-1"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      id="product-image-upload"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                    <Label htmlFor="product-image-upload" className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 px-3"
                        disabled={uploadingImage}
                        asChild
                      >
                        <span>
                          {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Unggah'}
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>
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
