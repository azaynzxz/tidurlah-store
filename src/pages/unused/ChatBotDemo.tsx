import React from "react";
import ChatBot from "@/components/ChatBot";

const ChatBotDemo = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-2xl bg-white min-h-screen px-4 py-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-[#FF5E01]">ChatBot Demo</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Tentang ChatBot</h2>
          <p className="text-gray-700 mb-4">
            Ini adalah demo untuk komponen ChatBot yang dapat digunakan pada website Anda. 
            ChatBot ini memanfaatkan sistem keyword matching sederhana untuk menjawab pertanyaan umum
            tentang produk dan layanan.
          </p>
          <p className="text-gray-700 mb-4">
            Jika pertanyaan tidak dapat dijawab oleh bot, pengguna akan diarahkan untuk menghubungi 
            admin melalui WhatsApp.
          </p>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Cara Penggunaan</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Klik ikon chat di pojok kanan bawah untuk membuka jendela chat</li>
            <li>Ketik pertanyaan Anda tentang produk, harga, atau cara pemesanan</li>
            <li>Bot akan memberikan jawaban berdasarkan kata kunci yang terdeteksi</li>
            <li>Coba pertanyaan seperti "apa itu id card 1s?", "berapa harga banner?", atau "bagaimana cara order?"</li>
            <li>Jika pertanyaan tidak dapat dijawab, Anda akan diarahkan ke WhatsApp</li>
          </ul>
        </div>
        
        <div>
          <h2 className="text-lg font-medium mb-2">Contoh Kata Kunci</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              "id card", "lanyard", "banner", "x banner", "mug", "kaos", 
              "ganci", "plakat", "stiker", "promo", "cara order", "pengiriman", 
              "jasa desain", "help"
            ].map((keyword, index) => (
              <div key={index} className="bg-gray-100 px-3 py-2 rounded-md text-sm">
                {keyword}
              </div>
            ))}
          </div>
        </div>
        
        {/* The ChatBot component will appear fixed at the bottom right */}
        <ChatBot />
      </div>
    </div>
  );
};

export default ChatBotDemo; 