import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Volume2,
  ChevronRight,
  Music,
  Tv,
  BookOpen,
  Sparkles,
  Check,
  Zap,
} from 'lucide-react';
import { useFamilyStore, useGamificationStore } from '@/stores';
import {
  ANIME_CLIPS,
  JPOP_SONGS,
} from '@/data/jcontent';
import type { AnimeClip, JPopSong } from '@/data/jcontent';

type ContentType = 'anime' | 'jpop';
type ViewMode = 'list' | 'learning';

export default function JContentPage() {
  const navigate = useNavigate();
  const { currentMemberId } = useFamilyStore();
  const { addXp } = useGamificationStore();

  const [contentType, setContentType] = useState<ContentType>('anime');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedAnime, setSelectedAnime] = useState<AnimeClip | null>(null);
  const [selectedSong, setSelectedSong] = useState<JPopSong | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(true);
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  // Text-to-speech for Japanese
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Start learning anime
  const startAnimeLearning = (anime: AnimeClip) => {
    setSelectedAnime(anime);
    setSelectedSong(null);
    setCurrentIndex(0);
    setViewMode('learning');
  };

  // Start learning song
  const startSongLearning = (song: JPopSong) => {
    setSelectedSong(song);
    setSelectedAnime(null);
    setCurrentIndex(0);
    setViewMode('learning');
  };

  // Complete learning
  const completeLearning = () => {
    const id = selectedAnime?.id || selectedSong?.id;
    const xp = selectedAnime?.xpReward || selectedSong?.xpReward || 0;

    if (id && !completedItems.includes(id) && currentMemberId) {
      setCompletedItems([...completedItems, id]);
      addXp(currentMemberId, xp);
    }

    setViewMode('list');
    setSelectedAnime(null);
    setSelectedSong(null);
  };

  // Get difficulty label
  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
      default: return difficulty;
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-amber-100 text-amber-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Render content list
  const renderList = () => (
    <div className="flex-1 overflow-y-auto pb-20">
      {/* Tab Switcher */}
      <div className="p-4 pb-0">
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setContentType('anime')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              contentType === 'anime'
                ? 'bg-white shadow-sm text-primary-600'
                : 'text-gray-500'
            }`}
          >
            <Tv className="w-4 h-4" />
            애니메이션
          </button>
          <button
            onClick={() => setContentType('jpop')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              contentType === 'jpop'
                ? 'bg-white shadow-sm text-primary-600'
                : 'text-gray-500'
            }`}
          >
            <Music className="w-4 h-4" />
            J-Pop
          </button>
        </div>
      </div>

      {/* Content List */}
      <div className="p-4 space-y-3">
        {contentType === 'anime' ? (
          ANIME_CLIPS.map((anime, index) => (
            <motion.button
              key={anime.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => startAnimeLearning(anime)}
              className="w-full bg-white rounded-xl shadow-sm overflow-hidden text-left hover:shadow-md transition-all"
            >
              <div className="p-4 flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
                  <Tv className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground text-sm truncate">
                      {anime.title}
                    </h3>
                    {completedItems.includes(anime.id) && (
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-gray-500 text-xs truncate">{anime.anime}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${getDifficultyColor(anime.difficulty)}`}>
                      {getDifficultyLabel(anime.difficulty)}
                    </span>
                    <span className="text-[10px] text-yellow-600 flex items-center gap-0.5">
                      <Zap className="w-3 h-3" /> +{anime.xpReward} XP
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </motion.button>
          ))
        ) : (
          JPOP_SONGS.map((song, index) => (
            <motion.button
              key={song.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => startSongLearning(song)}
              className="w-full bg-white rounded-xl shadow-sm overflow-hidden text-left hover:shadow-md transition-all"
            >
              <div className="p-4 flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center text-white">
                  <Music className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground text-sm truncate">
                      {song.title}
                    </h3>
                    {completedItems.includes(song.id) && (
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-gray-500 text-xs truncate">{song.artist} - {song.songJapanese}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${getDifficultyColor(song.difficulty)}`}>
                      {getDifficultyLabel(song.difficulty)}
                    </span>
                    <span className="text-[10px] text-yellow-600 flex items-center gap-0.5">
                      <Zap className="w-3 h-3" /> +{song.xpReward} XP
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </motion.button>
          ))
        )}
      </div>
    </div>
  );

  // Render Anime Learning
  const renderAnimeLearning = () => {
    if (!selectedAnime) return null;

    const allItems = [
      ...selectedAnime.phrases.map((p, i) => ({ type: 'phrase' as const, data: p, index: i })),
      ...selectedAnime.dialogue.map((d, i) => ({ type: 'dialogue' as const, data: d, index: i })),
    ];
    const currentItem = allItems[currentIndex];
    const isLastItem = currentIndex >= allItems.length - 1;

    return (
      <div className="flex-1 flex flex-col">
        {/* Progress */}
        <div className="p-4 pb-0">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-500">
              {currentIndex + 1} / {allItems.length}
            </span>
            <span className="text-gray-500 text-xs">{selectedAnime.animeJapanese}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / allItems.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              {currentItem.type === 'phrase' ? (
                <div className="bg-white rounded-2xl shadow-lg p-6 flex-1 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6 text-rose-600" />
                  </div>
                  <button
                    onClick={() => speak(currentItem.data.japanese)}
                    className="mb-2 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <Volume2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <h2 className="text-3xl font-bold text-foreground mb-2 text-center">
                    {currentItem.data.japanese}
                  </h2>
                  <p className="text-gray-500 text-lg mb-2">{currentItem.data.reading}</p>
                  {showMeaning && (
                    <p className="text-primary-600 font-medium text-lg text-center">
                      {currentItem.data.meaning}
                    </p>
                  )}
                  {currentItem.data.usage && (
                    <p className="text-gray-400 text-sm mt-2 text-center italic">
                      {currentItem.data.usage}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-6 flex-1 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-xl">💬</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-2">
                    {currentItem.data.speaker}
                  </p>
                  <button
                    onClick={() => speak(currentItem.data.japanese)}
                    className="mb-2 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <Volume2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
                    {currentItem.data.japanese}
                  </h2>
                  <p className="text-gray-500 mb-2">{currentItem.data.reading}</p>
                  {showMeaning && (
                    <p className="text-primary-600 font-medium text-center">
                      {currentItem.data.meaning}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Toggle meaning */}
          <button
            onClick={() => setShowMeaning(!showMeaning)}
            className={`mx-auto mt-4 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              showMeaning ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {showMeaning ? '의미 숨기기' : '의미 보기'}
          </button>
        </div>

        {/* Navigation */}
        <div className="p-4 flex gap-3">
          <button
            onClick={() => speak(currentItem.type === 'phrase' ? currentItem.data.japanese : currentItem.data.japanese)}
            className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <Volume2 className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => {
              if (isLastItem) {
                completeLearning();
              } else {
                setCurrentIndex(currentIndex + 1);
              }
            }}
            className="flex-1 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
          >
            {isLastItem ? (
              <>
                <Check className="w-5 h-5" />
                완료
              </>
            ) : (
              <>
                다음
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Cultural Note */}
        {isLastItem && selectedAnime.culturalNote && (
          <div className="px-4 pb-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-amber-800 text-xs">문화 노트</span>
              </div>
              <p className="text-amber-700 text-xs">
                {selectedAnime.culturalNote}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Song Learning
  const renderSongLearning = () => {
    if (!selectedSong) return null;

    const allItems = [
      ...selectedSong.lyrics.map((l, i) => ({ type: 'lyrics' as const, data: l, index: i })),
      ...selectedSong.vocabulary.map((v, i) => ({ type: 'vocab' as const, data: v, index: i })),
    ];
    const currentItem = allItems[currentIndex];
    const isLastItem = currentIndex >= allItems.length - 1;

    return (
      <div className="flex-1 flex flex-col">
        {/* Progress */}
        <div className="p-4 pb-0">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-500">
              {currentIndex + 1} / {allItems.length}
            </span>
            <span className="text-gray-500 text-xs">{selectedSong.artistJapanese}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / allItems.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6 flex-1 flex flex-col items-center justify-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  currentItem.type === 'lyrics' ? 'bg-violet-100' : 'bg-purple-100'
                }`}>
                  {currentItem.type === 'lyrics' ? (
                    <Music className="w-6 h-6 text-violet-600" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-purple-600" />
                  )}
                </div>
                <p className="text-gray-400 text-xs mb-2">
                  {currentItem.type === 'lyrics' ? '가사' : '어휘'}
                </p>
                <button
                  onClick={() => speak(currentItem.data.japanese)}
                  className="mb-2 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <Volume2 className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
                  {currentItem.data.japanese}
                </h2>
                <p className="text-gray-500 mb-2">{currentItem.data.reading}</p>
                {showMeaning && (
                  <p className="text-primary-600 font-medium text-center">
                    {currentItem.data.meaning}
                  </p>
                )}
                {currentItem.type === 'vocab' && 'usage' in currentItem.data && currentItem.data.usage && (
                  <p className="text-gray-400 text-sm mt-2 text-center italic">
                    {currentItem.data.usage}
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Toggle meaning */}
          <button
            onClick={() => setShowMeaning(!showMeaning)}
            className={`mx-auto mt-4 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              showMeaning ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {showMeaning ? '의미 숨기기' : '의미 보기'}
          </button>
        </div>

        {/* Navigation */}
        <div className="p-4 flex gap-3">
          <button
            onClick={() => speak(currentItem.data.japanese)}
            className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <Volume2 className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => {
              if (isLastItem) {
                completeLearning();
              } else {
                setCurrentIndex(currentIndex + 1);
              }
            }}
            className="flex-1 py-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
          >
            {isLastItem ? (
              <>
                <Check className="w-5 h-5" />
                완료
              </>
            ) : (
              <>
                다음
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Cultural Note */}
        {isLastItem && selectedSong.culturalNote && (
          <div className="px-4 pb-4">
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span className="font-semibold text-violet-800 text-xs">문화 노트</span>
              </div>
              <p className="text-violet-700 text-xs">
                {selectedSong.culturalNote}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className={`text-white px-4 py-3 ${
        viewMode === 'learning' && selectedSong
          ? 'bg-gradient-to-r from-violet-500 to-purple-500'
          : viewMode === 'learning' && selectedAnime
            ? 'bg-gradient-to-r from-rose-500 to-pink-500'
            : 'bg-gradient-to-r from-primary-500 to-primary-600'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (viewMode === 'learning') {
                setViewMode('list');
                setSelectedAnime(null);
                setSelectedSong(null);
              } else {
                navigate(-1);
              }
            }}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold">
              {viewMode === 'learning'
                ? (selectedAnime?.title || selectedSong?.title)
                : 'J-Content'
              }
            </h1>
            <p className="text-white/80 text-xs">
              {viewMode === 'learning'
                ? (selectedAnime?.anime || `${selectedSong?.artist} - ${selectedSong?.song}`)
                : '애니메이션 & J-Pop으로 배우는 일본어'
              }
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      {viewMode === 'list' && renderList()}
      {viewMode === 'learning' && selectedAnime && renderAnimeLearning()}
      {viewMode === 'learning' && selectedSong && renderSongLearning()}
    </div>
  );
}
