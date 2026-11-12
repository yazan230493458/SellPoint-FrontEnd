"use client";

import React, {
  Suspense,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import NormalButton from "../../components/ui/BaseButton";
import InputField from "../../components/ui/InputField";
import { useLocale, useTranslations } from "next-intl";
import { isAcceptedChat, useChatStore, type ChatMessage } from "@/store/chat.store";
import { formatDateTime } from "@/lib/intl-format";
import { useAdStore } from "@/store/ad.store";
import { useStoreStore } from "@/store/store.store";
import { useHydrated } from "@/lib/use-hydrated";
import { useUserStore } from "@/store/user.store";
import { isSafeImageSrc } from "@/lib/safe-href";
import { apiRequest, ApiError, API_URL } from "@/lib/api";
import { triggerNotificationByPreference } from "@/utils/notifications";
import {
  MessageSquare,
  Send,
  Search,
  Users,
  Inbox,
  ShieldCheck,
  Paperclip,
  X,
  Trash2,
  ArrowLeft,
} from "lucide-react";

function translateChatMessage(
  t: (
    key: "sampleAvailable" | "sampleThanks" | "messageDeleted",
  ) => string,
  value: string,
) {
  if (value === "Hello, is this item still available for purchase?") {
    return t("sampleAvailable");
  }
  if (value === "Thank you for the quick response!") {
    return t("sampleThanks");
  }
  if (value === "This message was deleted.") {
    return t("messageDeleted");
  }
  return value;
}

type DirectoryUser = {
  key: string;
  name: string;
  avatarUrl: string;
};

function addDirectoryUser(
  users: Map<string, DirectoryUser>,
  name?: string,
  avatarUrl?: string,
) {
  const trimmed = name?.trim() ?? "";
  if (!trimmed) return;
  const key = trimmed.toLowerCase();
  if (key === "unknown" || key === "unknown unknown") return;

  const existing = users.get(key);
  if (existing) {
    if (!existing.avatarUrl && avatarUrl) existing.avatarUrl = avatarUrl;
    return;
  }

  users.set(key, { key, name: trimmed, avatarUrl: avatarUrl ?? "" });
}

const searchInputClassName =
  "w-full rounded-2xl border border-zinc-200 bg-white py-3 ps-10 pe-4 text-xs text-zinc-900 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-100 dark:focus:ring-amber-500/20";

type ChatSidebarProps = {
  chats: ChatMessage[];
  selectedChatId: string | number | null;
  onSelectChat: (id: string | number) => void;
  onSelectUser: (name: string) => void;
};

const ChatSidebar = memo(function ChatSidebar({
  chats,
  selectedChatId,
  onSelectChat,
  onSelectUser,
}: ChatSidebarProps) {
  const t = useTranslations("MyChatPage");
  const ads = useAdStore((state) => state.ads);
  const stores = useStoreStore((state) => state.stores);
  const currentStore = useStoreStore((state) => state.currentStore);
  const selfIdentity = useUserStore((state) => {
    const account = state.user?.settings.account;
    if (!account) return "";
    const fullName = [account.firstName, account.lastName]
      .map((part) => part?.trim() ?? "")
      .filter((part) => part && part.toLowerCase() !== "unknown")
      .join(" ");
    const username = account.username?.trim() ?? "";
    const safeUsername =
      username.toLowerCase() === "unknown" ? "" : username;
    return [fullName, safeUsername].filter(Boolean).join("\n").toLowerCase();
  });

  const [section, setSection] = useState<
    "conversations" | "users" | "requests"
  >("conversations");
  const [userQuery, setUserQuery] = useState("");
  const [conversationQuery, setConversationQuery] = useState("");

  const groupedChats = useMemo(() => {
    const accepted: ChatMessage[] = [];
    const incoming: ChatMessage[] = [];
    const outgoing: ChatMessage[] = [];
    for (const chat of chats) {
      if (isAcceptedChat(chat)) accepted.push(chat);
      else if (chat.requestDirection === "outgoing") outgoing.push(chat);
      else incoming.push(chat);
    }
    return { accepted, incoming, outgoing };
  }, [chats]);

  const directory = useMemo(() => {
    const selfKeys = new Set(
      selfIdentity.split("\n").filter((key) => key.length > 0),
    );
    const users = new Map<string, DirectoryUser>();
    const add = (name?: string, avatarUrl?: string) => {
      const key = name?.trim().toLowerCase() ?? "";
      if (!key || selfKeys.has(key)) return;
      addDirectoryUser(users, name, avatarUrl);
    };
    for (const chat of chats) add(chat.senderName, chat.avatarUrl);
    for (const ad of ads) add(ad.username);
    for (const store of stores) add(store.username);
    if (
      currentStore &&
      !stores.some((store) => store.id === currentStore.id)
    ) {
      add(currentStore.username);
    }
    return Array.from(users.values());
  }, [ads, chats, currentStore, selfIdentity, stores]);

  const normalizedUserQuery = userQuery.trim().toLowerCase();
  const visibleUsers = useMemo(() => {
    if (section !== "users") return [];
    if (!normalizedUserQuery) return directory;
    return directory.filter((user) => user.key.includes(normalizedUserQuery));
  }, [directory, normalizedUserQuery, section]);

  const conversationIndex = useMemo(
    () =>
      groupedChats.accepted.map((chat) => ({
        chat,
        name: chat.senderName.toLowerCase(),
        message: translateChatMessage(t, chat.lastMessage).toLowerCase(),
      })),
    [groupedChats.accepted, t],
  );

  const normalizedConversationQuery = conversationQuery.trim().toLowerCase();
  const visibleChats = useMemo(() => {
    if (section !== "conversations") return [];
    if (!normalizedConversationQuery) return groupedChats.accepted;
    const matches: ChatMessage[] = [];
    for (const entry of conversationIndex) {
      if (
        entry.name.includes(normalizedConversationQuery) ||
        entry.message.includes(normalizedConversationQuery)
      ) {
        matches.push(entry.chat);
      }
    }
    return matches;
  }, [
    conversationIndex,
    groupedChats.accepted,
    normalizedConversationQuery,
    section,
  ]);

  const openUser = (name: string) => {
    const existing = chats.find(
      (chat) => chat.senderName.toLowerCase() === name.trim().toLowerCase(),
    );
    if (existing && isAcceptedChat(existing)) {
      setConversationQuery("");
      setSection("conversations");
      onSelectChat(existing.id);
      return;
    }
    setSection("requests");
    onSelectUser(name);
  };

  const tabClassName = (active: boolean) =>
    `min-w-0 rounded-2xl px-1 py-2 text-center text-[10px] font-semibold leading-tight sm:text-[11px] ${
      active
        ? "border border-zinc-200/80 bg-white text-zinc-900 shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        : "border border-transparent text-zinc-600 hover:bg-zinc-100/80 dark:text-zinc-300 dark:hover:bg-zinc-800/40"
    }`;

  const selectedRequestStatus = useMemo(() => {
    if (selectedChatId == null) return undefined;
    return chats.find((chat) => chat.id === selectedChatId)?.requestStatus;
  }, [chats, selectedChatId]);
  const previousRequestStatus = useRef(selectedRequestStatus);
  useEffect(() => {
    if (
      previousRequestStatus.current === "pending" &&
      selectedRequestStatus === "accepted"
    ) {
      setSection("conversations");
    }
    previousRequestStatus.current = selectedRequestStatus;
  }, [selectedRequestStatus]);

  const selectedUserKey = useMemo(() => {
    if (selectedChatId == null) return "";
    return (
      chats
        .find((chat) => chat.id === selectedChatId)
        ?.senderName.toLowerCase() ?? ""
    );
  }, [chats, selectedChatId]);

  return (
    <>
      <div className="grid grid-cols-3 gap-1.5">
        <Button
          type="button"
          aria-pressed={section === "conversations"}
          onClick={() => setSection("conversations")}
          className={tabClassName(section === "conversations")}
        >
          <span className="flex flex-col items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {t("privateConversations")}
          </span>
        </Button>
        <Button
          type="button"
          aria-pressed={section === "users"}
          onClick={() => setSection("users")}
          className={tabClassName(section === "users")}
        >
          <span className="flex flex-col items-center gap-1">
            <Users className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {t("findUsers")}
          </span>
        </Button>
        <Button
          type="button"
          aria-pressed={section === "requests"}
          onClick={() => setSection("requests")}
          className={tabClassName(section === "requests")}
        >
          <span className="flex flex-col items-center gap-1">
            <Inbox className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {t("messageRequests")}
          </span>
        </Button>
      </div>

      {section === "conversations" ? (
        <>
          <div className="relative w-full">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <InputField
              type="text"
              value={conversationQuery}
              onChange={(event) => setConversationQuery(event.target.value)}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchPlaceholder")}
              autoComplete="off"
              className={searchInputClassName}
            />
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
            {visibleChats.length === 0 ? (
              <p className="px-2 py-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                {t("noConversationsFound")}
              </p>
            ) : (
              visibleChats.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => onSelectChat(chat.id)}
                  className={`flex w-full items-center justify-between gap-2 rounded-2xl p-3.5 text-start transition-all duration-300 ${
                    selectedChatId === chat.id
                      ? "border border-zinc-200/80 bg-white text-zinc-900 shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      : "text-zinc-700 hover:bg-zinc-100/80 dark:text-zinc-300 dark:hover:bg-zinc-800/40"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3.5 overflow-hidden">
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-zinc-200/50 bg-zinc-200 shadow-inner dark:border-zinc-700/50 dark:bg-zinc-800">
                      {isSafeImageSrc(chat.avatarUrl) ? (
                        <Image
                          src={chat.avatarUrl}
                          alt={chat.senderName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold uppercase text-zinc-600 dark:text-zinc-300">
                          {chat.senderName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-col truncate">
                      <h3 className="truncate text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {chat.senderName}
                      </h3>
                      {chat.lastMessage ? (
                        <p className="max-w-[130px] truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                          {translateChatMessage(t, chat.lastMessage)}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {chat.unreadCount > 0 ? (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-md shadow-amber-500/30">
                      {chat.unreadCount}
                    </span>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </>
      ) : section === "users" ? (
        <>
          <div className="relative w-full">
            <Users className="pointer-events-none absolute start-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <InputField
              type="text"
              value={userQuery}
              onChange={(event) => setUserQuery(event.target.value)}
              placeholder={t("searchUsersPlaceholder")}
              aria-label={t("searchUsersPlaceholder")}
              autoComplete="off"
              className={searchInputClassName}
            />
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
            {visibleUsers.length === 0 ? (
              <p className="px-2 py-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                {t("noUsersFound")}
              </p>
            ) : (
              visibleUsers.map((user) => (
                <button
                  key={user.key}
                  type="button"
                  onClick={() => openUser(user.name)}
                  className={`flex w-full items-center justify-between rounded-2xl p-3.5 text-start transition-all duration-300 ${
                    selectedUserKey === user.key
                      ? "border border-zinc-200/80 bg-white text-zinc-900 shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      : "text-zinc-700 hover:bg-zinc-100/80 dark:text-zinc-300 dark:hover:bg-zinc-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-zinc-200/50 bg-zinc-200 shadow-inner dark:border-zinc-700/50 dark:bg-zinc-800">
                      {isSafeImageSrc(user.avatarUrl) ? (
                        <Image
                          src={user.avatarUrl}
                          alt={user.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold uppercase text-zinc-600 dark:text-zinc-300">
                          {user.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <h3 className="truncate text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {user.name}
                    </h3>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          {(
            [
              [t("incomingRequests"), groupedChats.incoming, t("noIncomingRequests")],
              [t("outgoingRequests"), groupedChats.outgoing, t("noOutgoingRequests")],
            ] as const
          ).map(([heading, requestChats, emptyLabel]) => (
            <div key={heading} className="flex flex-col gap-2">
              <p className="px-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                {heading}
              </p>
              {requestChats.length === 0 ? (
                <p className="px-2 py-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                  {emptyLabel}
                </p>
              ) : (
                requestChats.map((chat) => (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => onSelectChat(chat.id)}
                    className={`flex w-full items-center justify-between gap-2 rounded-2xl p-3.5 text-start transition-all duration-300 ${
                      selectedChatId === chat.id
                        ? "border border-zinc-200/80 bg-white text-zinc-900 shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                        : "text-zinc-700 hover:bg-zinc-100/80 dark:text-zinc-300 dark:hover:bg-zinc-800/40"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3.5 overflow-hidden">
                      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-zinc-200/50 bg-zinc-200 shadow-inner dark:border-zinc-700/50 dark:bg-zinc-800">
                        {isSafeImageSrc(chat.avatarUrl) ? (
                          <Image
                            src={chat.avatarUrl}
                            alt={chat.senderName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold uppercase text-zinc-600 dark:text-zinc-300">
                            {chat.senderName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <h3 className="truncate text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {chat.senderName}
                      </h3>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        chat.requestStatus === "rejected"
                          ? "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200"
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {chat.requestStatus === "rejected"
                        ? t("requestRejected")
                        : t("requestPending")}
                    </span>
                  </button>
                ))
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
});

const MyChatPageContent = () => {
  const t = useTranslations("MyChatPage");
  const locale = useLocale();
  const searchParams = useSearchParams();

  const {
    chats,
    selectedChatId,
    setSelectedChatId,
    sendMessage,
    markAsRead,
    setChats,
    acceptRequest,
    rejectRequest,
    resendRequest,
  } = useChatStore();

  const mounted = useHydrated();
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [threadError, setThreadError] = useState("");
  const [thread, setThread] = useState<Array<{ id: number; senderId: number; text: string; imageUrl: string | null; deleted: boolean; createdAt: string }>>([]);
  const [loadedThreadId, setLoadedThreadId] = useState<number | null>(null);
  const threadLoading = typeof selectedChatId === "number" && loadedThreadId !== selectedChatId;
  if (typeof selectedChatId !== "number" && loadedThreadId !== null) {
    setLoadedThreadId(null);
    setThread([]);
  } else if (typeof selectedChatId === "number" && loadedThreadId !== null && loadedThreadId !== selectedChatId && thread.length > 0) {
    setThread([]);
  }
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const sessionReady = useUserStore((state) => state.sessionReady);
  const myId = Number(useUserStore((state) => state.user?.id) || 0);
  const [threadChosen, setThreadChosen] = useState(false);
  const [threadDismissed, setThreadDismissed] = useState(false);
  const openedFromQuery = Boolean(searchParams.get("with"));
  const mobileThreadOpen = (openedFromQuery || threadChosen) && !threadDismissed;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedChat = useMemo(
    () => chats.find((chat) => chat.id === selectedChatId) ?? null,
    [chats, selectedChatId],
  );
  const chatIsAccepted = selectedChat ? isAcceptedChat(selectedChat) : false;

  const handleSelectChat = useCallback(
    (id: string | number) => {
      setSelectedChatId(id);
      setThreadDismissed(false);
      setThreadChosen(true);
    },
    [setSelectedChatId],
  );

  const handleSelectUser = useCallback(
    (name: string) => {
      setThreadError("");
      void apiRequest<{ user: { id: number } }>(`/api/users/${encodeURIComponent(name)}`)
        .then((profile) => apiRequest<{ conversation: { id: number } }>("/api/conversations", {
          method: "POST",
          body: { sellerId: profile.user.id },
        }))
        .then(async (created) => {
          const result = await apiRequest<{ conversations: Array<{ id: number; buyer: { id: number; username: string; avatarUrl: string | null }; seller: { id: number; username: string; avatarUrl: string | null }; lastMessage: string | null; lastMessageAt: string | null; unreadCount: number }> }>("/api/conversations");
          const me = Number(useUserStore.getState().user?.id || 0);
          setChats(result.conversations.map((conversation) => {
            const other = conversation.buyer.id === me ? conversation.seller : conversation.buyer;
            return {
              id: conversation.id,
              senderId: other.id,
              senderName: other.username,
              avatarUrl: other.avatarUrl ?? "",
              lastMessage: conversation.lastMessage ?? "",
              timestamp: conversation.lastMessageAt ?? "",
              unreadCount: conversation.unreadCount,
              requestStatus: "accepted" as const,
            };
          }));
          setSelectedChatId(created.conversation.id);
          setThreadDismissed(false);
          setThreadChosen(true);
        })
        .catch((error: unknown) => setThreadError(error instanceof ApiError ? error.message : t("loadError")));
    },
    [setChats, setSelectedChatId, t],
  );

  useEffect(() => {
    if (!mounted) return;
    if (!sessionReady || !isAuthenticated) {
      setChats([]);
      return;
    }
    let cancelled = false;
    void apiRequest<{ conversations: Array<{ id: number; buyer: { id: number; username: string; avatarUrl: string | null }; seller: { id: number; username: string; avatarUrl: string | null }; lastMessage: string | null; lastMessageAt: string | null; unreadCount: number }> }>("/api/conversations")
      .then(async (result) => {
        if (cancelled) return;
        const me = Number(useUserStore.getState().user?.id || 0);
        const mapped = result.conversations.map((conversation) => {
          const other = conversation.buyer.id === me ? conversation.seller : conversation.buyer;
          return {
            id: conversation.id,
            senderId: other.id,
            senderName: other.username,
            avatarUrl: other.avatarUrl ?? "",
            lastMessage: conversation.lastMessage ?? "",
            timestamp: conversation.lastMessageAt ?? "",
            unreadCount: conversation.unreadCount,
            requestStatus: "accepted" as const,
          };
        });
        setChats(mapped);
        const withName = new URLSearchParams(window.location.search).get("with");
        if (!withName) return;
        const profile = await apiRequest<{ user: { id: number } }>(`/api/users/${encodeURIComponent(withName)}`);
        const created = await apiRequest<{ conversation: { id: number } }>("/api/conversations", {
          method: "POST",
          body: { sellerId: profile.user.id },
        });
        if (cancelled) return;
        const refreshed = await apiRequest<{ conversations: Array<{ id: number; buyer: { id: number; username: string; avatarUrl: string | null }; seller: { id: number; username: string; avatarUrl: string | null }; lastMessage: string | null; lastMessageAt: string | null; unreadCount: number }> }>("/api/conversations");
        if (cancelled) return;
        const currentId = Number(useUserStore.getState().user?.id || 0);
        setChats(refreshed.conversations.map((conversation) => {
          const other = conversation.buyer.id === currentId ? conversation.seller : conversation.buyer;
          return {
            id: conversation.id,
            senderId: other.id,
            senderName: other.username,
            avatarUrl: other.avatarUrl ?? "",
            lastMessage: conversation.lastMessage ?? "",
            timestamp: conversation.lastMessageAt ?? "",
            unreadCount: conversation.unreadCount,
            requestStatus: "accepted" as const,
          };
        }));
        setSelectedChatId(created.conversation.id);
        setThreadChosen(true);
      })
      .catch((error: unknown) => {
        if (!cancelled) setThreadError(error instanceof ApiError ? error.message : t("loadError"));
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, mounted, sessionReady, setChats, setSelectedChatId, t]);

  useEffect(() => {
    if (typeof selectedChatId !== "number") return;
    let cancelled = false;
    void apiRequest<{ messages: Array<{ id: number; senderId: number; text: string; imageUrl: string | null; deleted: boolean; createdAt: string }> }>(`/api/conversations/${selectedChatId}/messages`)
      .then((result) => {
        if (!cancelled) {
          setThread(result.messages);
          setLoadedThreadId(selectedChatId);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setThreadError(error instanceof ApiError ? error.message : t("loadError"));
          setLoadedThreadId(selectedChatId);
        }
      });
    void apiRequest(`/api/conversations/${selectedChatId}/read`, { method: "PATCH" })
      .then(() => markAsRead(selectedChatId))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [markAsRead, selectedChatId, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChatId, chats, selectedChat?.lastMessage]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !isAcceptedChat(selectedChat) || sending) return;
    const text = messageInput.trim();
    if ((!text && !selectedFile) || typeof selectedChat.id !== "number") return;
    const file = selectedFile;
    setSending(true);
    setMessageInput("");
    setSelectedFile(null);
    setSelectedImage(null);
    try {
      let imageUrl: string | undefined;
      if (file) {
        const formData = new FormData();
        formData.append("messageImage", file);
        const uploaded = await apiRequest<{ imageUrl: string }>(`/api/conversations/${selectedChat.id}/attachments`, {
          method: "POST",
          formData,
        });
        imageUrl = uploaded.imageUrl;
      }
      const result = await apiRequest<{ message: { id: number; senderId: number; text: string; imageUrl: string | null; createdAt: string } }>(`/api/conversations/${selectedChat.id}/messages`, {
        method: "POST",
        body: { ...(text ? { text } : {}), ...(imageUrl ? { imageUrl } : {}) },
      });
      setThread((current) => [...current, { ...result.message, deleted: false }]);
      sendMessage(selectedChat.id, text || "Image");
      void triggerNotificationByPreference("messages", t("messageSentTo", { name: selectedChat.senderName }), { body: text, icon: "/favicon.ico" });
    } catch (error: unknown) {
      setMessageInput(text);
      setSelectedFile(file);
      setThreadError(error instanceof ApiError ? error.message : t("loadError"));
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = (messageId: number) => {
    void apiRequest(`/api/messages/${messageId}`, { method: "DELETE" })
      .then(() => {
        setThread((current) => current.map((item) => item.id === messageId ? { ...item, deleted: true, text: "" } : item));
      })
      .catch((error: unknown) => setThreadError(error instanceof ApiError ? error.message : t("loadError")));
  };

  if (!mounted) return null;

  return (
    <div className="flex h-dvh w-full min-w-0 flex-col overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/50">
      <Alert />
      <div className="grid w-full min-w-0 grid-cols-1 overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-2xl h-full min-h-0 flex-1 md:grid-cols-3 lg:grid-cols-4 dark:border-zinc-800/80 dark:bg-zinc-900">
        <div
          className={`${
            mobileThreadOpen ? "hidden md:flex" : "flex"
          }  min-h-0 flex-col gap-4 border-zinc-200/60 bg-zinc-50/30 p-4 md:col-span-1 md:border-r dark:border-zinc-800/60 dark:bg-zinc-900/50`}
        >
          <ChatSidebar
            chats={chats}
            selectedChatId={selectedChatId}
            onSelectChat={handleSelectChat}
            onSelectUser={handleSelectUser}
          />
        </div>

        <div
          className={`${
            mobileThreadOpen ? "flex" : "hidden md:flex"
          } col-span-1 h-full min-w-0 flex-col justify-between bg-zinc-100/60 p-4 md:col-span-2 lg:col-span-3 lg:p-6 dark:bg-zinc-950/40`}
        >
          {selectedChat ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 pb-4 dark:border-zinc-800/80">
                <div className="flex min-w-0 items-center gap-3.5">
                  <NormalButton
                    type="button"
                    variant="ghost"
                    onClick={() => setThreadDismissed(true)}
                    className="h-10 shrink-0 px-2 md:hidden"
                  >
                    <ArrowLeft className="size-4" aria-hidden />
                    {t("backToList")}
                  </NormalButton>
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-amber-500/30 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shadow-md">
                    {isSafeImageSrc(selectedChat.avatarUrl) ? (
                      <Image
                        src={selectedChat.avatarUrl}
                        alt={selectedChat.senderName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold uppercase text-zinc-600 dark:text-zinc-300">
                        {selectedChat.senderName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {selectedChat.senderName}
                      </h3>
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    </div>
                    <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1.5 mt-0.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      {t("online")}
                    </span>
                  </div>
                </div>

                </div>

              <div className="flex flex-col gap-4 py-6 overflow-y-auto flex-1 px-2 custom-scrollbar">
                {chatIsAccepted ? (
                  <div className="flex flex-col gap-3">
                    {threadLoading ? <p className="text-xs text-zinc-500">{t("loading")}</p> : null}
                    {threadError ? <p className="text-xs text-red-600">{threadError}</p> : null}
                    {!threadLoading && thread.length === 0 ? <p className="text-xs text-zinc-500">{t("emptyThread")}</p> : null}
                    {thread.map((item) => {
                      const mine = item.senderId === myId;
                      return (
                        <div key={item.id} className={`group relative flex max-w-[75%] flex-col gap-1.5 rounded-2xl border p-4 text-xs shadow-md ${mine ? "self-end bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "self-start bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"}`}>
                          {item.deleted ? <p className="leading-relaxed">{t("messageDeleted")}</p> : (
                            <>
                              {item.text ? <p className="leading-relaxed">{item.text}</p> : null}
                              {item.imageUrl ? (
                                <div
                                  role="img"
                                  aria-label={t("attachImage")}
                                  className="h-40 w-full rounded-xl bg-cover bg-center"
                                  style={{ backgroundImage: `url(${API_URL}${item.imageUrl})` }}
                                />
                              ) : null}
                            </>
                          )}
                          <span className="self-end text-[10px] opacity-70">{formatDateTime(item.createdAt, locale)}</span>
                          {mine && !item.deleted ? (
                            <Button type="button" onClick={() => handleDeleteMessage(item.id)} className="absolute right-2 top-2 rounded p-1 text-red-500" aria-label={t("delete")}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex max-w-sm flex-col gap-4 self-start rounded-2xl border border-zinc-200/80 bg-white p-4 text-xs text-zinc-700 shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                    <p className="leading-relaxed">
                      {selectedChat.requestStatus === "rejected"
                        ? selectedChat.requestDirection === "incoming"
                          ? t("rejectedIncomingNotice")
                          : t("rejectedOutgoingNotice")
                        : selectedChat.requestDirection === "incoming"
                          ? t("incomingPendingNotice")
                          : t("outgoingPendingNotice")}
                    </p>
                    {selectedChat.requestStatus === "pending" &&
                    selectedChat.requestDirection === "incoming" ? (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          onClick={() => acceptRequest(selectedChat.id)}
                          className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white"
                        >
                          {t("acceptRequest")}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => rejectRequest(selectedChat.id)}
                          className="rounded-xl bg-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                        >
                          {t("rejectRequest")}
                        </Button>
                      </div>
                    ) : null}
                    {selectedChat.requestStatus === "rejected" &&
                    selectedChat.requestDirection === "outgoing" ? (
                      <Button
                        type="button"
                        onClick={() => resendRequest(selectedChat.id)}
                        className="w-fit rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white dark:bg-white dark:text-zinc-900"
                      >
                        {t("requestAgain")}
                      </Button>
                    ) : null}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {chatIsAccepted && selectedImage && isSafeImageSrc(selectedImage) && (
                <div className="relative mb-2 h-24 w-24 overflow-hidden rounded-2xl border-2 border-amber-500 shadow-md">
                  {selectedImage.startsWith("data:image/") ? (
                    <div role="img" aria-label={t("previewAlt")} className="absolute inset-0 h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${selectedImage})` }} />
                  ) : (
                    <Image
                      src={selectedImage}
                      alt={t("previewAlt")}
                      fill
                      className="object-cover"
                    />
                  )}
                  <Button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-1 right-1 p-1 bg-zinc-900/80 text-white rounded-full hover:bg-zinc-900"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {chatIsAccepted ? (
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-3 pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all shadow-sm"
                  title={t("attachImage")}
                  aria-label={t("attachImage")}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>

                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={t("typeMessagePlaceholder")}
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 py-3.5 px-5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:focus:ring-amber-500/20 transition-all shadow-sm"
                />

                <NormalButton
                  type="submit"
                  variant="default"
                  className="rounded-2xl px-5 py-3.5 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 text-white shadow-md transition-all flex items-center justify-center shrink-0"
                >
                  <Send className="h-4 w-4" />
                </NormalButton>
              </form>
              ) : null}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <div className="h-16 w-16 rounded-3xl bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-400 shadow-md">
                <MessageSquare className="h-8 w-8" />
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs font-medium">
                {t("selectChatPrompt")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MyChatPageFallback = () => (
  <div className="flex min-h-dvh items-center justify-center text-zinc-500 dark:text-zinc-400">
    <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
  </div>
);

const MyChatPage = () => (
  <Suspense fallback={<MyChatPageFallback />}>
    <MyChatPageContent />
  </Suspense>
);

export default MyChatPage;
