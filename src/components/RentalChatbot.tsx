import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Loader2,
  MessageSquare,
  RotateCcw,
  Send,
  X,
} from 'lucide-react';
import { MUSEUM_INFO } from '../data/rentalFees';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface RentalChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_ASSISTANT_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'model',
  text: `안녕하세요. 천안박물관 시설 대관 안내 도우미입니다.\n공연장(278석)과 아카이브 세미나실 이용 가능 여부, 시간대별 사용료 및 장비 요금, 방문 접수 절차를 물어보시면 바로 안내해 드립니다.\n(개인정보는 입력하지 마시고 궁금한 내용만 질문해 주세요.)`,
};

const QUICK_PROMPTS = [
  '월요일에도 대관이 가능한가요?',
  '평일 오후 공연장에 무선마이크 2채널, 냉난방을 쓰면 얼마인가요?',
  '아카이브 세미나실 이용 조건과 비용을 알려주세요.',
  '회의나 종교 행사도 공연장 대관이 되나요?',
];

export function RentalChatbot({ isOpen, onClose }: RentalChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    INITIAL_ASSISTANT_MESSAGE,
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  async function sendMessage(textToSend: string) {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputValue('');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const apiPayload = nextMessages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiPayload }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '응답을 불러오지 못했습니다.');
      }

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.text,
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'AI 안내 응답 중 문제가 발생했습니다.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setMessages([INITIAL_ASSISTANT_MESSAGE]);
    setErrorMessage(null);
    setInputValue('');
  }

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="천안박물관 시설 대관 AI 안내 챗봇"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end bg-black/70 backdrop-blur-xs sm:p-6"
    >
      <div className="w-full sm:w-[440px] h-[88vh] sm:h-[640px] max-h-[90vh] bg-[#12141B] rounded-t-2xl sm:rounded-2xl border border-white/15 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#090A0D] text-white px-5 py-4 flex items-center justify-between gap-3 shrink-0 border-b border-white/12">
          <div className="flex items-center gap-2.5 min-w-0">
            <MessageSquare className="w-5 h-5 text-[#E5B842] shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <h2 className="text-lg font-bold truncate">
                대관 안내 AI 상담
              </h2>
              <p className="text-xs text-[#E5B842] truncate">
                천안박물관 기준 기반 · 전화 {MUSEUM_INFO.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              aria-label="대화 초기화"
              title="대화 초기화"
              className="w-11 h-11 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="챗봇 닫기"
              className="w-11 h-11 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#090A0D]"
        >
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[86%] rounded-2xl px-4 py-3 text-base leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-[#E5B842] text-[#090A0D] font-semibold rounded-br-sm'
                      : 'bg-[#181B24] text-slate-100 border border-white/12 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#181B24] border border-white/12 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2 text-base text-slate-300">
                <Loader2 className="w-4 h-4 animate-spin text-[#E5B842]" aria-hidden="true" />
                <span>안내 내용을 정리하고 있습니다...</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-xl border border-red-500/40 bg-red-950/40 text-red-100 text-sm sm:text-base flex items-start gap-2"
            >
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Quick Questions */}
        <div className="px-4 py-2.5 bg-[#12141B] border-t border-white/10 overflow-x-auto shrink-0">
          <div className="flex gap-2">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                type="button"
                disabled={isLoading}
                onClick={() => sendMessage(q)}
                className="shrink-0 px-3 py-2 rounded-lg border border-white/15 bg-[#181B24] hover:border-[#E5B842] text-sm font-medium text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputValue);
          }}
          className="p-3 sm:p-4 bg-[#12141B] border-t border-white/12 flex items-center gap-2 shrink-0"
        >
          <label htmlFor="chatbot-input" className="sr-only">
            대관 관련 질문 입력
          </label>
          <input
            ref={inputRef}
            id="chatbot-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="궁금한 대관 조건이나 요금을 입력하세요"
            disabled={isLoading}
            className="flex-1 min-h-[48px] px-4 py-2 rounded-xl border border-white/15 bg-[#090A0D] text-base text-white placeholder:text-slate-500 focus:border-[#E5B842] focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            aria-label="질문 전송"
            className="w-12 h-12 rounded-xl bg-[#E5B842] text-[#090A0D] hover:bg-[#F2C95C] disabled:opacity-40 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          >
            <Send className="w-5 h-5" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
