import { Store } from "@tanstack/store";
import { ChatMessage } from "@/features/chat-management";

interface ChatState {
  messages: Map<number, ChatMessage[]>; // roomId -> messages
  participantsVersion: Map<number, number>; // roomId -> version (for trigger re-render)
}

export const chatStore = new Store<ChatState>({
  messages: new Map(),
  participantsVersion: new Map(),
});

// 메시지 설정 (초기 로딩)
export const setMessages = (roomId: number, messages: ChatMessage[]) => {
  chatStore.setState((state) => {
    const newMessages = new Map(state.messages);
    newMessages.set(roomId, messages);
    return { ...state, messages: newMessages };
  });
};

// 메시지 추가 (실시간)
export const addMessage = (roomId: number, message: ChatMessage) => {
  chatStore.setState((state) => {
    const newMessages = new Map(state.messages);
    const existing = newMessages.get(roomId) || [];

    // 중복 체크
    if (existing.some((m) => m.id === message.id)) {
      return state;
    }

    newMessages.set(roomId, [...existing, message]);
    return { ...state, messages: newMessages };
  });
};

// 메시지 초기화
export const clearMessages = (roomId: number) => {
  chatStore.setState((state) => {
    const newMessages = new Map(state.messages);
    newMessages.set(roomId, []);
    return { ...state, messages: newMessages };
  });
};

// 참여자 변경 트리거 (버전 증가로 re-fetch 유도)
export const triggerParticipantsUpdate = (roomId: number) => {
  chatStore.setState((state) => {
    const newVersion = new Map(state.participantsVersion);
    newVersion.set(roomId, (newVersion.get(roomId) || 0) + 1);
    return { ...state, participantsVersion: newVersion };
  });
};
