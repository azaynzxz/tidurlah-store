import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Sparkles, Check, ShoppingCart } from "lucide-react";
import MusicPlayer from "@/components/MusicPlayer";

interface SurveyQuestion {
  id: number;
  type: 'text' | 'radio' | 'checkbox' | 'textarea' | 'scale' | 'card';
  question: string;
  options?: string[];
  required?: boolean;
  scaleLabels?: { min: string; max: string };
}

// Survey Header Component (same as Index.tsx for consistent branding)
const SurveyHeader = () => {
  return (
    <div className="bg-white shadow-sm p-3 flex justify-between items-center sticky top-0 z-10">
      <img 
        src="https://zkreatif.wordpress.com/wp-content/uploads/2025/05/logo-tidurlah-grafika-horizontal.png"
        alt="TIDURLAH STORE"
        className="h-8 object-contain"
      />
      <div className="flex items-center">
        <MusicPlayer />
      </div>
    </div>
  );
};

const surveyQuestions: SurveyQuestion[] = [
  {
    id: 1,
    type: 'text',
    question: 'Siapa nama anda?',
    required: false,
  },
  {
    id: 2,
    type: 'card',
    question: 'Bagaimana Anda menemukan website kami?',
    options: ['Media Sosial', 'Mesin Pencari', 'Rekomendasi Teman/Keluarga', 'Lainnya'],
    required: true,
  },
  {
    id: 3,
    type: 'scale',
    question: 'Seberapa mudah menggunakan website kami?',
    required: true,
    scaleLabels: { min: 'Sangat Sulit', max: 'Sangat Mudah' }
  },
  {
    id: 4,
    type: 'scale',
    question: 'Apakah Anda dapat menemukan produk yang Anda cari dengan mudah?',
    required: true,
    scaleLabels: { min: 'Tidak Bisa Menemukan', max: 'Sangat Mudah' }
  },
  {
    id: 5,
    type: 'scale',
    question: 'Bagaimana kecepatan loading website kami?',
    required: true,
    scaleLabels: { min: 'Sangat Lambat', max: 'Sangat Cepat' }
  },
  {
    id: 6,
    type: 'scale',
    question: 'Seberapa puas Anda dengan informasi produk yang disediakan?',
    required: true,
    scaleLabels: { min: 'Sangat Tidak Puas', max: 'Sangat Puas' }
  },
  {
    id: 7,
    type: 'card',
    question: 'Apakah proses checkout mudah dipahami?',
    options: ['Ya, sangat mudah', 'Cukup mudah', 'Tidak, membingungkan'],
    required: true,
  },
  {
    id: 8,
    type: 'card',
    question: 'Bagaimana harga produk kami dibandingkan toko sejenis?',
    options: ['Sangat Kompetitif', 'Masuk Akal', 'Agak Mahal', 'Terlalu Mahal'],
    required: true,
  },
  {
    id: 9,
    type: 'card',
    question: 'Fitur apa yang paling berguna?',
    options: ['Pencarian Produk', 'Kategori Produk', 'Gambar Produk', 'Deskripsi Produk', 'Informasi Harga', 'Keranjang Belanja', 'Lainnya'],
    required: true,
  },
  {
    id: 10,
    type: 'textarea',
    question: 'Fitur tambahan apa yang Anda inginkan di website kami?',
    required: false,
  },
  {
    id: 11,
    type: 'scale',
    question: 'Seberapa mungkin Anda merekomendasikan website kami ke orang lain?',
    required: true,
    scaleLabels: { min: 'Sangat Tidak Mungkin', max: 'Sangat Mungkin' }
  },
  {
    id: 12,
    type: 'textarea',
    question: 'Apa yang bisa kami lakukan untuk meningkatkan pengalaman berbelanja Anda?',
    required: false,
  },
];

// Custom Completion Popup Component with Confetti
const CompletionPopup = ({ onClose }: { onClose: () => void }) => {
  useEffect(() => {
    // Load and trigger confetti
    const script = document.createElement('script');
    script.src = '/confetti.min.js';
    script.onload = () => {
      // Create a temporary element for confetti
      const confettiDiv = document.createElement('div');
      confettiDiv.id = 'confetti-trigger';
      confettiDiv.style.position = 'fixed';
      confettiDiv.style.top = '50%';
      confettiDiv.style.left = '50%';
      confettiDiv.style.width = '1px';
      confettiDiv.style.height = '1px';
      confettiDiv.style.pointerEvents = 'none';
      document.body.appendChild(confettiDiv);

      // @ts-ignore
      if (window.Confetti) {
        // @ts-ignore
        const confetti = new window.Confetti('confetti-trigger');
        confetti.setCount(150);
        confetti.setSize(1);
        confetti.setPower(30);
        confetti.setFade(false);
        confetti.destroyTarget(false);
        
        // Trigger confetti multiple times for better effect
        setTimeout(() => confettiDiv.click(), 100);
        setTimeout(() => confettiDiv.click(), 300);
        setTimeout(() => confettiDiv.click(), 500);
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(confettiDiv);
        }, 3000);
      }
    };
    document.head.appendChild(script);

    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    
    return () => {
      clearTimeout(timer);
      // Clean up script
      document.head.removeChild(script);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn px-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md mx-4 text-center animate-slideUp shadow-2xl">
        <div className="animate-bounce mb-4">
          <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mx-auto" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Terima Kasih! 🎉</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          Survei Anda telah berhasil disimpan. Masukan Anda sangat berharga untuk kami!
        </p>
        <div className="flex justify-center">
          <Sparkles className="h-5 w-5 text-orange-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

// Linear Scale Component
const LinearScale = ({ value, onChange, min = 1, max = 5, minLabel, maxLabel }: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  minLabel: string;
  maxLabel: string;
}) => {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
        <span className="text-left max-w-[45%]">{minLabel}</span>
        <span className="text-right max-w-[45%]">{maxLabel}</span>
      </div>
      <div className="flex justify-between items-center gap-1 sm:gap-2">
        {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            onMouseEnter={() => setHoveredValue(num)}
            onMouseLeave={() => setHoveredValue(null)}
            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 transition-all duration-200 flex items-center justify-center font-bold text-sm sm:text-lg
              ${value === num 
                ? 'bg-orange-500 border-orange-500 text-white scale-110 shadow-lg' 
                : hoveredValue === num
                ? 'border-orange-300 bg-orange-50 scale-105'
                : 'border-gray-300 hover:border-orange-200 hover:bg-orange-25'
              }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};

// Card Style Answer Component
const CardAnswers = ({ options, value, onChange, multiple = false }: {
  options: string[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
}) => {
  const handleCardClick = (option: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(option)) {
        onChange(currentValues.filter(item => item !== option));
      } else {
        onChange([...currentValues, option]);
      }
    } else {
      onChange(option);
    }
  };

  const isSelected = (option: string) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(option);
    }
    return value === option;
  };

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
      {options.map((option) => (
        <Card
          key={option}
          className={`p-3 sm:p-4 cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
            isSelected(option)
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl scale-105'
              : 'bg-white hover:bg-orange-50 border-2 hover:border-orange-200'
          }`}
          onClick={() => handleCardClick(option)}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-center flex-1 text-sm sm:text-base leading-snug">{option}</span>
            {isSelected(option) && (
              <Check className="h-4 w-4 sm:h-5 sm:w-5 ml-2 animate-bounce flex-shrink-0" />
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default function Survey() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [showCompletion, setShowCompletion] = useState(false);
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const progress = ((currentStep + 1) / surveyQuestions.length) * 100;

  // Sound effect function
  const playSound = () => {
    const sounds = [
      '/audio/Bubble.mp3',
      '/audio/Bubble 2.mp3', 
      '/audio/Bubble 3.mp3',
      '/audio/Bubble 4.mp3'
    ];
    const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
    const audio = new Audio(randomSound);
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Ignore errors if audio fails
  };

  const handleAnswer = (questionId: number, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    if (!questionAnswered) {
      setQuestionAnswered(true);
      playSound();
    }
  };

  // Special handler for checkboxes to play sound on every interaction
  const handleCheckboxAnswer = (questionId: number, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    playSound(); // Always play sound for checkbox interactions
  };

  const handleNext = () => {
    if (currentStep < surveyQuestions.length - 1) {
      setCurrentStep(prev => prev + 1);
      setQuestionAnswered(false);
      playSound();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setQuestionAnswered(false);
      playSound();
    }
  };

  const handleSubmit = async () => {
    try {
      // Debug: Log all answers before processing
      console.log('All answers:', answers);
      console.log('Answer 9 (UsefulFeatures):', answers[9]);
      console.log('Is answer 9 an array?', Array.isArray(answers[9]));
      
      // Transform answers into the expected format with exact column names
      const formattedData = {
        Name: answers[1] || 'Anonymous',
        FoundThrough: answers[2] || '',
        NavigationEase: answers[3] || '',
        ProductFinding: answers[4] || '',
        LoadingSpeed: answers[5] || '',
        ProductInfoSatisfaction: answers[6] || '',
        CheckoutProcess: answers[7] || '',
        PriceComparison: answers[8] || '',
        UsefulFeatures: Array.isArray(answers[9]) ? answers[9].join(', ') : '',
        DesiredFeatures: answers[10] || '',
        RecommendLikelihood: answers[11] || '',
        ImprovementSuggestions: answers[12] || ''
      };

      // Debug: Log formatted data
      console.log('Formatted data:', formattedData);
      console.log('UsefulFeatures value:', formattedData.UsefulFeatures);

      // Your Google Apps Script Web App URL
      const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxeEysy_pAP8Fofda7quz07j6OIxPcptmb6NxLq0nGpuC5mDyTGCQNBSaSP7fjB1Gu2/exec';
      
      // Create URL-encoded form data
      const formData = new URLSearchParams();
      Object.entries(formattedData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      // Debug: Log form data
      console.log('Form data string:', formData.toString());

      // Send as form data with no-cors mode
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });

      // Show custom completion popup instead of alert
      setShowCompletion(true);
      
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('Maaf, terjadi kesalahan. Silakan coba lagi nanti.');
    }
  };

  const currentQuestion = surveyQuestions[currentStep];

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'text':
        return (
          <Input
            type="text"
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
            placeholder={currentQuestion.id === 1 ? "Contoh: Budi, PT. Tidurlah" : "Ketik jawaban Anda di sini"}
            className="w-full transition-all duration-200 focus:scale-[1.02] text-sm sm:text-base"
          />
        );
      case 'radio':
        return (
          <RadioGroup
            value={answers[currentQuestion.id] || ''}
            onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
            className="space-y-3"
          >
            {currentQuestion.options?.map((option) => (
              <div key={option} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-orange-50 transition-colors duration-200">
                <RadioGroupItem value={option} id={option} className="text-orange-500" />
                <Label htmlFor={option} className="cursor-pointer flex-1 text-sm sm:text-base">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'card':
        // Check if this is question 9 (multiple selection) or others (single selection)
        const isMultiple = currentQuestion.id === 9;
        return (
          <CardAnswers
            options={currentQuestion.options || []}
            value={answers[currentQuestion.id] || (isMultiple ? [] : '')}
            onChange={(value) => {
              if (isMultiple) {
                handleCheckboxAnswer(currentQuestion.id, value);
              } else {
                handleAnswer(currentQuestion.id, value);
              }
            }}
            multiple={isMultiple}
          />
        );
      case 'scale':
        return (
          <LinearScale
            value={answers[currentQuestion.id] || 0}
            onChange={(value) => handleAnswer(currentQuestion.id, value)}
            minLabel={currentQuestion.scaleLabels?.min || '1'}
            maxLabel={currentQuestion.scaleLabels?.max || '5'}
          />
        );
      case 'checkbox':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <div key={option} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-orange-50 transition-colors duration-200">
                <input
                  type="checkbox"
                  id={option}
                  checked={Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].includes(option)}
                  onChange={(e) => {
                    const currentAnswers = Array.isArray(answers[currentQuestion.id]) ? answers[currentQuestion.id] : [];
                    if (e.target.checked) {
                      handleCheckboxAnswer(currentQuestion.id, [...currentAnswers, option]);
                    } else {
                      handleCheckboxAnswer(currentQuestion.id, currentAnswers.filter(item => item !== option));
                    }
                  }}
                  className="h-4 w-4 rounded border border-gray-300 text-orange-500 focus:ring-orange-500 transition-transform duration-200 hover:scale-110"
                />
                <Label htmlFor={option} className="cursor-pointer flex-1 text-sm sm:text-base">{option}</Label>
              </div>
            ))}
          </div>
        );
      case 'textarea':
        return (
          <Textarea
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
            placeholder="Ketik jawaban Anda di sini"
            className="w-full h-24 sm:h-32 transition-all duration-200 focus:scale-[1.02] text-sm sm:text-base"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-md bg-white min-h-screen px-4 pb-16">
        <SurveyHeader />
        
        <div className="p-3">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 animate-fadeIn">
              Survei Kepuasan Pelanggan
            </h1>
            <p className="text-sm text-gray-600 animate-fadeIn animation-delay-200">
              Bantu kami meningkatkan layanan dengan mengisi survei singkat ini. Isi survei dengan jujur dan sesuai keadaan Anda.
            </p>
          </div>

          <div className="mb-6">
            <Progress value={progress} className="w-full h-2 transition-all duration-500" />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Pertanyaan {currentStep + 1} dari {surveyQuestions.length}
            </p>
          </div>

          <Card className={`p-4 shadow-xl rounded-2xl bg-white transition-all duration-500 transform hover:shadow-2xl ${questionAnswered ? 'animate-shimmer' : ''}`}>
            <div className="space-y-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 animate-slideIn leading-snug">
                  {currentQuestion.question}
                </h2>
                {currentQuestion.id === 9 && (
                  <p className="text-sm text-orange-500 font-medium mb-4">
                    (Boleh pilih lebih dari 1)
                  </p>
                )}
                <div className="animate-fadeIn animation-delay-300">
                  {renderQuestion()}
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <Button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  variant="outline"
                  className="transition-all duration-200 hover:scale-105 active:scale-95 w-full text-sm"
                >
                  Sebelumnya
                </Button>
                
                {currentStep === surveyQuestions.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg w-full text-sm"
                  >
                    Kirim Survei ✨
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg w-full text-sm"
                  >
                    Selanjutnya
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {showCompletion && (
          <CompletionPopup onClose={() => {
            setShowCompletion(false);
            window.location.href = '/';
          }} />
        )}

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px) scale(0.9); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          
          @keyframes shimmer {
            0% { box-shadow: 0 0 0 0 rgba(251, 146, 60, 0.4); }
            50% { box-shadow: 0 0 20px 10px rgba(251, 146, 60, 0.2); }
            100% { box-shadow: 0 0 0 0 rgba(251, 146, 60, 0.4); }
          }
          
          .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
          .animate-slideIn { animation: slideIn 0.6s ease-out; }
          .animate-slideUp { animation: slideUp 0.4s ease-out; }
          .animate-shimmer { animation: shimmer 1s ease-in-out; }
          .animation-delay-200 { animation-delay: 0.2s; }
          .animation-delay-300 { animation-delay: 0.3s; }
        `}</style>
      </div>
    </div>
  );
} 