import { BlogPostData } from "../index";

export const blogPost: BlogPostData = {
  id: 13,
  slug: "tutorial-cara-order",
  title: "Tutorial Cara Order di TIDURLAH STORE",
  subtitle: "Panduan lengkap cara memesan produk ID Card, Lanyard, dan merchandise custom di website kami",
  author: "ID Card Lampung",
  date: "2024-01-26",
  tags: ["Tutorial", "Cara Order", "Panduan", "ID Card", "Lanyard"],
  readTime: "5 menit",
  views: 0,
  image: null,
  category: "tutorials",
  content: `
    <div class="space-y-6">
           <div class="bg-gray-50 p-6 rounded-lg">
        <h3 class="text-xl font-bold text-gray-900 mb-4 text-center">Video Tutorial Cara Order</h3>
        <div class="flex justify-center">
          <!-- Mobile: Vertical video (1080x1920) -->
          <div class="relative w-full md:hidden" style="max-width: 1080px; padding-bottom: 177.78%; height: 0;">
            <iframe 
              class="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
              src="https://www.youtube.com/embed/H6JlqiVTXZQ?si=efV2B9xtQl5r4IsU" 
              title="Tutorial Cara Order di TIDURLAH STORE" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
          </div>
          <!-- Desktop: Horizontal video -->
          <div class="hidden md:block relative w-full" style="padding-bottom: 56.25%; height: 0;">
            <iframe 
              class="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
              src="https://www.youtube.com/embed/H6JlqiVTXZQ?si=efV2B9xtQl5r4IsU" 
              title="Tutorial Cara Order di TIDURLAH STORE" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
          </div>
        </div>
        <p class="text-sm text-gray-500 text-center mt-3">
          Tonton video di atas untuk panduan visual lengkap cara order di website kami
        </p>
      </div>

      <div>
        <h3 class="text-xl font-bold text-gray-900 mb-3">Ringkasan Langkah-Langkah Order:</h3>
        
        <div class="space-y-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h4 class="font-bold text-[#FF5E01] mb-2">1. Pilih Produk</h4>
            <p class="text-gray-700 leading-relaxed">
              Telusuri kategori produk kami seperti ID Card & Lanyard, Stiker, Plakat, Banner, dan lainnya. 
              Klik produk yang Anda inginkan untuk melihat detail lengkap.
            </p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h4 class="font-bold text-[#FF5E01] mb-2">2. Pilih Varian (Jika Ada)</h4>
            <p class="text-gray-700 leading-relaxed">
              Untuk produk seperti ID Card dengan casing atau Stiker dengan laminasi, pilih varian yang Anda inginkan. 
              Pastikan Anda memilih model atau jenis yang sesuai dengan kebutuhan Anda.
            </p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h4 class="font-bold text-[#FF5E01] mb-2">3. Tentukan Jumlah</h4>
            <p class="text-gray-700 leading-relaxed">
              Masukkan jumlah produk yang ingin Anda pesan. Perhatikan bahwa harga dapat berubah berdasarkan kuantitas - 
              semakin banyak, semakin murah per unit!
            </p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h4 class="font-bold text-[#FF5E01] mb-2">4. Tambahkan ke Keranjang</h4>
            <p class="text-gray-700 leading-relaxed">
              Klik tombol "Tambahkan ke Keranjang" berwarna oranye. Anda bisa melanjutkan belanja atau langsung ke checkout.
            </p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h4 class="font-bold text-[#FF5E01] mb-2">5. Review Keranjang</h4>
            <p class="text-gray-700 leading-relaxed">
              Klik ikon keranjang di pojok kanan atas untuk melihat semua produk yang sudah Anda pilih. 
              Anda bisa mengubah jumlah atau menghapus item yang tidak jadi dipesan.
            </p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h4 class="font-bold text-[#FF5E01] mb-2">6. Isi Data Pesanan</h4>
            <p class="text-gray-700 leading-relaxed">
              Klik "Checkout" dan isi data diri Anda termasuk nama, instansi, nomor telepon, dan catatan desain. 
              Jangan lupa upload atau masukkan link desain Anda (Google Drive/Canva).
            </p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h4 class="font-bold text-[#FF5E01] mb-2">7. Pilih Opsi Tambahan</h4>
            <p class="text-gray-700 leading-relaxed">
              Anda bisa memilih opsi pengiriman, request jasa desain (+Rp 25.000), atau cetak express (+Rp 25.000) 
              untuk prioritas pengerjaan lebih cepat.
            </p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h4 class="font-bold text-[#FF5E01] mb-2">8. Lanjut ke WhatsApp</h4>
            <p class="text-gray-700 leading-relaxed">
              Setelah semua data lengkap, klik "Lanjut ke WhatsApp". Anda akan diarahkan ke chat dengan admin kami 
              untuk konfirmasi dan pembayaran. Data pesanan Anda sudah otomatis terkirim ke admin!
            </p>
          </div>
        </div>
      </div>

      <div class="bg-green-50 border border-green-200 p-6 rounded-lg">
        <h3 class="text-xl font-bold text-green-800 mb-3">💡 Tips Penting:</h3>
        <ul class="list-disc list-inside space-y-2 text-gray-700">
          <li>Pastikan link desain Anda sudah dibuka aksesnya (public) agar admin bisa melihatnya</li>
          <li>Manfaatkan promo kode untuk mendapatkan diskon tambahan</li>
          <li>Pesan dalam jumlah banyak untuk harga lebih murah per unit</li>
          <li>Gunakan fitur cetak express jika Anda membutuhkan pesanan lebih cepat</li>
          <li>Hubungi admin via WhatsApp jika ada pertanyaan atau kebutuhan khusus</li>
        </ul>
      </div>
    </div>
  `,
  relatedProducts: ["ID Card & Lanyard", "Stiker & Label", "Plakat & Trophy"]
};

