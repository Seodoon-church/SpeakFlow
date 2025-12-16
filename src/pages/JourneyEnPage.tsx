import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Lock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Star,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { EnglishLocation, EnglishScenario } from '@/data/journey-en';
import { useJourneyEnStore } from '@/stores/journeyEnStore';

export default function JourneyEnPage() {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<EnglishLocation | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<EnglishScenario | null>(null);

  const {
    currentCountry,
    currentChapterId,
    setCurrentCountry,
    setCurrentChapter,
    isLocationUnlocked,
    isScenarioCompleted,
    getLocationMastery,
    getChapterProgress,
    getCountryProgress,
    getChapters,
    totalJourneyXp,
  } = useJourneyEnStore();

  const chapters = getChapters();
  const currentChapter = chapters.find(c => c.id === currentChapterId) || chapters[0];
  const currentChapterIndex = chapters.findIndex(c => c.id === currentChapterId);
  const chapterProgress = currentChapter ? getChapterProgress(currentChapterId) : { completed: 0, total: 0, percentage: 0 };

  const usaProgress = getCountryProgress('usa');
  const ukProgress = getCountryProgress('uk');

  const handleCountryChange = (country: 'usa' | 'uk') => {
    setCurrentCountry(country);
    setSelectedLocation(null);
    setSelectedScenario(null);
  };

  const handleLocationClick = (location: EnglishLocation) => {
    if (isLocationUnlocked(location.id)) {
      setSelectedLocation(location);
      setSelectedScenario(null);
    }
  };

  const handleScenarioClick = (scenario: EnglishScenario) => {
    setSelectedScenario(scenario);
  };

  const handleStartScenario = () => {
    if (selectedLocation && selectedScenario) {
      navigate(`/scenario-en?location=${selectedLocation.id}&scenario=${selectedScenario.id}`);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapter(chapters[currentChapterIndex - 1].id);
      setSelectedLocation(null);
      setSelectedScenario(null);
    }
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapter(chapters[currentChapterIndex + 1].id);
      setSelectedLocation(null);
      setSelectedScenario(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate('/home')}
            className="p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-white">English Journey</h1>
            <p className="text-xs text-white/60">영어권 여행</p>
          </div>
          <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1.5 rounded-full">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-bold text-yellow-400">{totalJourneyXp}</span>
          </div>
        </div>
      </div>

      {/* Country Selector */}
      <div className="px-4 py-4">
        <div className="flex gap-3">
          <button
            onClick={() => handleCountryChange('usa')}
            className={`flex-1 p-4 rounded-xl transition-all ${
              currentCountry === 'usa'
                ? 'bg-gradient-to-br from-blue-500 to-red-500 ring-2 ring-white/30'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="text-3xl mb-2">🇺🇸</div>
            <h3 className="text-white font-bold">미국</h3>
            <p className="text-white/60 text-xs">뉴욕 여행</p>
            <div className="mt-2 text-xs text-white/80">
              {usaProgress.completed}/{usaProgress.total} 완료
            </div>
          </button>
          <button
            onClick={() => handleCountryChange('uk')}
            className={`flex-1 p-4 rounded-xl transition-all ${
              currentCountry === 'uk'
                ? 'bg-gradient-to-br from-red-600 to-blue-700 ring-2 ring-white/30'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="text-3xl mb-2">🇬🇧</div>
            <h3 className="text-white font-bold">영국</h3>
            <p className="text-white/60 text-xs">런던 여행</p>
            <div className="mt-2 text-xs text-white/80">
              {ukProgress.completed}/{ukProgress.total} 완료
            </div>
          </button>
        </div>
      </div>

      {/* Chapter Navigation */}
      {currentChapter && (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
            <button
              onClick={handlePrevChapter}
              disabled={currentChapterIndex === 0}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div className="text-center flex-1">
              <h2 className="text-white font-bold">{currentChapter.title}</h2>
              <p className="text-xs text-white/60 mt-0.5">{currentChapter.description}</p>
            </div>
            <button
              onClick={handleNextChapter}
              disabled={currentChapterIndex === chapters.length - 1}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-white/60 mb-1">
              <span>진행률</span>
              <span>{chapterProgress.completed}/{chapterProgress.total} 완료</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${
                  currentCountry === 'usa'
                    ? 'bg-gradient-to-r from-blue-500 to-red-500'
                    : 'bg-gradient-to-r from-red-600 to-blue-700'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${chapterProgress.percentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Map View */}
      {currentChapter && (
        <div className="relative px-4 pb-4">
          <div className={`relative rounded-2xl p-6 min-h-[300px] border border-white/10 overflow-hidden ${
            currentCountry === 'usa'
              ? 'bg-gradient-to-br from-blue-900/30 to-red-900/30'
              : 'bg-gradient-to-br from-red-900/30 to-blue-900/30'
          }`}>
            {/* Map Background */}
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%" className="absolute inset-0">
                <pattern id="grid-en" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid-en)" />
              </svg>
            </div>

            {/* Path connections */}
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
              {currentChapter.locations.slice(0, -1).map((location, index) => {
                const nextLocation = currentChapter.locations[index + 1];
                const isUnlocked = isLocationUnlocked(nextLocation.id);
                return (
                  <line
                    key={`path-${index}`}
                    x1={`${location.coordinates.x}%`}
                    y1={`${location.coordinates.y}%`}
                    x2={`${nextLocation.coordinates.x}%`}
                    y2={`${nextLocation.coordinates.y}%`}
                    stroke={isUnlocked ? '#10b981' : '#4b5563'}
                    strokeWidth="3"
                    strokeDasharray={isUnlocked ? '0' : '8 8'}
                    className="transition-all duration-500"
                  />
                );
              })}
            </svg>

            {/* Location Markers */}
            {currentChapter.locations.map((location) => {
              const isUnlocked = isLocationUnlocked(location.id);
              const mastery = getLocationMastery(location.id);
              const isSelected = selectedLocation?.id === location.id;
              const isCompleted = mastery >= 100;

              return (
                <motion.button
                  key={location.id}
                  onClick={() => handleLocationClick(location)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${location.coordinates.x}%`,
                    top: `${location.coordinates.y}%`,
                    zIndex: isSelected ? 20 : 10,
                  }}
                  whileHover={isUnlocked ? { scale: 1.1 } : {}}
                  whileTap={isUnlocked ? { scale: 0.95 } : {}}
                >
                  <div
                    className={`
                      relative p-3 rounded-full transition-all duration-300
                      ${isUnlocked
                        ? isSelected
                          ? `bg-gradient-to-br ${location.color} ring-4 ring-white/50`
                          : `bg-gradient-to-br ${location.color} hover:ring-2 hover:ring-white/30`
                        : 'bg-gray-700'
                      }
                      ${isCompleted ? 'ring-2 ring-green-400' : ''}
                    `}
                  >
                    {isUnlocked ? (
                      <>
                        <span className="text-2xl">{location.icon}</span>
                        {isCompleted && (
                          <CheckCircle2 className="absolute -top-1 -right-1 w-5 h-5 text-green-400 bg-slate-900 rounded-full" />
                        )}
                        {mastery > 0 && mastery < 100 && (
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-slate-900 px-1.5 py-0.5 rounded text-xs text-white/80">
                            {mastery}%
                          </div>
                        )}
                      </>
                    ) : (
                      <Lock className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  <p className={`
                    text-xs mt-1.5 font-medium text-center max-w-[80px]
                    ${isUnlocked ? 'text-white' : 'text-gray-500'}
                  `}>
                    {location.name}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Location Details Panel */}
      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-0 left-0 right-0 bg-slate-800 rounded-t-3xl border-t border-white/10 z-40"
          >
            <div className="p-4">
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />

              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${selectedLocation.color}`}>
                  <span className="text-3xl">{selectedLocation.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{selectedLocation.name}</h3>
                  <p className="text-white/60 text-sm">{selectedLocation.localName}</p>
                  <p className="text-white/80 text-sm mt-1">{selectedLocation.description}</p>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5 text-white/60" />
                </button>
              </div>

              <div className="bg-white/5 rounded-xl p-3 mb-4">
                <p className="text-white/80 text-sm leading-relaxed">{selectedLocation.story}</p>
              </div>

              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                <h4 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-2">시나리오</h4>
                {selectedLocation.scenarios.map((scenario) => {
                  const completed = isScenarioCompleted(scenario.id);
                  const isActive = selectedScenario?.id === scenario.id;

                  return (
                    <motion.button
                      key={scenario.id}
                      onClick={() => handleScenarioClick(scenario)}
                      className={`
                        w-full p-3 rounded-xl text-left transition-all
                        ${isActive ? 'bg-white/20 ring-2 ring-white/30' : 'bg-white/5 hover:bg-white/10'}
                      `}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{scenario.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="text-white font-medium">{scenario.title}</h5>
                            {completed && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                          </div>
                          <p className="text-white/60 text-xs">{scenario.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-yellow-400 text-sm">
                            <Star className="w-4 h-4" />
                            <span>+{scenario.xpReward}</span>
                          </div>
                          <div className="flex items-center gap-1 text-white/40 text-xs mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{scenario.estimatedMinutes}분</span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {selectedScenario && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mt-4"
                  >
                    <button
                      onClick={handleStartScenario}
                      className={`w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 ${
                        currentCountry === 'usa'
                          ? 'bg-gradient-to-r from-blue-500 to-red-500'
                          : 'bg-gradient-to-r from-red-600 to-blue-700'
                      }`}
                    >
                      <MapPin className="w-5 h-5" />
                      {selectedScenario.title} 시작하기
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
