import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendFreetalkMessage, ChatMessage } from '@/lib/claude';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  Volume2,
  VolumeX,
  Settings,
  Sparkles,
  RefreshCw,
  ChevronLeft,
  Send,
  Camera,
  BookOpen,
  MessageCircle,
  X,
  Check,
  Loader2,
  Wand2,
  Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 대화 모드 타입
type ChatMode = 'free-talk' | 'scenario' | 'pronunciation' | 'simulation';

// 메시지 타입
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
  timestamp: Date;
}

// 시나리오 타입
interface Scenario {
  id: string;
  title: string;
  titleKo: string;
  description: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// 아바타 설정 타입
interface AvatarSettings {
  backgroundImage: string;
  voiceType: 'male' | 'female';
  voiceSpeed: number;
  language: string;
}

// 프레젠터 타입
interface Presenter {
  id: string;
  name: string;
  imageUrl: string;
  gender: 'male' | 'female';
}

// AI 튜터 프레젠터 목록
const defaultPresenters: Presenter[] = [
  {
    id: 'emma',
    name: 'Emma',
    imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    gender: 'female',
  },
  {
    id: 'sophia',
    name: 'Sophia',
    imageUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    gender: 'female',
  },
  {
    id: 'james',
    name: 'James',
    imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    gender: 'male',
  },
  {
    id: 'michael',
    name: 'Michael',
    imageUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
    gender: 'male',
  },
];

// 샘플 시나리오
const scenarios: Scenario[] = [
  { id: '1', title: 'Airport Check-in', titleKo: '공항 체크인', description: '비행기 체크인 상황', icon: '✈️', difficulty: 'easy' },
  { id: '2', title: 'Restaurant Order', titleKo: '레스토랑 주문', description: '음식 주문하기', icon: '🍽️', difficulty: 'easy' },
  { id: '3', title: 'Job Interview', titleKo: '취업 면접', description: '영어 면접 연습', icon: '💼', difficulty: 'hard' },
  { id: '4', title: 'Hotel Check-in', titleKo: '호텔 체크인', description: '호텔 투숙 상황', icon: '🏨', difficulty: 'easy' },
  { id: '5', title: 'Shopping', titleKo: '쇼핑하기', description: '옷가게에서 쇼핑', icon: '🛍️', difficulty: 'medium' },
  { id: '6', title: 'Doctor Visit', titleKo: '병원 방문', description: '증상 설명하기', icon: '🏥', difficulty: 'medium' },
];

// 배경 옵션
const backgrounds = [
  { id: 'office', name: '사무실', color: 'from-slate-700 to-slate-900' },
  { id: 'cafe', name: '카페', color: 'from-amber-800 to-amber-950' },
  { id: 'airport', name: '공항', color: 'from-blue-800 to-blue-950' },
  { id: 'restaurant', name: '레스토랑', color: 'from-red-800 to-red-950' },
  { id: 'park', name: '공원', color: 'from-green-700 to-green-900' },
  { id: 'home', name: '집', color: 'from-orange-800 to-orange-950' },
];

export default function AvatarChatPage() {
  const navigate = useNavigate();
  const [chatMode, setChatMode] = useState<ChatMode>('free-talk');
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showScenarios, setShowScenarios] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);
  const [simulationInput, setSimulationInput] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [avatarSpeaking, setAvatarSpeaking] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [avatarSettings, setAvatarSettings] = useState<AvatarSettings>({
    backgroundImage: 'office',
    voiceType: 'female',
    voiceSpeed: 1.0,
    language: 'en',
  });
  const [hasAvatar, setHasAvatar] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [selectedPresenter, setSelectedPresenter] = useState<Presenter>(defaultPresenters[0]);
  const [mouthOpen, setMouthOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mouthAnimationRef = useRef<number | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const [interimTranscript, setInterimTranscript] = useState('');

  // messages 상태를 ref에 동기화
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // 메시지 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 입 애니메이션 정리
  useEffect(() => {
    return () => {
      if (mouthAnimationRef.current) {
        clearInterval(mouthAnimationRef.current);
      }
    };
  }, []);

  // 음성인식 초기화
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // 한 문장씩 인식
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // 녹음 시작
  const startRecording = () => {
    if (!recognitionRef.current) {
      alert('음성인식이 지원되지 않는 브라우저입니다. Chrome 브라우저를 사용해주세요.');
      return;
    }

    const recognition = recognitionRef.current;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim);

      if (final) {
        setInterimTranscript('');
        setIsRecording(false);
        handleUserMessage(final.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      setInterimTranscript('');
      if (event.error === 'not-allowed') {
        alert('마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimTranscript('');
    };

    setInterimTranscript('');
    setIsRecording(true);
    recognition.start();
  };

  // 녹음 중지
  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsRecording(false);
    setInterimTranscript('');
  };

  // 녹음 토글
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // 입 애니메이션 시작
  const startMouthAnimation = () => {
    if (mouthAnimationRef.current) {
      clearInterval(mouthAnimationRef.current);
    }
    mouthAnimationRef.current = window.setInterval(() => {
      setMouthOpen(prev => !prev);
    }, 150);
  };

  // 입 애니메이션 중지
  const stopMouthAnimation = () => {
    if (mouthAnimationRef.current) {
      clearInterval(mouthAnimationRef.current);
      mouthAnimationRef.current = null;
    }
    setMouthOpen(false);
  };

  // TTS로 음성 재생
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // 이전 음성 중지
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = avatarSettings.language === 'ja' ? 'ja-JP' :
                       avatarSettings.language === 'zh' ? 'zh-CN' :
                       avatarSettings.language === 'ko' ? 'ko-KR' : 'en-US';
      utterance.rate = avatarSettings.voiceSpeed;

      utterance.onstart = () => {
        startMouthAnimation();
      };

      utterance.onend = () => {
        stopMouthAnimation();
        setAvatarSpeaking(false);
        setCurrentSubtitle('');
      };

      utterance.onerror = () => {
        stopMouthAnimation();
        setAvatarSpeaking(false);
        setCurrentSubtitle('');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // TTS 미지원 시 타이머로 종료
      startMouthAnimation();
      setTimeout(() => {
        stopMouthAnimation();
        setAvatarSpeaking(false);
        setCurrentSubtitle('');
      }, 3000);
    }
  };

  // 아바타 말하기
  const avatarSpeak = (text: string) => {
    setAvatarSpeaking(true);
    setCurrentSubtitle(text);
    if (!isMuted) {
      speakText(text);
    } else {
      // 음소거 시 애니메이션만
      startMouthAnimation();
      setTimeout(() => {
        stopMouthAnimation();
        setAvatarSpeaking(false);
        setCurrentSubtitle('');
      }, 3000);
    }
  };

  // 사용자 메시지 처리 및 AI 응답
  const handleUserMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    // 메시지 기록에 추가 (ref에서 최신 상태 가져오기)
    const currentMessages = messagesRef.current;
    const updatedMessages = [...currentMessages, userMessage];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      // Claude API에 대화 기록 전달
      const chatHistory: ChatMessage[] = updatedMessages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const aiResponseContent = await sendFreetalkMessage(chatHistory);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponseContent,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      avatarSpeak(aiResponse.content);
    } catch (error) {
      console.error('AI 응답 실패:', error);
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I couldn't process that. Could you please try again?",
        translation: "죄송해요, 처리하지 못했어요. 다시 말씀해 주시겠어요?",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackResponse]);
      avatarSpeak(fallbackResponse.content);
    } finally {
      setIsTyping(false);
    }
  };

  // 텍스트 메시지 전송
  const sendTextMessage = () => {
    if (!inputText.trim()) return;
    handleUserMessage(inputText);
    setInputText('');
  };

  // 파일을 Base64로 변환
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // 내 사진으로 아바타 생성
  const generateAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsGeneratingAvatar(true);

    try {
      const base64Image = await fileToBase64(file);
      setSelectedPresenter({
        id: 'custom',
        name: '나',
        imageUrl: base64Image,
        gender: 'female',
      });
      setHasAvatar(true);
    } catch (error) {
      console.error('이미지 처리 실패:', error);
      alert('이미지 처리에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  // 시뮬레이션 시작
  const startSimulation = () => {
    if (!simulationInput.trim()) return;
    setShowSimulation(false);
    setChatMode('simulation');

    setIsTyping(true);
    setTimeout(() => {
      const setupMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Perfect! Let's simulate: "${simulationInput}". I'll be the person you're talking to. Let's begin!`,
        translation: `좋아요! "${simulationInput}" 상황을 시뮬레이션해볼게요. 제가 대화 상대가 될게요. 시작해볼까요!`,
        timestamp: new Date(),
      };
      setMessages([setupMessage]);
      setIsTyping(false);
      avatarSpeak(setupMessage.content);
    }, 1000);
  };

  const currentBackground = backgrounds.find(bg => bg.id === avatarSettings.backgroundImage);

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* 왼쪽: 아바타 영역 */}
      <div className="flex-1 relative">
        {/* 배경 */}
        <div className={`absolute inset-0 bg-gradient-to-br ${currentBackground?.color || 'from-slate-700 to-slate-900'}`}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
        </div>

        {/* 상단 헤더 */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>뒤로</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-white text-sm font-medium">
                  {chatMode === 'free-talk' && '💬 프리토킹'}
                  {chatMode === 'scenario' && `🎭 ${selectedScenario?.titleKo || '시나리오'}`}
                  {chatMode === 'pronunciation' && '🎤 발음 교정'}
                  {chatMode === 'simulation' && '🎬 상황 시뮬레이션'}
                </span>
              </div>

              <button
                onClick={() => setShowSettings(true)}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 아바타 영역 */}
        <div className="absolute inset-0 flex items-center justify-center">
          {!hasAvatar ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-8 max-w-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-2">AI 튜터를 선택하세요</h2>
              <p className="text-white/60 mb-8">대화할 AI 아바타를 선택해주세요</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {defaultPresenters.map((presenter) => (
                  <motion.button
                    key={presenter.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedPresenter(presenter)}
                    className={`relative rounded-2xl overflow-hidden border-4 transition-all ${
                      selectedPresenter.id === presenter.id
                        ? 'border-cyan-400 shadow-lg shadow-cyan-400/30'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <img
                      src={presenter.imageUrl}
                      alt={presenter.name}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <p className="text-white font-medium">{presenter.name}</p>
                    </div>
                    {selectedPresenter.id === presenter.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="mb-6">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={generateAvatar}
                />
                {isGeneratingAvatar ? (
                  <div className="flex items-center justify-center gap-2 text-cyan-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">사진 처리 중...</span>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 text-white/60 hover:text-white text-sm transition-colors mx-auto"
                  >
                    <Camera className="w-4 h-4" />
                    내 사진으로 아바타 만들기
                  </button>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setHasAvatar(true)}
                className="flex items-center justify-center gap-2 py-4 px-8 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-semibold mx-auto"
              >
                <Play className="w-5 h-5" />
                {selectedPresenter.name}와 대화 시작
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              {/* 아바타 글로우 효과 */}
              {avatarSpeaking && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-cyan-400/30 rounded-3xl blur-3xl"
                />
              )}

              {/* 아바타 컨테이너 */}
              <div className={`relative w-72 h-72 md:w-80 md:h-80 rounded-3xl overflow-hidden border-4 ${avatarSpeaking ? 'border-cyan-400 shadow-lg shadow-cyan-400/50' : 'border-white/30'} transition-all duration-300 shadow-2xl`}>
                <img
                  src={selectedPresenter.imageUrl}
                  alt={selectedPresenter.name}
                  className="w-full h-full object-cover"
                />

                {/* 말하기 오버레이 애니메이션 */}
                {avatarSpeaking && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* 음성 파동 효과 */}
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0, 0.2] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0 border-4 border-cyan-400 rounded-3xl"
                    />

                    {/* 입 애니메이션 오버레이 */}
                    <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2">
                      <motion.div
                        animate={{
                          scaleY: mouthOpen ? 1.3 : 0.8,
                          scaleX: mouthOpen ? 0.9 : 1.1
                        }}
                        transition={{ duration: 0.1 }}
                        className="w-8 h-4 bg-black/0 rounded-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 말하기 상태 표시 */}
              <AnimatePresence>
                {avatarSpeaking && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2.5 rounded-full shadow-lg"
                  >
                    {/* 음성 파형 애니메이션 */}
                    <div className="flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i}
                          animate={{
                            height: mouthOpen ? [4, 20, 4] : [4, 8, 4]
                          }}
                          transition={{
                            duration: 0.3,
                            repeat: Infinity,
                            delay: i * 0.08,
                          }}
                          className="w-1 bg-white rounded-full"
                        />
                      ))}
                    </div>
                    <span className="text-white text-sm font-medium ml-1">Speaking...</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 아바타 이름 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center"
              >
                <p className="text-white font-semibold text-lg">{selectedPresenter.name}</p>
                <p className="text-white/60 text-sm">AI Language Tutor</p>
              </motion.div>

              {/* 아바타 변경 버튼 */}
              <button
                onClick={() => setHasAvatar(false)}
                className="absolute -top-2 -right-2 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-white" />
              </button>
            </motion.div>
          )}
        </div>

        {/* 자막 영역 */}
        <AnimatePresence>
          {showSubtitles && currentSubtitle && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-32 left-0 right-0 flex justify-center px-4"
            >
              <div className="bg-black/70 backdrop-blur-sm px-6 py-3 rounded-xl max-w-2xl">
                <p className="text-white text-lg text-center">{currentSubtitle}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 하단 컨트롤 */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isMuted ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6 text-white" />
              ) : (
                <Volume2 className="w-6 h-6 text-white" />
              )}
            </button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleRecording}
              disabled={!hasAvatar}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                isRecording
                  ? 'bg-red-500 animate-pulse shadow-red-500/50'
                  : 'bg-gradient-to-r from-cyan-500 to-purple-500 shadow-purple-500/30'
              } ${!hasAvatar && 'opacity-50 cursor-not-allowed'}`}
            >
              {isRecording ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </motion.button>

            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                !isVideoOn ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {isVideoOn ? (
                <Video className="w-6 h-6 text-white" />
              ) : (
                <VideoOff className="w-6 h-6 text-white" />
              )}
            </button>
          </div>

          <p className="text-center text-white/60 text-sm mt-4">
            {isRecording ? '말씀하세요... (음성 인식 중)' : '마이크 버튼을 눌러 말하기'}
          </p>

          {/* 실시간 음성인식 텍스트 표시 */}
          <AnimatePresence>
            {interimTranscript && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-3 text-center"
              >
                <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <p className="text-white text-sm italic">"{interimTranscript}"</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 모드 선택 버튼들 */}
        <div className="absolute bottom-32 left-4 flex flex-col gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setChatMode('free-talk')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              chatMode === 'free-talk'
                ? 'bg-cyan-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            프리토킹
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowScenarios(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              chatMode === 'scenario'
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            시나리오
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSimulation(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              chatMode === 'simulation'
                ? 'bg-orange-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            상황 시뮬레이션
          </motion.button>
        </div>
      </div>

      {/* 오른쪽: 채팅 패널 */}
      <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">대화 기록</h3>
            <button
              onClick={() => setShowSubtitles(!showSubtitles)}
              className={`text-sm px-3 py-1 rounded-full transition-colors ${
                showSubtitles ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-700 text-gray-400'
              }`}
            >
              자막 {showSubtitles ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">아직 대화가 없습니다</p>
              <p className="text-gray-600 text-sm mt-1">마이크 버튼을 눌러 대화를 시작하세요</p>
            </div>
          ) : (
            messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.translation && message.role === 'assistant' && (
                    <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-600">
                      {message.translation}
                    </p>
                  )}
                </div>
              </motion.div>
            ))
          )}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gray-700 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
              placeholder="텍스트로 입력하기..."
              className="flex-1 bg-gray-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500"
            />
            <button
              onClick={sendTextMessage}
              disabled={!inputText.trim()}
              className="w-12 h-12 rounded-xl bg-cyan-500 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-600 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 시나리오 선택 모달 */}
      <AnimatePresence>
        {showScenarios && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowScenarios(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">시나리오 선택</h3>
                <button
                  onClick={() => setShowScenarios(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {scenarios.map((scenario) => (
                  <motion.button
                    key={scenario.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedScenario(scenario);
                      setChatMode('scenario');
                      setShowScenarios(false);
                      const welcomeMsg: Message = {
                        id: Date.now().toString(),
                        role: 'assistant',
                        content: `Welcome! Let's practice "${scenario.title}". I'll be the staff member. How can I help you?`,
                        translation: `환영합니다! "${scenario.titleKo}" 상황을 연습해봐요. 제가 직원 역할을 할게요. 무엇을 도와드릴까요?`,
                        timestamp: new Date(),
                      };
                      setMessages([welcomeMsg]);
                      setTimeout(() => avatarSpeak(welcomeMsg.content), 500);
                    }}
                    className="p-4 bg-gray-700 hover:bg-gray-600 rounded-xl text-left transition-colors"
                  >
                    <div className="text-3xl mb-2">{scenario.icon}</div>
                    <div className="text-white font-medium">{scenario.titleKo}</div>
                    <div className="text-gray-400 text-sm">{scenario.title}</div>
                    <div className={`mt-2 text-xs px-2 py-1 rounded-full inline-block ${
                      scenario.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                      scenario.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {scenario.difficulty === 'easy' ? '쉬움' : scenario.difficulty === 'medium' ? '보통' : '어려움'}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 상황 시뮬레이션 모달 */}
      <AnimatePresence>
        {showSimulation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSimulation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center">
                    <Wand2 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">상황 시뮬레이션</h3>
                </div>
                <button
                  onClick={() => setShowSimulation(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-gray-400 mb-4">
                어떤 상황을 연습하고 싶으세요? 상상하는 상황을 자유롭게 설명해주세요!
              </p>

              <div className="space-y-3 mb-4">
                <p className="text-sm text-gray-500">예시:</p>
                {[
                  '도쿄 라멘집에서 주문하고 싶어요',
                  '뉴욕에서 택시 타고 호텔까지 가고 싶어요',
                  '영어 면접에서 자기소개를 해야해요',
                  '파리 약국에서 두통약을 사고 싶어요',
                ].map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setSimulationInput(example)}
                    className="block w-full text-left text-sm text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
                  >
                    "{example}"
                  </button>
                ))}
              </div>

              <textarea
                value={simulationInput}
                onChange={(e) => setSimulationInput(e.target.value)}
                placeholder="연습하고 싶은 상황을 설명해주세요..."
                className="w-full h-24 bg-gray-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500 resize-none"
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startSimulation}
                disabled={!simulationInput.trim()}
                className="w-full mt-4 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                시뮬레이션 시작
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 설정 모달 */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">아바타 설정</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <label className="text-white font-medium mb-3 block">배경</label>
                <div className="grid grid-cols-3 gap-2">
                  {backgrounds.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setAvatarSettings({ ...avatarSettings, backgroundImage: bg.id })}
                      className={`h-16 rounded-lg bg-gradient-to-br ${bg.color} flex items-center justify-center text-white text-sm font-medium transition-all ${
                        avatarSettings.backgroundImage === bg.id
                          ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-gray-800'
                          : ''
                      }`}
                    >
                      {bg.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="text-white font-medium mb-3 block">음성 속도: {avatarSettings.voiceSpeed}x</label>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={avatarSettings.voiceSpeed}
                  onChange={(e) => setAvatarSettings({ ...avatarSettings, voiceSpeed: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>느리게</span>
                  <span>보통</span>
                  <span>빠르게</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setHasAvatar(false);
                  setShowSettings(false);
                }}
                className="w-full py-3 bg-gray-700 text-gray-300 rounded-xl font-medium hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                아바타 다시 선택
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
