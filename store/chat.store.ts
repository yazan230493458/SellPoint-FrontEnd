
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistStorage } from "@/lib/persist-storage";

export type ChatRequestStatus = "pending" | "accepted" | "rejected";
export type ChatRequestDirection = "incoming" | "outgoing";

export interface ChatMessage {
  id: string | number;
  senderId: string | number;
  senderName: string;
  avatarUrl?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  requestStatus?: ChatRequestStatus;
  requestDirection?: ChatRequestDirection;
}

export interface ChatState {
  chats: ChatMessage[];
  selectedChatId: string | number | null;
  setSelectedChatId: (id: string | number | null) => void;
  sendMessage: (chatId: string | number, text: string) => void;
  receiveMessage: (chatId: string | number, text: string) => void;
  markAsRead: (chatId: string | number) => void;
  setChats: (chats: ChatMessage[]) => void;
  openChatWith: (name: string) => void;
  requestChatWith: (name: string) => void;
  acceptRequest: (chatId: string | number) => void;
  rejectRequest: (chatId: string | number) => void;
  resendRequest: (chatId: string | number) => void;
}

export function isAcceptedChat(chat: ChatMessage) {
  return !chat.requestStatus || chat.requestStatus === "accepted";
}

function createChatId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `chat-${Date.now()}`;
}

function findChatByName(chats: ChatMessage[], name: string) {
  const key = name.toLowerCase();
  return chats.find((chat) => chat.senderName.toLowerCase() === key);
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      selectedChatId: null,

      setSelectedChatId: (id) => {
        set({ selectedChatId: id });

        if (id !== null) {
          get().markAsRead(id);
        }
      },

      setChats: (chats) => set({ chats }),

      sendMessage: (chatId, text) => {
        const { chats } = get();
        const target = chats.find((chat) => chat.id === chatId);
        if (!target || !isAcceptedChat(target)) return;

        const updatedChats = chats.map((chat) =>
          chat.id === chatId
            ? { ...chat, lastMessage: text, timestamp: "Just now" }
            : chat,
        );

        set({ chats: updatedChats });
      },

      receiveMessage: (chatId, text) => {
        const { chats, selectedChatId } = get();
        const target = chats.find((chat) => chat.id === chatId);
        if (!target || !isAcceptedChat(target)) return;
        const isActiveChat = chatId === selectedChatId;

        const updatedChats = chats.map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              lastMessage: text,
              timestamp: "Just now",
              unreadCount: isActiveChat ? 0 : chat.unreadCount + 1,
            };
          }

          return chat;
        });

        set({ chats: updatedChats });
      },

      markAsRead: (chatId) => {
        const { chats } = get();

        const updatedChats = chats.map((chat) =>
          chat.id === chatId ? { ...chat, unreadCount: 0 } : chat,
        );

        set({ chats: updatedChats });
      },

      openChatWith: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;

        const existing = findChatByName(get().chats, trimmed);

        if (existing) {
          set({ selectedChatId: existing.id });
          return;
        }

        const id = createChatId();

        set({
          selectedChatId: id,
          chats: [
            {
              id,
              senderId: id,
              senderName: trimmed,
              avatarUrl: "",
              lastMessage: "",
              timestamp: "Just now",
              unreadCount: 0,
              requestStatus: "accepted",
            },
            ...get().chats,
          ],
        });
      },

      requestChatWith: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;

        const existing = findChatByName(get().chats, trimmed);
        if (existing) {
          set({ selectedChatId: existing.id });
          return;
        }

        const id = createChatId();
        set({
          selectedChatId: id,
          chats: [
            {
              id,
              senderId: id,
              senderName: trimmed,
              avatarUrl: "",
              lastMessage: "",
              timestamp: "Just now",
              unreadCount: 0,
              requestStatus: "pending",
              requestDirection: "outgoing",
            },
            ...get().chats,
          ],
        });
      },

      acceptRequest: (chatId) => {
        const { chats } = get();
        const target = chats.find((chat) => chat.id === chatId);
        if (
          !target ||
          target.requestDirection !== "incoming" ||
          target.requestStatus !== "pending"
        ) {
          return;
        }

        set({
          chats: chats.map((chat) =>
            chat.id === chatId
              ? { ...chat, requestStatus: "accepted", unreadCount: 0 }
              : chat,
          ),
        });
      },

      rejectRequest: (chatId) => {
        const { chats } = get();
        const target = chats.find((chat) => chat.id === chatId);
        if (
          !target ||
          target.requestDirection !== "incoming" ||
          target.requestStatus !== "pending"
        ) {
          return;
        }

        set({
          chats: chats.map((chat) =>
            chat.id === chatId
              ? { ...chat, requestStatus: "rejected", unreadCount: 0 }
              : chat,
          ),
        });
      },

      resendRequest: (chatId) => {
        const { chats } = get();
        const target = chats.find((chat) => chat.id === chatId);
        if (
          !target ||
          target.requestDirection !== "outgoing" ||
          target.requestStatus !== "rejected"
        ) {
          return;
        }

        set({
          chats: chats.map((chat) =>
            chat.id === chatId
              ? { ...chat, requestStatus: "pending", timestamp: "Just now" }
              : chat,
          ),
        });
      },
    }),
    {
      name: "chat-storage",
      version: 2,
      migrate: () => ({ chats: [], selectedChatId: null }),
      partialize: (state) => ({
        chats: state.chats,
        selectedChatId: state.selectedChatId,
      }),
      storage: persistStorage,
    },
  ),
);
