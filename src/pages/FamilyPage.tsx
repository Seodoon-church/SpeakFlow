import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Plus,
  Edit2,
  Trash2,
  Check,
  Flame,
  BookOpen,
  X
} from 'lucide-react';
import { useFamilyStore, AVATAR_EMOJIS, TRACKS, useUIStore } from '@/stores';
import type { TrackId } from '@/types';

export default function FamilyPage() {
  const navigate = useNavigate();
  const { showToast } = useUIStore();
  const {
    members,
    currentMemberId,
    addMember,
    updateMember,
    removeMember,
    setCurrentMember
  } = useFamilyStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [newMember, setNewMember] = useState({
    name: '',
    avatar: '👨',
    trackId: 'daily-life' as TrackId,
    dailyGoalMinutes: 15,
  });

  const handleAddMember = () => {
    if (!newMember.name.trim()) {
      showToast({ type: 'warning', message: '이름을 입력해주세요.' });
      return;
    }

    addMember(newMember);
    setNewMember({
      name: '',
      avatar: '👨',
      trackId: 'daily-life',
      dailyGoalMinutes: 15,
    });
    setShowAddModal(false);
    showToast({ type: 'success', message: '가족 구성원이 추가되었습니다.' });
  };

  const handleDeleteMember = (id: string, name: string) => {
    if (confirm(`${name}님을 삭제하시겠습니까?`)) {
      removeMember(id);
      showToast({ type: 'info', message: '삭제되었습니다.' });
    }
  };

  const handleSelectMember = (id: string) => {
    setCurrentMember(id);
    const member = members.find(m => m.id === id);
    if (member) {
      showToast({ type: 'success', message: `${member.name}님으로 전환되었습니다.` });
    }
    navigate('/');
  };

  const getTrackName = (trackId: TrackId) => {
    return TRACKS.find(t => t.id === trackId)?.name || trackId;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 헤더 */}
      <header className="flex items-center px-4 py-4 bg-white border-b">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="flex-1 text-center font-bold text-lg">가족 관리</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="p-2 -mr-2 text-primary-500"
        >
          <Plus className="w-6 h-6" />
        </button>
      </header>

      <main className="px-4 py-6">
        {/* 안내 문구 */}
        <div className="bg-primary-50 p-4 rounded-xl mb-6">
          <p className="text-sm text-primary-700">
            가족 구성원별로 학습 트랙과 진도를 관리할 수 있어요.
            <br />각자의 목표에 맞는 트랙을 선택해 보세요!
          </p>
        </div>

        {/* 가족 구성원 목록 */}
        {members.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              가족을 추가해주세요
            </h2>
            <p className="text-gray-500 mb-6">
              가족 구성원을 추가하고<br />함께 영어 학습을 시작해보세요!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              가족 추가하기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className={`bg-white rounded-xl p-4 border-2 transition-all ${
                  currentMemberId === member.id
                    ? 'border-primary-500'
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* 아바타 */}
                  <button
                    onClick={() => handleSelectMember(member.id)}
                    className="text-4xl w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center"
                  >
                    {member.avatar}
                  </button>

                  {/* 정보 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground">{member.name}</h3>
                      {currentMemberId === member.id && (
                        <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">
                          현재
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {getTrackName(member.trackId)} · {member.dailyGoalMinutes}분/일
                    </p>

                    {/* 통계 */}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm">
                        <Flame className="w-4 h-4 text-accent-500" />
                        <span className="text-gray-600">{member.streakDays}일</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <BookOpen className="w-4 h-4 text-secondary-500" />
                        <span className="text-gray-600">{member.chunksLearned}개</span>
                      </div>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingMember(member.id)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.id, member.name)}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* 학습 시작 버튼 */}
                {currentMemberId !== member.id && (
                  <button
                    onClick={() => handleSelectMember(member.id)}
                    className="w-full mt-3 py-2 text-sm text-primary-500 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    이 프로필로 학습하기
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 추가/수정 모달 */}
      {(showAddModal || editingMember) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground">
                {editingMember ? '프로필 수정' : '가족 추가'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingMember(null);
                }}
                className="p-2 text-gray-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 아바타 선택 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                아바타
              </label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      if (editingMember) {
                        updateMember(editingMember, { avatar: emoji });
                      } else {
                        setNewMember({ ...newMember, avatar: emoji });
                      }
                    }}
                    className={`text-3xl w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      (editingMember
                        ? members.find(m => m.id === editingMember)?.avatar
                        : newMember.avatar) === emoji
                        ? 'bg-primary-100 ring-2 ring-primary-500'
                        : 'bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* 이름 입력 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <input
                type="text"
                value={
                  editingMember
                    ? members.find(m => m.id === editingMember)?.name || ''
                    : newMember.name
                }
                onChange={(e) => {
                  if (editingMember) {
                    updateMember(editingMember, { name: e.target.value });
                  } else {
                    setNewMember({ ...newMember, name: e.target.value });
                  }
                }}
                className="input"
                placeholder="이름을 입력하세요"
              />
            </div>

            {/* 트랙 선택 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                학습 트랙
              </label>
              <div className="space-y-2">
                {TRACKS.map((track) => {
                  const isSelected =
                    (editingMember
                      ? members.find(m => m.id === editingMember)?.trackId
                      : newMember.trackId) === track.id;

                  return (
                    <button
                      key={track.id}
                      onClick={() => {
                        if (editingMember) {
                          updateMember(editingMember, { trackId: track.id });
                        } else {
                          setNewMember({ ...newMember, trackId: track.id });
                        }
                      }}
                      className={`w-full p-3 rounded-xl text-left flex items-center gap-3 transition-all ${
                        isSelected
                          ? 'bg-primary-50 border-2 border-primary-500'
                          : 'bg-gray-50 border-2 border-transparent'
                      }`}
                    >
                      <span className="text-2xl">{track.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{track.name}</p>
                        <p className="text-xs text-gray-500">{track.description}</p>
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5 text-primary-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 일일 목표 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                일일 학습 목표
              </label>
              <div className="flex gap-2">
                {[10, 15, 20, 30].map((minutes) => {
                  const isSelected =
                    (editingMember
                      ? members.find(m => m.id === editingMember)?.dailyGoalMinutes
                      : newMember.dailyGoalMinutes) === minutes;

                  return (
                    <button
                      key={minutes}
                      onClick={() => {
                        if (editingMember) {
                          updateMember(editingMember, { dailyGoalMinutes: minutes });
                        } else {
                          setNewMember({ ...newMember, dailyGoalMinutes: minutes });
                        }
                      }}
                      className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                        isSelected
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {minutes}분
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 저장 버튼 */}
            <button
              onClick={() => {
                if (editingMember) {
                  setEditingMember(null);
                  showToast({ type: 'success', message: '수정되었습니다.' });
                } else {
                  handleAddMember();
                }
              }}
              className="btn-primary w-full"
            >
              {editingMember ? '저장하기' : '추가하기'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
