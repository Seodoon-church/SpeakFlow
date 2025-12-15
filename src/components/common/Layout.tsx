import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, MessageCircle, BarChart3, Settings } from 'lucide-react';
import { useUIStore, useChatStore } from '@/stores';

const navItems = [
  { id: 'home', icon: Home, label: '홈', path: '/home' },
  { id: 'learn', icon: BookOpen, label: '학습', path: '/learn' },
  { id: 'chat', icon: MessageCircle, label: '채팅', path: '/chat' },
  { id: 'stats', icon: BarChart3, label: '통계', path: '/stats' },
  { id: 'settings', icon: Settings, label: '설정', path: '/settings' },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setActiveTab } = useUIStore();
  const { unreadCount } = useChatStore();

  const handleNavClick = (item: typeof navItems[0]) => {
    setActiveTab(item.id);
    navigate(item.path);
  };

  // 현재 경로에 따라 activeTab 업데이트
  const currentTab = navItems.find((item) => item.path === location.pathname)?.id || 'home';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 메인 컨텐츠 */}
      <main className="flex-1 pb-20 safe-bottom">
        <Outlet />
      </main>

      {/* 바텀 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-bottom">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const showBadge = item.id === 'chat' && unreadCount > 0;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`relative flex flex-col items-center justify-center w-full h-full transition-colors ${
                  isActive
                    ? 'text-primary-500'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className="relative">
                  <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
