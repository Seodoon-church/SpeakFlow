import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MessageSquare,
  Brain,
  Users,
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  Globe,
  Zap,
  X,
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);

  const features = [
    {
      icon: Brain,
      title: 'AI 맞춤 학습',
      description: '당신의 수준과 목표에 맞는 개인화된 커리큘럼',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: MessageSquare,
      title: 'AI 롤플레이',
      description: 'Claude AI와 실제 상황 대화 연습',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Mic,
      title: '음성 인식',
      description: '발음 체크와 실시간 피드백',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Users,
      title: '가족 학습',
      description: '온 가족이 함께하는 영어 학습',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const tracks = [
    { icon: '🏠', name: '생활 영어', desc: '일상 회화 마스터' },
    { icon: '✨', name: 'Beauty Tech', desc: '뷰티 비즈니스 영어' },
    { icon: '💼', name: '비즈니스', desc: '업무 영어 완성' },
    { icon: '✈️', name: '여행 영어', desc: '해외여행 필수 표현' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* 네비게이션 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">SpeakFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-gray-600 hover:text-foreground font-medium transition-colors"
            >
              로그인
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2 bg-primary-500 text-white rounded-full font-medium hover:bg-primary-600 transition-colors"
            >
              시작하기
            </button>
          </div>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className="relative pt-32 pb-20 px-4">
        {/* 배경 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50" />

        {/* 플로팅 요소들 */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary-200/50 rounded-full blur-2xl animate-float" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-secondary-200/50 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-accent-200/50 rounded-full blur-2xl animate-float-delay" />

        {/* 플로팅 이모지 */}
        <div className="absolute top-32 left-[15%] text-4xl animate-float opacity-60">🎯</div>
        <div className="absolute top-48 right-[20%] text-3xl animate-float-slow opacity-60">💬</div>
        <div className="absolute bottom-32 left-[10%] text-3xl animate-float-delay opacity-60">🌟</div>
        <div className="absolute top-60 right-[10%] text-4xl animate-float opacity-60">🎧</div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* 배지 */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg shadow-primary-100 mb-8 animate-bounce-slow">
            <Zap className="w-4 h-4 text-accent-500" />
            <span className="text-sm font-medium text-gray-700">AI 기반 영어 학습 플랫폼</span>
          </div>

          {/* 메인 타이틀 */}
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            매일 15분으로 완성하는
            <br />
            <span className="bg-gradient-to-r from-primary-500 via-purple-500 to-secondary-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              AI 영어 회화
            </span>
          </h1>

          {/* 서브 타이틀 */}
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            청크 학습, 섀도잉, AI 롤플레이까지
            <br className="hidden md:block" />
            <span className="text-primary-600 font-medium">과학적으로 설계된 5단계 학습법</span>으로 영어 실력을 키워보세요
          </p>

          {/* CTA 버튼 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button
              onClick={() => navigate('/login')}
              className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-semibold text-lg shadow-xl shadow-primary-200 hover:shadow-2xl hover:shadow-primary-300 transition-all hover:scale-105"
            >
              <span className="flex items-center justify-center gap-2">
                무료로 시작하기
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button
              onClick={() => setShowVideo(true)}
              className="group w-full sm:w-auto px-8 py-4 bg-white text-gray-700 rounded-2xl font-semibold text-lg border-2 border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                <Play className="w-5 h-5 text-primary-500" />
                소개 영상 보기
              </span>
            </button>
          </div>

          {/* 신뢰 지표 */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-secondary-500" />
              <span>무료 체험</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-secondary-500" />
              <span>신용카드 불필요</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-secondary-500" />
              <span>언제든 취소 가능</span>
            </div>
          </div>
        </div>

        {/* 앱 미리보기 */}
        <div className="relative max-w-sm mx-auto mt-16">
          <div className="absolute inset-0 bg-gradient-to-b from-primary-500/20 to-secondary-500/20 rounded-[2.5rem] blur-3xl" />
          <div className="relative bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 p-3 border border-gray-100">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-[1.5rem] p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👨</span>
                </div>
                <div>
                  <p className="font-bold">Hello, David!</p>
                  <p className="text-sm opacity-90">오늘의 학습을 시작해볼까요?</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-xs opacity-80 mb-1">연속 학습</p>
                  <p className="text-2xl font-bold">7일 🔥</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-xs opacity-80 mb-1">오늘 목표</p>
                  <p className="text-2xl font-bold">15분</p>
                </div>
              </div>
              <button className="w-full py-3 bg-white text-primary-600 rounded-xl font-bold flex items-center justify-center gap-2">
                <Play className="w-5 h-5" fill="currentColor" />
                학습 시작
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 학습 플로우 섹션 */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              과학적으로 설계된 <span className="text-primary-500">5단계 학습법</span>
            </h2>
            <p className="text-gray-600 text-lg">
              매일 15분, 체계적인 학습 플로우로 영어 실력이 쌓여갑니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: 1, name: '워밍업', time: '2분', icon: '🧠', desc: '어제 배운 내용 복습' },
              { step: 2, name: '청크 학습', time: '3분', icon: '📚', desc: '오늘의 핵심 표현' },
              { step: 3, name: '섀도잉', time: '4분', icon: '🎧', desc: '원어민 따라 말하기' },
              { step: 4, name: 'AI 롤플레이', time: '5분', icon: '🤖', desc: '실전 대화 연습' },
              { step: 5, name: '마무리', time: '1분', icon: '✅', desc: '학습 요약' },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                <div className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-primary-50 transition-colors group">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-foreground mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{item.desc}</p>
                  <span className="text-xs text-primary-500 font-medium">{item.time}</span>
                </div>
                {index < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-gray-300">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 기능 소개 섹션 */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              왜 <span className="text-primary-500">SpeakFlow</span>인가요?
            </h2>
            <p className="text-gray-600 text-lg">
              AI 기술로 더 효과적이고 재미있는 영어 학습을 경험하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group bg-white rounded-3xl p-8 shadow-lg shadow-gray-100 hover:shadow-xl hover:shadow-gray-200 transition-all hover:-translate-y-1"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 트랙 소개 */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              나에게 맞는 <span className="text-primary-500">학습 트랙</span> 선택
            </h2>
            <p className="text-gray-600 text-lg">
              목표와 상황에 맞는 커리큘럼으로 효율적으로 학습하세요
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tracks.map((track) => (
              <div
                key={track.name}
                className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-primary-50 hover:scale-105 transition-all cursor-pointer"
              >
                <div className="text-5xl mb-4">{track.icon}</div>
                <h3 className="font-bold text-foreground mb-1">{track.name}</h3>
                <p className="text-sm text-gray-500">{track.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600 rounded-3xl p-10 md:p-16 text-center text-white overflow-hidden">
            {/* 배경 장식 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

            <div className="relative">
              <div className="text-5xl mb-6 animate-wave inline-block">👋</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                지금 바로 시작하세요!
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-lg mx-auto">
                매일 15분 투자로 3개월 후 달라진 영어 실력을 경험하세요.
                <br />첫 7일은 무료입니다.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="px-10 py-4 bg-white text-primary-600 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              >
                무료 체험 시작
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">SpeakFlow</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">이용약관</a>
              <a href="#" className="hover:text-white transition-colors">개인정보처리방침</a>
              <a href="#" className="hover:text-white transition-colors">고객센터</a>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="text-sm">한국어</span>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            © 2025 SpeakFlow. All rights reserved.
          </div>
        </div>
      </footer>

      {/* 소개 영상 모달 */}
      {showVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowVideo(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <video
              src="/intro.mp4"
              controls
              autoPlay
              className="w-full aspect-video"
            >
              브라우저가 비디오 태그를 지원하지 않습니다.
            </video>
          </div>
        </div>
      )}
    </div>
  );
}
