import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/common/Header";

interface SurveyQuestion {
  id: number;
  type: 'text' | 'radio' | 'checkbox' | 'textarea' | 'scale' | 'card';
  question: string;
  options?: string[];
  required?: boolean;
  scaleLabels?: { min: string; max: string };
}

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

// Completion Popup Component
const CompletionPopup = ({ onClose }: { onClose: () => void }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/confetti.min.js';
    script.onload = () => {
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
        
        setTimeout(() => confettiDiv.click(), 100);
        setTimeout(() => confettiDiv.click(), 300);
        setTimeout(() => confettiDiv.click(), 500);
        
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
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fadeIn">
      <div className="bg-background rounded-2xl p-6 sm:p-8 lg:p-10 max-w-md mx-auto text-center animate-slideUp shadow-2xl border border-gray-200">
        <div className="animate-bounce mb-4">
          <CheckCircle className="h-16 w-16 sm:h-20 sm:w-20 text-green-500 mx-auto" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Terima Kasih! 🎉</h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">
          Survei Anda telah berhasil disimpan. Masukan Anda sangat berharga untuk kami!
        </p>
        <div className="flex justify-center">
          <Sparkles className="h-6 w-6 text-[#FF5E01] animate-pulse" />
        </div>
      </div>
    </div>
  );
};

// Linear Scale Component
const LinearScale = ({ value, onChange, min = 1, max = 5, minLabel, maxLabel, onSound }: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  minLabel: string;
  maxLabel: string;
  onSound: () => void;
}) => {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex justify-between text-xs sm:text-sm text-muted-foreground mb-2 lg:mb-4">
        <span className="text-left max-w-[45%]">{minLabel}</span>
        <span className="text-right max-w-[45%]">{maxLabel}</span>
      </div>
      <div className="flex justify-between items-center gap-2 sm:gap-3 lg:gap-4">
        {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => {
              onChange(num);
              onSound();
            }}
            onMouseEnter={() => setHoveredValue(num)}
            onMouseLeave={() => setHoveredValue(null)}
            className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full border-2 transition-all duration-200 flex items-center justify-center font-bold text-sm sm:text-base lg:text-lg
              ${value === num 
                ? 'bg-[#FF5E01] border-[#FF5E01] text-white scale-110 shadow-lg shadow-[#FF5E01]/30' 
                : hoveredValue === num
                ? 'border-[#FF5E01]/50 bg-[#FF5E01]/10 scale-105'
                : 'border-border hover:border-[#FF5E01]/30 hover:bg-muted'
              }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};

// Card Answers Component
const CardAnswers = ({ options, value, onChange, multiple = false, onSound }: {
  options: string[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  onSound: () => void;
}) => {
  const handleCardClick = (option: string) => {
    onSound();
    
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(option)) {
        onChange(currentValues.filter(v => v !== option));
      } else {
        onChange([...currentValues, option]);
      }
    } else {
      onChange(option);
    }
  };

  return (
    <div className={`grid gap-3 ${options.length <= 4 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} lg:grid-cols-2`}>
      {options.map((option) => {
        const isSelected = multiple 
          ? Array.isArray(value) && value.includes(option)
          : value === option;
        
        return (
          <div
            key={option}
            onClick={() => handleCardClick(option)}
            className={`p-4 lg:p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 relative overflow-hidden
              ${isSelected 
                ? multiple
                  ? 'border-[#FF5E01] bg-gradient-to-br from-[#FF5E01]/10 to-[#FF5E01]/5 shadow-md shadow-[#FF5E01]/20 scale-[1.02]'
                  : 'border-[#FF5E01] bg-[#FF5E01]/10 shadow-md shadow-[#FF5E01]/20 scale-[1.02]'
                : 'border-border hover:border-[#FF5E01]/50 hover:bg-muted hover:scale-[1.01]'
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base lg:text-lg font-medium text-foreground pr-2">{option}</span>
              {multiple && isSelected && (
                <div className="w-6 h-6 bg-[#FF5E01] rounded-full flex items-center justify-center flex-shrink-0 animate-bounce">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {isSelected && !multiple && (
              <div className="absolute inset-0 bg-[#FF5E01] opacity-10 animate-pulse rounded-xl"></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function Survey() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [showCompletion, setShowCompletion] = useState(false);
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const progress = ((currentStep + 1) / surveyQuestions.length) * 100;

  // Unified sound effect function - uses only Bubble.mp3
  const playSound = () => {
    const audio = new Audio('/audio/Bubble.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const handleAnswer = (questionId: number, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    if (!questionAnswered) {
      setQuestionAnswered(true);
    }
    playSound();
  };

  const handleAnswerSilent = (questionId: number, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    if (!questionAnswered) {
      setQuestionAnswered(true);
    }
  };

  const handleCheckboxAnswerSilent = (questionId: number, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleCheckboxAnswer = (questionId: number, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    playSound();
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
    playSound();
    try {
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

      const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxeEysy_pAP8Fofda7quz07j6OIxPcptmb6NxLq0nGpuC5mDyTGCQNBSaSP7fjB1Gu2/exec';
      
      const formData = new URLSearchParams();
      Object.entries(formattedData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });

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
            onChange={(e) => handleAnswerSilent(currentQuestion.id, e.target.value)}
            placeholder={currentQuestion.id === 1 ? "Contoh: Budi, PT. Tidurlah" : "Ketik jawaban Anda di sini"}
            className="w-full transition-all duration-200 focus:scale-[1.01] text-sm sm:text-base"
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
              <div key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors duration-200">
                <RadioGroupItem value={option} id={option} className="text-[#FF5E01]" />
                <Label htmlFor={option} className="cursor-pointer flex-1 text-sm sm:text-base">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'card':
        const isMultiple = currentQuestion.id === 9;
        return (
          <CardAnswers
            options={currentQuestion.options || []}
            value={answers[currentQuestion.id] || (isMultiple ? [] : '')}
            onChange={(value) => {
              if (isMultiple) {
                handleCheckboxAnswerSilent(currentQuestion.id, value);
              } else {
                handleAnswerSilent(currentQuestion.id, value);
              }
            }}
            multiple={isMultiple}
            onSound={playSound}
          />
        );
      case 'scale':
        return (
          <LinearScale
            value={answers[currentQuestion.id] || 0}
            onChange={(value) => handleAnswerSilent(currentQuestion.id, value)}
            minLabel={currentQuestion.scaleLabels?.min || '1'}
            maxLabel={currentQuestion.scaleLabels?.max || '5'}
            onSound={playSound}
          />
        );
      case 'checkbox':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <div key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors duration-200">
                <input
                  type="checkbox"
                  id={option}
                  checked={Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].includes(option)}
                  onChange={(e) => {
                    const currentAnswers = Array.isArray(answers[currentQuestion.id]) ? answers[currentQuestion.id] : [];
                    if (e.target.checked) {
                      handleCheckboxAnswer(currentQuestion.id, [...currentAnswers, option]);
                    } else {
                      handleCheckboxAnswer(currentQuestion.id, currentAnswers.filter((item: string) => item !== option));
                    }
                  }}
                  className="w-4 h-4 text-[#FF5E01] border-border rounded focus:ring-[#FF5E01]"
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
            onChange={(e) => handleAnswerSilent(currentQuestion.id, e.target.value)}
            placeholder="Ketik jawaban Anda di sini"
            className="w-full h-24 sm:h-32 lg:h-40 transition-all duration-200 focus:scale-[1.01] text-sm sm:text-base resize-none"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 min-h-0">
        <div className="container mx-auto max-w-md lg:max-w-3xl xl:max-w-4xl px-4 py-6 lg:py-12 pb-6 lg:pb-8">
          {/* Header Section */}
          <div className="text-center mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 animate-fadeIn">
              Survei Kepuasan Pelanggan
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto animate-fadeIn animation-delay-200">
              Bantu kami meningkatkan layanan dengan mengisi survei singkat ini. Isi survei dengan jujur dan sesuai keadaan Anda.
            </p>
          </div>

          {/* Progress Section */}
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                Pertanyaan {currentStep + 1} dari {surveyQuestions.length}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="w-full h-2.5 lg:h-3 transition-all duration-500" />
          </div>

          {/* Question Card */}
          <Card className={`p-4 sm:p-6 lg:p-8 shadow-lg rounded-2xl bg-card border transition-all duration-500 flex flex-col ${questionAnswered ? 'animate-shimmer' : ''}`} style={{ height: '600px' }}>
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto mb-6 lg:mb-8 pr-2">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground mb-4 lg:mb-6 animate-slideIn leading-relaxed">
                  {currentQuestion.question}
                </h2>
                {currentQuestion.id === 9 && (
                  <p className="text-sm sm:text-base text-[#FF5E01] font-medium mb-4 lg:mb-6 inline-flex items-center gap-2 px-3 py-1.5 bg-[#FF5E01]/10 rounded-lg">
                    <Sparkles className="h-4 w-4" />
                    Boleh pilih lebih dari 1
                  </p>
                )}
                <div className="animate-fadeIn animation-delay-300">
                  {renderQuestion()}
                </div>
              </div>

              {/* Navigation Buttons - Fixed at bottom */}
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 pt-4 lg:pt-6 border-t border-border flex-shrink-0">
                <Button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  variant="outline"
                  className="transition-all duration-200 hover:scale-105 active:scale-95 w-full sm:w-auto sm:flex-1 text-sm sm:text-base disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Sebelumnya
                </Button>
                
                {currentStep === surveyQuestions.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    className="bg-[#FF5E01] hover:bg-[#e54d00] text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-[#FF5E01]/30 w-full sm:w-auto sm:flex-1 text-sm sm:text-base"
                  >
                    Kirim Survei
                    <Sparkles className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="bg-[#FF5E01] hover:bg-[#e54d00] text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-[#FF5E01]/30 w-full sm:w-auto sm:flex-1 text-sm sm:text-base"
                  >
                    Selanjutnya
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
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
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        @keyframes shimmer {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 94, 1, 0.4); }
          50% { box-shadow: 0 0 20px 10px rgba(255, 94, 1, 0.2); }
        }
        
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        .animate-slideIn { animation: slideIn 0.6s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
}
