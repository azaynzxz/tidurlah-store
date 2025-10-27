import { useState, useEffect, useRef } from "react";
import { responseData, subMenus } from "@/data/chatbot/responses";

export interface Message {
  text: string;
  isBot: boolean;
  isWhatsAppPrompt?: boolean;
  isTyping?: boolean;
  showSuggestions?: boolean;
  showSubMenu?: string | null;
  showNameForm?: boolean;
  collectedName?: string;
  collectedInstansi?: string;
}

interface UseChatBotReturn {
  messages: Message[];
  inputText: string;
  isTyping: boolean;
  showBubble: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSendMessage: () => void;
  handleSuggestionClick: (keyword: string) => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const useChatBot = (isOpen: boolean): UseChatBotReturn => {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Halo! Ada yang bisa saya bantu?", isBot: true }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [collectingName, setCollectingName] = useState(false);
  const [collectingInstansi, setCollectingInstansi] = useState(false);
  const [userName, setUserName] = useState("");
  const [userInstansi, setUserInstansi] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const bubbleTimeoutRef = useRef<NodeJS.Timeout>();
  const showDelayRef = useRef<NodeJS.Timeout>();
  const hasPlayedDingRef = useRef(false);
  
  // Play sound helper
  const playSound = (soundPath: string, volume: number = 0.3) => {
    try {
      const audio = new Audio(soundPath);
      audio.volume = volume;
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };
  
  // Show bubble after 2 seconds of inactivity
  useEffect(() => {
    if (isOpen) {
      setShowBubble(false);
      return;
    }
    
    // Clear any existing timers
    if (showDelayRef.current) {
      clearTimeout(showDelayRef.current);
    }
    if (bubbleTimeoutRef.current) {
      clearTimeout(bubbleTimeoutRef.current);
    }
    
    // Wait 2 seconds then show bubble
    showDelayRef.current = setTimeout(() => {
      setShowBubble(true);
      // Play ding sound only once (on first appearance)
      if (!hasPlayedDingRef.current) {
        playSound('/audio/ding.mp3', 0.4);
        hasPlayedDingRef.current = true;
      }
      
      // Hide after 5 more seconds
      bubbleTimeoutRef.current = setTimeout(() => {
        setShowBubble(false);
      }, 5000);
    }, 2000);
    
    return () => {
      if (showDelayRef.current) {
        clearTimeout(showDelayRef.current);
      }
      if (bubbleTimeoutRef.current) {
        clearTimeout(bubbleTimeoutRef.current);
      }
    };
  }, [isOpen]);

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
    
    // Play sound when user sends a message
    playSound('/audio/sent-message.mp3', 0.25);
    
    // Handle name collection
    if (collectingName) {
      setUserName(inputText.trim());
      setCollectingName(false);
      setCollectingInstansi(true);
      setInputText("");
      
      // Add user message
      const updatedMessages = [...messages, { text: inputText, isBot: false }];
      setMessages(updatedMessages);
      
      // Show typing indicator
      setIsTyping(true);
      setMessages([...updatedMessages, { text: "", isBot: true, isTyping: true }]);
      
       // Wait and ask for instansi
       setTimeout(() => {
         setIsTyping(false);
         setMessages([
           ...updatedMessages,
           { 
             text: `Halo kak ${inputText}, dari instansi/kampus/perusahaan mana?\n(Opsional - bisa diisi 'Tidak ada' jika tidak memiliki)`, 
             isBot: true,
             showNameForm: true 
           }
         ]);
         // Play sound when bot responds
         playSound('/audio/incoming-message.mp3', 0.25);
       }, 1500);
      
      return;
    }
    
    // Handle instansi collection
    if (collectingInstansi) {
      const collectedInstansiValue = inputText.trim();
      setUserInstansi(collectedInstansiValue);
      setCollectingInstansi(false);
      setInputText("");
      
      // Add user message
      const updatedMessages = [...messages, { text: inputText, isBot: false }];
      setMessages(updatedMessages);
      
      // Show typing indicator
      setIsTyping(true);
      setMessages([...updatedMessages, { text: "", isBot: true, isTyping: true }]);
      
      // Wait and show WhatsApp button
      setTimeout(() => {
        setIsTyping(false);
        
        setMessages([
          ...updatedMessages,
          { 
            text: responseData["chat with admin"], 
            isBot: true, 
            isWhatsAppPrompt: true,
            collectedName: userName,
            collectedInstansi: collectedInstansiValue
          }
        ]);
        
        // Play sound when bot responds
        playSound('/audio/incoming-message.mp3', 0.25);
        
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
        }, 7000);
      }, 1500);
      
      return;
    }
    
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
          
          // Play sound when bot responds
          playSound('/audio/incoming-message.mp3', 0.25);
          
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
          }, 7000);
          
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
        
        // Play sound when bot responds
        playSound('/audio/incoming-message.mp3', 0.25);
        
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
        }, 7000);
      }
      
      setInputText("");
    }, 1500);
  };

  // Handle suggestion click
  const handleSuggestionClick = (keyword: string) => {
    // Special case for "chat with admin" - collect name first
    if (keyword === "chat with admin") {
      if (!userName) {
        setCollectingName(true);
        setMessages([
          ...messages,
          { text: "Chat dengan admin?", isBot: false },
          { 
            text: "Sebelum menghubungi admin, mohon beri tahu nama Anda:", 
            isBot: true,
            showNameForm: true 
          }
        ]);
        return;
      } else if (!userInstansi && !collectingInstansi) {
         setCollectingInstansi(true);
         setMessages([
           ...messages,
           { text: `Nama: ${userName}`, isBot: false },
           { 
             text: `Halo kak ${userName}, dari instansi/kampus/perusahaan mana?\n(Opsional - bisa diisi 'Tidak ada' jika tidak memiliki)`, 
             isBot: true,
             showNameForm: true 
           }
         ]);
         return;
      }
    }
    
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
        // Special case for "chat with admin" - show WhatsApp button with collected info
        if (keyword === "chat with admin") {
          const message = userInstansi && userInstansi.toLowerCase() !== 'tidak ada' && userInstansi.trim() !== ''
            ? `Halo Mincard, saya ${userName} dari ${userInstansi} ingin bertanya terkait produk tidurlah.com`
            : `Halo Mincard, saya ${userName} ingin bertanya terkait produk tidurlah.com`;
          
          setMessages([
            ...messagesWithoutTyping,
            { 
              text: response, 
              isBot: true, 
              isWhatsAppPrompt: true,
              collectedName: userName,
              collectedInstansi: userInstansi
            }
          ]);
          
          // Play sound when bot responds
          playSound('/audio/incoming-message.mp3', 0.25);
          
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
          }, 25000);
          
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
        
        // Play sound when bot responds
        playSound('/audio/incoming-message.mp3', 0.25);
        
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
        }, 7000);
      } else {
        // Fallback for suggestions that don't match exactly
        setMessages([
          ...messagesWithoutTyping,
          { text: "Maaf, informasi tidak ditemukan. Silakan ajukan pertanyaan yang lebih spesifik.", isBot: true }
        ]);
        
        // Play sound when bot responds
        playSound('/audio/incoming-message.mp3', 0.25);
        
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
        }, 7000);
      }
    }, 1500);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return {
    messages,
    inputText,
    isTyping,
    showBubble,
    messagesEndRef,
    handleInputChange,
    handleSendMessage,
    handleSuggestionClick,
    handleKeyPress,
  };
};
