import { useRef, useEffect, useState, useCallback } from 'react';
import { Eraser, RotateCcw, Check, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';

interface WritingCanvasProps {
  character: string;       // 연습할 문자
  subText?: string;        // 보조 텍스트 (발음 등)
  onComplete?: () => void; // 완료 콜백
  onNext?: () => void;     // 다음 버튼 콜백
  onPrev?: () => void;     // 이전 버튼 콜백
  showNavigation?: boolean;
}

export default function WritingCanvas({
  character,
  subText,
  onComplete,
  onNext,
  onPrev,
  showNavigation = true,
}: WritingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [hasDrawn, setHasDrawn] = useState(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Canvas 초기화
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 고해상도 디스플레이 지원
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // 배경색
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // 힌트 문자 그리기
    if (showHint) {
      ctx.font = `${rect.width * 0.6}px "Noto Sans JP", sans-serif`;
      ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(character, rect.width / 2, rect.height / 2);
    }

    // 테두리 그리기
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, rect.width - 2, rect.height - 2);

    // 가이드 라인 (십자선)
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    // 세로선
    ctx.beginPath();
    ctx.moveTo(rect.width / 2, 0);
    ctx.lineTo(rect.width / 2, rect.height);
    ctx.stroke();

    // 가로선
    ctx.beginPath();
    ctx.moveTo(0, rect.height / 2);
    ctx.lineTo(rect.width, rect.height / 2);
    ctx.stroke();

    ctx.setLineDash([]);
  }, [character, showHint]);

  // 캔버스 초기화 effect
  useEffect(() => {
    initCanvas();
    setHasDrawn(false);
  }, [initCanvas, character]);

  // 윈도우 리사이즈 처리
  useEffect(() => {
    const handleResize = () => initCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvas]);

  // 좌표 가져오기 (터치/마우스/펜 지원)
  const getCoordinates = (e: React.TouchEvent | React.MouseEvent | React.PointerEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      // 터치 이벤트
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      // 마우스/펜 이벤트
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  // 그리기 시작
  const startDrawing = (e: React.TouchEvent | React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    lastPosRef.current = coords;
  };

  // 그리기
  const draw = (e: React.TouchEvent | React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const coords = getCoordinates(e);
    if (!coords || !lastPosRef.current) return;

    // 펜 압력 감지 (PointerEvent인 경우)
    let pressure = 0.5;
    if ('pressure' in e && e.pressure > 0) {
      pressure = e.pressure;
    }

    // 펜 스타일
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3 + pressure * 4; // 압력에 따른 굵기 변화
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 선 그리기
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    lastPosRef.current = coords;
    setHasDrawn(true);
  };

  // 그리기 종료
  const stopDrawing = () => {
    setIsDrawing(false);
    lastPosRef.current = null;
  };

  // 캔버스 지우기
  const clearCanvas = () => {
    initCanvas();
    setHasDrawn(false);
  };

  // 힌트 토글
  const toggleHint = () => {
    setShowHint(!showHint);
  };

  // 힌트 변경 시 다시 그리기
  useEffect(() => {
    if (!hasDrawn) {
      initCanvas();
    }
  }, [showHint, hasDrawn, initCanvas]);

  return (
    <div className="flex flex-col items-center">
      {/* 연습할 문자 표시 */}
      <div className="text-center mb-4">
        <p className="text-5xl font-bold text-foreground mb-1">{character}</p>
        {subText && <p className="text-lg text-gray-500">{subText}</p>}
      </div>

      {/* 캔버스 */}
      <div className="relative w-full max-w-[300px] aspect-square mb-4">
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-2xl shadow-lg cursor-crosshair touch-none"
          style={{ touchAction: 'none' }}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          onPointerCancel={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>

      {/* 컨트롤 버튼 */}
      <div className="flex items-center gap-3 mb-4">
        {/* 힌트 토글 */}
        <button
          onClick={toggleHint}
          className={`p-3 rounded-xl transition-colors ${
            showHint ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
          }`}
          title={showHint ? '힌트 숨기기' : '힌트 보기'}
        >
          {showHint ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </button>

        {/* 지우기 */}
        <button
          onClick={clearCanvas}
          className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          title="지우기"
        >
          <Eraser className="w-5 h-5" />
        </button>

        {/* 다시 쓰기 */}
        <button
          onClick={clearCanvas}
          className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          title="다시 쓰기"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* 완료 */}
        {hasDrawn && onComplete && (
          <button
            onClick={onComplete}
            className="p-3 rounded-xl bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
            title="완료"
          >
            <Check className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 네비게이션 */}
      {showNavigation && (
        <div className="flex items-center gap-4">
          <button
            onClick={onPrev}
            disabled={!onPrev}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            이전
          </button>
          <button
            onClick={() => {
              clearCanvas();
              onNext?.();
            }}
            disabled={!onNext}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            다음
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 안내 문구 */}
      <p className="text-xs text-gray-400 mt-4 text-center">
        S펜이나 손가락으로 문자를 따라 써보세요
      </p>
    </div>
  );
}
