import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Message type definition
interface Message {
  text: string;
  isBot: boolean;
  isWhatsAppPrompt?: boolean;
  isTyping?: boolean;
  showSuggestions?: boolean;
  showSubMenu?: string | null;
}

// Response dictionary - This would be expanded with more comprehensive data
const responseData = {
  // ID Card related
  "id card": "Kami menyediakan berbagai jenis ID Card mulai dari ID Card 1S (Rp 9.000) hingga paket premium. Silakan tanyakan lebih detail tentang yang Anda butuhkan.",
  "lanyard": "Kami menyediakan lanyard dengan berbagai pilihan, termasuk cetak 1 sisi atau 2 sisi. Harga mulai dari Rp 15.000.",
  "harga id card": "Harga ID Card mulai dari Rp 9.000 untuk ID Card 1S, dengan diskon untuk pembelian dalam jumlah banyak.",
  "id card 1s": "ID Card 1S adalah kartu satu sisi dengan bahan premium berkualitas. Harga Rp 9.000 per unit, dengan diskon untuk pembelian jumlah besar (4+ unit: Rp 8.000, 25+ unit: Rp 7.000, 100+ unit: Rp 6.000). Waktu pengerjaan 1-2 hari.",
  "id card 2s": "ID Card 2S adalah kartu dua sisi dengan bahan premium berkualitas. Harga Rp 10.000 per unit, dengan diskon untuk pembelian jumlah besar (4+ unit: Rp 9.000, 25+ unit: Rp 8.000, 100+ unit: Rp 7.000). Waktu pengerjaan 2-3 hari.",
  "idc tali biasa": "ID card standar dengan lanyard biasa. Harga Rp 13.000 per unit. Tersedia diskon untuk pembelian dalam jumlah banyak.",
  "idc tali case kulit": "ID card premium dengan case kulit dan tali lanyard. Harga Rp 30.000 per unit. Kualitas premium dengan rating 4.9/5.0.",
  "perbedaan id card 1s dan 2s": "ID Card 1S memiliki cetakan pada satu sisi saja, sedangkan ID Card 2S memiliki cetakan pada kedua sisi. 2S sedikit lebih mahal (Rp 10.000 vs Rp 9.000) dan membutuhkan waktu 2-3 hari untuk diproduksi, dibandingkan 1-2 hari untuk 1S.",
  "custom design id card": "Ya! Kami dapat mengaplikasikan desain kustom Anda pada ID Card. Jika Anda belum memiliki desain, kami juga menawarkan jasa desain dengan biaya tambahan.",
  "material id card": "ID Card kami terbuat dari bahan PVC berkualitas premium yang tahan lama, anti air, dan dirancang untuk penggunaan jangka panjang dengan hasil cetak yang jelas dan cerah.",
  "warna lanyard": "Ya, kami menawarkan berbagai pilihan warna lanyard. Untuk permintaan warna khusus, silakan tentukan kebutuhan Anda saat pemesanan, terutama untuk pemesanan dalam jumlah besar.",
  "bulk id card": "Untuk 50 kartu, Anda akan memenuhi syarat untuk diskon jumlah besar pada tingkat 25+. ID Card 1S akan dikenakan harga Rp 7.000 per unit, dan ID Card 2S akan dikenakan harga Rp 8.000 per unit. Untuk paket lengkap dengan lanyard, 'Paket IDC LYD 1S' dengan harga Rp 16.000 per unit direkomendasikan.",
  "case id card": "ID Card dasar (1S dan 2S) tidak termasuk case secara default. Untuk kartu dengan case, pilih opsi seperti 'IDC Tali & Case Kulit' atau 'IDC Tali Biasa' yang sudah termasuk kartu dan case.",
  
  // Banner related
  "banner": "Kami menyediakan Banner Indoor/Outdoor dengan ukuran kustom. Harga dihitung berdasarkan luas area (Rp 18.000/m²).",
  "x banner": "X Banner ukuran 60x160cm tersedia dengan harga Rp 90.000. Cocok untuk pameran dan event.",
  "roll banner": "Roll Banner kami dengan harga Rp 350.000 adalah banner gulung portable dengan stand, sempurna untuk acara dan pameran. Waktu pengerjaan 3-4 hari.",
  "poster a3": "Poster ukuran A3 dicetak pada kertas berkualitas tinggi. Harga Rp 25.000 per lembar. Waktu pengerjaan 1-2 hari.",
  "perbedaan x banner dan roll banner": "X Banner menggunakan dudukan berbentuk X dan berukuran 60×160cm, ideal untuk acara indoor dengan area display tetap. Roll Banner dapat digulung, lebih portable, dan lebih cocok untuk pameran keliling. X Banner berharga Rp 90.000 sedangkan Roll Banner Rp 350.000.",
  "ukuran banner toko": "Untuk toko berukuran kecil, kami merekomendasikan banner berukuran 2-3m lebar × 1m tinggi. Ini memberikan visibilitas yang baik dengan biaya yang wajar.",
  "banner hujan": "Banner outdoor kami terbuat dari bahan tahan cuaca yang dirancang untuk tahan terhadap hujan dan paparan sinar matahari. Biasanya, mereka tetap dalam kondisi baik selama 6-12 bulan penggunaan di luar ruangan, tergantung kondisi cuaca.",
  "ukuran custom banner": "Ya! Produk Banner Indoor/Outdoor kami memungkinkan ukuran kustom antara lebar 0,5-5m dan tinggi 0,5-10m. Harga dihitung berdasarkan Rp 18.000 per meter persegi.",
  "instalasi banner": "Kami tidak menyediakan layanan instalasi secara langsung, tetapi kami dapat merekomendasikan mitra terpercaya yang dapat membantu instalasi untuk banner yang lebih besar atau kebutuhan display khusus.",
  
  // Merchandise related
  "merchandise": "Kami menyediakan berbagai merchandise kustom berkualitas seperti ganci, mug, tumbler, kaos, stiker, dan plakat. Setiap item dapat dipersonalisasi dengan desain Anda.",
  "mug": "Mug custom kami tersedia dengan harga Rp 40.000, aman untuk microwave dan dishwasher.",
  "kaos": "Sablon kaos custom tersedia dengan harga Rp 75.000 termasuk kaos kualitas premium.",
  "ganci": "Kami memiliki ganci berbagai ukuran (3cm dan 5cm) dengan harga mulai Rp 8.000.",
  "ganci akrilik": "Ganci akrilik custom cetak dengan desain Anda. Harga Rp 8.000 per unit.",
  "ganci 3 cm": "Ganci custom cetak diameter 3 cm. Harga Rp 8.000 per unit.",
  "ganci 5 cm": "Ganci custom cetak diameter 5 cm. Harga Rp 12.000 per unit.",
  "ganci tali": "Ganci custom cetak dengan tambahan tali. Harga Rp 15.000 per unit.",
  "tumbler": "Tumbler travel custom cetak dengan tutup tersedia dengan harga Rp 65.000, cocok untuk minuman panas dan dingin.",
  "plakat": "Plakat penghargaan akrilik ukuran reguler dengan desain dan teks kustom tersedia dengan harga Rp 135.000.",
  "stiker": "Stiker vinyl potong custom dengan desain Anda tersedia dengan harga Rp 15.000.",
  "design mug": "Tentu saja! Anda dapat menyediakan desain sendiri untuk mug custom. Kami menerima desain dalam format seperti JPG, PNG, atau file AI. Jika Anda membutuhkan bantuan desain, layanan desain kami tersedia.",
  "mug microwave": "Ya, mug custom cetak kami aman untuk microwave dan mesin pencuci piring. Cetakan telah diproses dengan panas untuk memastikan tidak luntur saat dicuci secara teratur.",
  "perbedaan ganci 3cm dan 5cm": "Perbedaannya hanya pada ukuran diameter - Ganci 3cm berdiameter 3 sentimeter (Rp 8.000) sedangkan Ganci 5cm berdiameter 5 sentimeter (Rp 12.000). Ukuran yang lebih besar memungkinkan desain yang lebih detail.",
  "sablon kaos": "Layanan Sablon Kaos kami (Rp 75.000) sudah termasuk kaos. Kami menggunakan kaos katun berkualitas tinggi. Anda dapat menentukan warna dan ukuran yang diinginkan saat pemesanan.",
  "detail stiker": "Layanan Cutting Stiker Kontur kami dapat menangani desain rumit dengan detail halus. Namun, detail yang sangat kecil (kurang dari 2mm) mungkin sulit untuk dipotong dengan bersih.",
  "awet plakat": "Plakat akrilik kami terbuat dari bahan berkualitas tinggi yang tidak akan menguning atau rusak seiring waktu. Dengan perawatan yang tepat (menghindari sinar matahari langsung dan panas ekstrem), mereka akan mempertahankan penampilannya selama bertahun-tahun.",
  
  // Design Service
  "jasa desain": "Layanan desain grafis profesional untuk semua kebutuhan Anda tersedia dengan harga Rp 200.000. Waktu pengerjaan 3-7 hari tergantung kompleksitas.",
  "desain logo": "Ya, desain logo termasuk dalam layanan desain kami. Kami akan bekerja sama dengan Anda untuk memahami brand Anda dan menciptakan logo profesional dan unik yang merepresentasikan identitas bisnis Anda.",
  "revisi desain": "Paket standar kami mencakup hingga 3 putaran revisi. Revisi tambahan dapat diatur dengan biaya tambahan.",
  "layanan desain": "Layanan desain kami (Rp 200.000) mencakup pekerjaan desain grafis profesional yang disesuaikan dengan kebutuhan Anda. Ini mencakup pembuatan konsep, hingga 3 putaran revisi, dan file akhir yang dikirimkan dalam format yang sesuai dengan penggunaan yang Anda inginkan.",
  
  // Order related
  "promo": "Gunakan kode DISCOUNT10 untuk diskon 10%, SAVE15 untuk diskon 15%, atau PROMO20 untuk diskon 20% pada semua produk. Khusus untuk ID Card 2S, gunakan IDCARD15 untuk diskon 15%.",
  "kode promo": "Gunakan kode DISCOUNT10 untuk diskon 10%, SAVE15 untuk diskon 15%, atau PROMO20 untuk diskon 20% pada semua produk. Khusus untuk ID Card 2S, gunakan IDCARD15 untuk diskon 15%.",
  "cara order": "Pilih produk, masukkan ke keranjang, isi data diri, dan pilih metode pengiriman. Pembayaran dan konfirmasi melalui WhatsApp.",
  "pengiriman": "Kami melayani pengiriman ke seluruh Indonesia. Biaya kirim akan dihitung berdasarkan berat dan tujuan.",
  "diskon": "Kami memberikan diskon kuantitas untuk pembelian 4+, 25+, dan 100+ unit. Semakin banyak pesanan, semakin besar diskon yang Anda dapatkan.",
  "cara apply promo": "Selama checkout, Anda akan menemukan kolom 'Kode Promo' di mana Anda dapat memasukkan kode promo. Kode yang valid seperti DISCOUNT10 atau SAVE15 akan secara otomatis menerapkan diskon ke produk yang memenuhi syarat.",
  "ubah pesanan": "Ya, Anda dapat meminta perubahan sebelum produksi dimulai. Silakan hubungi kami segera melalui WhatsApp dengan nomor pesanan dan perubahan yang Anda minta.",
  "kirim luar kota": "Ya, kami menawarkan pengiriman ke seluruh Indonesia. Biaya pengiriman akan dihitung berdasarkan lokasi, berat paket, dan layanan kurir yang Anda pilih.",
  "rush order": "Kami mungkin dapat mengakomodasi pesanan mendesak tergantung jadwal produksi kami saat ini. Biasanya ada biaya tambahan 30% untuk layanan rush, dan ketersediaan bervariasi berdasarkan jenis produk.",
  "lacak pesanan": "Setelah pesanan Anda dikirim, kami akan memberikan nomor pelacakan melalui WhatsApp yang dapat Anda gunakan untuk memantau progres paket Anda melalui situs web kurir.",
  "metode pembayaran": "Kami menerima transfer bank, pembayaran e-wallet (GoPay, OVO, Dana), dan tunai untuk pengambilan di toko. Detail pembayaran akan diberikan saat menyelesaikan pesanan Anda melalui WhatsApp.",
  
  // Help
  "help": "Anda dapat bertanya tentang produk (ID Card, Banner, Merchandise), harga, promo, atau cara order.",
  "bantuan": "Anda dapat bertanya tentang produk (ID Card, Banner, Merchandise), harga, promo, atau cara order.",
  "hi": "Halo! Ada yang bisa saya bantu mengenai produk kami?",
  "halo": "Halo! Ada yang bisa saya bantu mengenai produk kami?",
  "hello": "Halo! Ada yang bisa saya bantu mengenai produk kami?",
  
  // Add chat with admin response
  "chat with admin": "Untuk berbicara langsung dengan admin kami, silakan klik tombol WhatsApp di bawah ini:"
};

// Main suggestion buttons with color coding
const suggestions = [
  { text: "ID Card", keyword: "id card", color: "bg-blue-100 hover:bg-blue-200 text-blue-800" },
  { text: "Banner", keyword: "banner", color: "bg-green-100 hover:bg-green-200 text-green-800" },
  { text: "Merchandise", keyword: "merchandise", color: "bg-purple-100 hover:bg-purple-200 text-purple-800" },
  { text: "Jasa Desain", keyword: "jasa desain", color: "bg-teal-100 hover:bg-teal-200 text-teal-800" },
  { text: "Promo Codes", keyword: "kode promo", color: "bg-orange-100 hover:bg-orange-200 text-orange-800" },
  { text: "Cara Order", keyword: "cara order", color: "bg-amber-100 hover:bg-amber-200 text-amber-800" },
  { 
    text: "Chat dengan Admin", 
    keyword: "chat with admin", 
    color: "bg-green-100 hover:bg-green-200 text-green-800",
    hasIcon: true
  }
];

// Sub-menu suggestions based on main topics
const subMenus = {
  "id card": [
    { text: "ID Card 1S", keyword: "id card 1s", color: "bg-blue-50 hover:bg-blue-100 text-blue-800" },
    { text: "ID Card 2S", keyword: "id card 2s", color: "bg-blue-50 hover:bg-blue-100 text-blue-800" },
    { text: "IDC Tali & Case Kulit", keyword: "idc tali case kulit", color: "bg-blue-50 hover:bg-blue-100 text-blue-800" },
    { text: "IDC Tali Biasa", keyword: "idc tali biasa", color: "bg-blue-50 hover:bg-blue-100 text-blue-800" },
    { text: "Material & Kualitas", keyword: "material id card", color: "bg-blue-50 hover:bg-blue-100 text-blue-800" },
    { text: "Custom Design", keyword: "custom design id card", color: "bg-blue-50 hover:bg-blue-100 text-blue-800" }
  ],
  "banner": [
    { text: "Banner Custom", keyword: "banner", color: "bg-green-50 hover:bg-green-100 text-green-800" },
    { text: "X Banner", keyword: "x banner", color: "bg-green-50 hover:bg-green-100 text-green-800" },
    { text: "Roll Banner", keyword: "roll banner", color: "bg-green-50 hover:bg-green-100 text-green-800" },
    { text: "Poster A3", keyword: "poster a3", color: "bg-green-50 hover:bg-green-100 text-green-800" },
    { text: "Ukuran Rekomendasi", keyword: "ukuran banner toko", color: "bg-green-50 hover:bg-green-100 text-green-800" },
    { text: "Ketahanan Outdoor", keyword: "banner hujan", color: "bg-green-50 hover:bg-green-100 text-green-800" }
  ],
  "merchandise": [
    { text: "Ganci", keyword: "ganci", color: "bg-purple-50 hover:bg-purple-100 text-purple-800" },
    { text: "Mug Custom", keyword: "mug", color: "bg-purple-50 hover:bg-purple-100 text-purple-800" },
    { text: "Tumbler", keyword: "tumbler", color: "bg-purple-50 hover:bg-purple-100 text-purple-800" },
    { text: "Kaos Sablon", keyword: "kaos", color: "bg-purple-50 hover:bg-purple-100 text-purple-800" },
    { text: "Stiker", keyword: "stiker", color: "bg-purple-50 hover:bg-purple-100 text-purple-800" },
    { text: "Plakat Akrilik", keyword: "plakat", color: "bg-purple-50 hover:bg-purple-100 text-purple-800" }
  ],
  "ganci": [
    { text: "Ganci Akrilik", keyword: "ganci akrilik", color: "bg-purple-50 hover:bg-purple-100 text-purple-800" },
    { text: "Ganci 3 cm", keyword: "ganci 3 cm", color: "bg-purple-50 hover:bg-purple-100 text-purple-800" },
    { text: "Ganci 5 cm", keyword: "ganci 5 cm", color: "bg-purple-50 hover:bg-purple-100 text-purple-800" },
    { text: "Ganci Tali", keyword: "ganci tali", color: "bg-purple-50 hover:bg-purple-100 text-purple-800" },
    { text: "Perbedaan Ukuran", keyword: "perbedaan ganci 3cm dan 5cm", color: "bg-purple-50 hover:bg-purple-100 text-purple-800" }
  ],
  "mug": [
    { text: "Desain Sendiri", keyword: "design mug", color: "bg-purple-50 hover:bg-purple-100 text-purple-800" },
    { text: "Microwave Safe", keyword: "mug microwave", color: "bg-purple-50 hover:bg-purple-100 text-purple-800" }
  ],
  "kaos": [
    { text: "Info Sablon", keyword: "sablon kaos", color: "bg-purple-50 hover:bg-purple-100 text-purple-800" }
  ],
  "plakat": [
    { text: "Ketahanan", keyword: "awet plakat", color: "bg-purple-50 hover:bg-purple-100 text-purple-800" }
  ],
  "stiker": [
    { text: "Detail Cutting", keyword: "detail stiker", color: "bg-purple-50 hover:bg-purple-100 text-purple-800" }
  ],
  "jasa desain": [
    { text: "Desain Logo", keyword: "desain logo", color: "bg-green-50 hover:bg-green-100 text-green-800" },
    { text: "Revisi", keyword: "revisi desain", color: "bg-green-50 hover:bg-green-100 text-green-800" },
    { text: "Layanan Lengkap", keyword: "layanan desain", color: "bg-green-50 hover:bg-green-100 text-green-800" }
  ],
  "cara order": [
    { text: "Pembayaran", keyword: "metode pembayaran", color: "bg-amber-50 hover:bg-amber-100 text-amber-800" },
    { text: "Pengiriman", keyword: "pengiriman", color: "bg-amber-50 hover:bg-amber-100 text-amber-800" },
    { text: "Lacak Pesanan", keyword: "lacak pesanan", color: "bg-amber-50 hover:bg-amber-100 text-amber-800" },
    { text: "Ubah Pesanan", keyword: "ubah pesanan", color: "bg-amber-50 hover:bg-amber-100 text-amber-800" },
    { text: "Rush Order", keyword: "rush order", color: "bg-amber-50 hover:bg-amber-100 text-amber-800" }
  ],
  "kode promo": [
    { text: "Cara Apply", keyword: "cara apply promo", color: "bg-orange-50 hover:bg-orange-100 text-orange-800" },
    { text: "Diskon Jumlah", keyword: "diskon", color: "bg-orange-50 hover:bg-orange-100 text-orange-800" }
  ]
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Halo! Ada yang bisa saya bantu?", isBot: true }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show welcome suggestions after initial greeting
  useEffect(() => {
    if (messages.length === 1 && isOpen) {
      setTimeout(() => {
        setMessages([
          ...messages,
          { 
            text: "Anda dapat bertanya tentang produk, harga, atau cara order. Atau pilih topik di bawah ini:", 
            isBot: true,
            showSuggestions: true
          }
        ]);
      }, 1000);
    }
  }, [isOpen, messages]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  // Handle sending a message
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    // Add user message
    const updatedMessages = [...messages, { text: inputText, isBot: false }];
    setMessages(updatedMessages);
    
    // Show typing indicator
    setIsTyping(true);
    setMessages([...updatedMessages, { text: "", isBot: true, isTyping: true }]);
    
    // Process the input and find a response
    setTimeout(() => {
      // Remove typing indicator
      setIsTyping(false);
      const messagesWithoutTyping = updatedMessages;
      
      // Simple keyword matching
      const userInput = inputText.toLowerCase();
      let foundResponse = false;
      
      // Check for keyword matches
      for (const keyword in responseData) {
        if (userInput.includes(keyword)) {
          const newMessage = { 
            text: responseData[keyword as keyof typeof responseData], 
            isBot: true 
          };
          
          // Check if this is a category that has sub-menu
          const hasSubMenu = Object.keys(subMenus).includes(keyword);
          
          // Add the response message
          setMessages([
            ...messagesWithoutTyping, 
            hasSubMenu 
              ? { ...newMessage, showSubMenu: keyword }
              : newMessage
          ]);
          
          // After a brief delay, add follow-up message asking to pick another topic
          setTimeout(() => {
            setMessages(prevMessages => [
              ...prevMessages,
              { 
                text: "Ada lagi yang ingin Anda tanyakan? Silakan pilih topik lain atau ketik pertanyaan Anda.", 
                isBot: true,
                showSuggestions: true 
              }
            ]);
          }, 3000);
          
          foundResponse = true;
          break;
        }
      }
      
      // If no keyword match, suggest WhatsApp
      if (!foundResponse) {
        setMessages([
          ...messagesWithoutTyping, 
          { 
            text: "Maaf, saya tidak dapat menjawab pertanyaan tersebut. Silakan hubungi admin kami via WhatsApp untuk bantuan lebih lanjut.", 
            isBot: true,
            isWhatsAppPrompt: true
          }
        ]);
        
        // After a brief delay, add follow-up message asking to pick another topic
        setTimeout(() => {
          setMessages(prevMessages => [
            ...prevMessages,
            { 
              text: "Ada lagi yang ingin Anda tanyakan? Silakan pilih topik lain atau ketik pertanyaan Anda.", 
              isBot: true,
              showSuggestions: true 
            }
          ]);
        }, 3000);
      }
      
      setInputText("");
    }, 1500);
  };

  // Handle suggestion click
  const handleSuggestionClick = (keyword: string) => {
    // Add user message as if they typed it
    const updatedMessages = [...messages, { text: `${keyword}?`, isBot: false }];
    setMessages(updatedMessages);
    
    // Show typing indicator
    setIsTyping(true);
    setMessages([...updatedMessages, { text: "", isBot: true, isTyping: true }]);
    
    // Find response for this keyword
    setTimeout(() => {
      setIsTyping(false);
      const messagesWithoutTyping = updatedMessages;
      
      // Get response for this exact keyword if available
      const response = responseData[keyword as keyof typeof responseData];
      if (response) {
        // Special case for "chat with admin"
        if (keyword === "chat with admin") {
          setMessages([
            ...messagesWithoutTyping,
            { 
              text: response, 
              isBot: true, 
              isWhatsAppPrompt: true 
            }
          ]);
          
          // After a brief delay, show suggestions again
          setTimeout(() => {
            setMessages(prevMessages => [
              ...prevMessages,
              { 
                text: "Ada lagi yang ingin Anda tanyakan? Silakan pilih topik lain atau ketik pertanyaan Anda.", 
                isBot: true,
                showSuggestions: true 
              }
            ]);
          }, 3000);
          
          return;
        }
        
        // Check if this keyword has sub-menu
        const hasSubMenu = Object.keys(subMenus).includes(keyword);
        
        // Add the response message
        setMessages([
          ...messagesWithoutTyping, 
          hasSubMenu 
            ? { text: response, isBot: true, showSubMenu: keyword }
            : { text: response, isBot: true }
        ]);
        
        // After a brief delay, add follow-up message asking to pick another topic
        setTimeout(() => {
          setMessages(prevMessages => [
            ...prevMessages,
            { 
              text: "Ada lagi yang ingin Anda tanyakan? Silakan pilih topik lain atau ketik pertanyaan Anda.", 
              isBot: true,
              showSuggestions: true 
            }
          ]);
        }, 3000);
      } else {
        // Fallback for suggestions that don't match exactly
        setMessages([
          ...messagesWithoutTyping,
          { text: "Maaf, informasi tidak ditemukan. Silakan ajukan pertanyaan yang lebih spesifik.", isBot: true }
        ]);
        
        // After a brief delay, add follow-up message asking to pick another topic
        setTimeout(() => {
          setMessages(prevMessages => [
            ...prevMessages,
            { 
              text: "Ada lagi yang ingin Anda tanyakan? Silakan pilih topik lain atau ketik pertanyaan Anda.", 
              isBot: true,
              showSuggestions: true 
            }
          ]);
        }, 3000);
      }
    }, 1500);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Chat button */}
      <Button
        variant="default"
        size="icon"
        className={cn(
          "rounded-full w-14 h-14 bg-[#FF5E01] hover:bg-[#FF5E01]/90 shadow-lg",
          isOpen && "hidden"
        )}
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      
      {/* Unread messages indicator */}
      {!isOpen && messages.length > 2 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
          !
        </div>
      )}
      
      {/* Chat window */}
      {isOpen && (
        <div className="bg-white w-80 h-[450px] rounded-lg shadow-xl flex flex-col border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-[#FF5E01] text-white p-3 flex justify-between items-center">
            <div>
              <h3 className="font-medium">Chat dengan kami</h3>
              <p className="text-xs text-white/80">Online | Respons instan</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white hover:bg-[#FF5E01]/90 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`mb-3 ${msg.isBot ? "text-left" : "text-right"}`}
              >
                <div 
                  className={`inline-block p-2 rounded-lg max-w-[85%] text-sm ${
                    msg.isBot 
                      ? "bg-gray-100 text-gray-800" 
                      : "bg-[#FF5E01] text-white"
                  }`}
                >
                  {msg.isTyping ? (
                    <div className="flex items-center gap-1 px-2">
                      <div className="bg-gray-400 w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="bg-gray-400 w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      <div className="bg-gray-400 w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: "600ms" }}></div>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
                
                {/* Show suggestion buttons below bot message */}
                {msg.isBot && msg.showSuggestions && (
                  <div className="flex flex-wrap gap-2 mt-3 mb-1">
                    {suggestions.map((suggestion, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSuggestionClick(suggestion.keyword)}
                        className={`px-3 py-1.5 rounded-full text-xs transition-colors flex items-center ${suggestion.color}`}
                      >
                        {suggestion.hasIcon && (
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.6 6.32C16.2 4.93 14.2 4.1 12.1 4.1C7.8 4.1 4.3 7.6 4.3 11.9C4.3 13.3 4.7 14.7 5.4 15.9L4.2 19.9L8.3 18.7C9.5 19.3 10.7 19.7 12 19.7C16.3 19.7 19.8 16.2 19.8 11.9C19.8 9.8 19 7.8 17.6 6.32ZM12.1 18.3C10.9 18.3 9.7 17.9 8.7 17.2L8.4 17L6 17.7L6.7 15.4L6.4 15.1C5.6 14 5.2 13 5.2 11.9C5.2 8.1 8.3 5.1 12 5.1C13.8 5.1 15.5 5.8 16.7 7C17.9 8.2 18.6 9.9 18.6 11.7C18.8 15.5 15.8 18.3 12.1 18.3ZM15.2 13.2C15 13.1 14.1 12.7 13.9 12.6C13.7 12.5 13.5 12.5 13.4 12.7C13.2 12.9 12.9 13.3 12.8 13.5C12.7 13.7 12.5 13.7 12.3 13.6C11.3 13.1 10.6 12.7 9.9 11.5C9.7 11.2 10 11.2 10.3 10.6C10.4 10.4 10.3 10.3 10.2 10.2C10.1 10.1 9.8 9.2 9.6 8.8C9.4 8.4 9.2 8.4 9 8.4C8.9 8.4 8.7 8.4 8.5 8.4C8.3 8.4 8 8.5 7.8 8.8C7.6 9.1 7.1 9.5 7.1 10.4C7.1 11.3 7.8 12.2 7.9 12.4C8.1 12.6 9.7 15 12.1 16C13.2 16.5 13.7 16.5 14.3 16.4C14.7 16.3 15.4 15.9 15.6 15.5C15.8 15.1 15.8 14.7 15.7 14.6C15.6 14.5 15.4 14.4 15.2 14.3L15.2 13.2Z"/>
                          </svg>
                        )}
                        {suggestion.text}
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Show sub-menu buttons if this message has a sub-menu */}
                {msg.isBot && msg.showSubMenu && subMenus[msg.showSubMenu as keyof typeof subMenus] && (
                  <div className="flex flex-wrap gap-2 mt-3 mb-1">
                    <p className="w-full text-xs text-gray-500 mb-1">Detail produk:</p>
                    {subMenus[msg.showSubMenu as keyof typeof subMenus].map((subItem, subIdx) => (
                      <button
                        key={subIdx}
                        onClick={() => handleSuggestionClick(subItem.keyword)}
                        className={`px-3 py-1 rounded-full text-xs transition-colors ${subItem.color}`}
                      >
                        {subItem.text}
                      </button>
                    ))}
                  </div>
                )}
                
                {msg.isWhatsAppPrompt && (
                  <a 
                    href={`https://wa.me/6285172157808?text=${encodeURIComponent(
                      msg.text === responseData["chat with admin"] 
                        ? "Halo Admin, saya ingin bertanya langsung tentang produk/layanan TIDURLAH STORE." 
                        : `Halo, saya memiliki pertanyaan tentang: ${inputText}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center mt-2 bg-green-500 hover:bg-green-600 text-white rounded-full py-2 px-4 font-medium text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.6 6.32C16.2 4.93 14.2 4.1 12.1 4.1C7.8 4.1 4.3 7.6 4.3 11.9C4.3 13.3 4.7 14.7 5.4 15.9L4.2 19.9L8.3 18.7C9.5 19.3 10.7 19.7 12 19.7C16.3 19.7 19.8 16.2 19.8 11.9C19.8 9.8 19 7.8 17.6 6.32ZM12.1 18.3C10.9 18.3 9.7 17.9 8.7 17.2L8.4 17L6 17.7L6.7 15.4L6.4 15.1C5.6 14 5.2 13 5.2 11.9C5.2 8.1 8.3 5.1 12 5.1C13.8 5.1 15.5 5.8 16.7 7C17.9 8.2 18.6 9.9 18.6 11.7C18.8 15.5 15.8 18.3 12.1 18.3ZM15.2 13.2C15 13.1 14.1 12.7 13.9 12.6C13.7 12.5 13.5 12.5 13.4 12.7C13.2 12.9 12.9 13.3 12.8 13.5C12.7 13.7 12.5 13.7 12.3 13.6C11.3 13.1 10.6 12.7 9.9 11.5C9.7 11.2 10 11.2 10.3 10.6C10.4 10.4 10.3 10.3 10.2 10.2C10.1 10.1 9.8 9.2 9.6 8.8C9.4 8.4 9.2 8.4 9 8.4C8.9 8.4 8.7 8.4 8.5 8.4C8.3 8.4 8 8.5 7.8 8.8C7.6 9.1 7.1 9.5 7.1 10.4C7.1 11.3 7.8 12.2 7.9 12.4C8.1 12.6 9.7 15 12.1 16C13.2 16.5 13.7 16.5 14.3 16.4C14.7 16.3 15.4 15.9 15.6 15.5C15.8 15.1 15.8 14.7 15.7 14.6C15.6 14.5 15.4 14.4 15.2 14.3L15.2 13.2Z"/>
                    </svg>
                    Hubungi via WhatsApp
                  </a>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} /> {/* For auto-scroll */}
          </div>
          
          {/* Input */}
          <div className="p-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Tulis pesan..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button 
                onClick={handleSendMessage}
                variant="default"
                size="icon"
                className="h-10 w-10 bg-[#FF5E01] hover:bg-[#FF5E01]/90 rounded-full flex-shrink-0"
                disabled={isTyping || !inputText.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 text-center">
              <span className="text-xs text-gray-500">Powered by TIDURLAH STORE</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot; 