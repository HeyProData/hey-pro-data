"use client";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, EllipsisVertical, Paperclip, Send } from "lucide-react";
import { getChatUser, Groups, getGroupChatMessages, chatData, getGroupChat } from "@/data/chatMessage";
import Image from "next/image";
import Link from "next/link";

type paramsType = { id: string };

type GroupMessage = {
    id: string;
    groupId: string;
    senderId: string;
    content: string;
    timestamp: string;
    status: string;
};

export default function GroupMessageInbox({ params }: { params: paramsType }) {
    const { id } = params;
    const scrollRef = useRef<HTMLDivElement>(null);

    // Simulate current user
    const currentUser = {
        id: 1,
        messageId: "msg-1",
        name: 'Victor George',
        image: '/image (1).png',
        state: 'online'
    };

    // Get Group Details
    const group = Groups.find((group) => group.messageId === id);
    const groupsData = getGroupChat(id);

    // Get initial messages
    const initialMessages: GroupMessage[] = group
        ? getGroupChatMessages(group.messageId)
        : [];

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<GroupMessage[]>(initialMessages);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (message.trim().length === 0 || !group) return;
        const newMsg: GroupMessage = {
            id: `groupMsg-${messages.length + 1}`,
            groupId: group.messageId,
            senderId: currentUser.messageId,
            content: message,
            timestamp: new Date().toISOString(),
            status: "sending",
        };
        setMessages([...messages, newMsg]);
        setMessage("");

        setTimeout(() => {
            setMessages((msgs) =>
                msgs.map((msg) =>
                    msg.id === newMsg.id ? { ...msg, status: "sent" } : msg
                )
            );
        }, 800);
    };

    return (
        <div className="w-full h-full flex flex-col bg-white">

            {/* Header */}
            <div className="shrink-0 w-full flex flex-row justify-between items-center px-4 sm:px-6 bg-[#F8F8F8] border-b border-gray-100 h-[80px]">
                <div className="flex items-center gap-3 overflow-hidden">
                    {/* Back Button (Mobile) */}
                    <Link href={"/inbox"} className="md:hidden flex p-2 -ml-2 rounded-full hover:bg-gray-200 shrink-0">
                        <ArrowLeft className="h-6 w-6 text-[#444444]" />
                    </Link>

                    {/* Group Avatars */}
                    <div className="flex -space-x-3 overflow-hidden p-1 shrink-0">
                        {groupsData?.image?.slice(0, 2).map((imgSrc, imgIdx) => (
                            <div key={imgIdx} className="relative z-0 hover:z-10 transition-all ring-2 ring-white rounded-full">
                                <Image
                                    src={imgSrc}
                                    alt={groupsData.name}
                                    className="rounded-full object-cover bg-gray-200"
                                    width={40}
                                    height={40}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Group Info */}
                    <div className="flex flex-col min-w-0">
                        <div className="text-black font-semibold text-[16px] sm:text-[18px] leading-tight truncate">
                            {groupsData?.name || "Group Name"}
                        </div>
                        {groupsData && groupsData.noofOnlinePeople > 0 && (
                            <div className="text-[#34A353] text-[12px] sm:text-[14px] font-medium truncate">
                                {groupsData.noofOnlinePeople} Online
                            </div>
                        )}
                    </div>
                </div>

                <button className="p-2 rounded-full hover:bg-gray-200 shrink-0">
                    <EllipsisVertical className="text-[#444444]" />
                </button>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 w-full overflow-y-auto px-2 sm:px-4 py-6 bg-white no-scrollbar"
            >
                <div className="mx-auto w-full  flex flex-col">
                    {messages.map((msg, index) => {
                        const isSender = msg.senderId === currentUser.messageId;
                        const prevMsg = messages[index - 1];
                        const nextMsg = messages[index + 1];

                        const isPrevSameSender = prevMsg && prevMsg.senderId === msg.senderId;
                        const isNextSameSender = nextMsg && nextMsg.senderId === msg.senderId;

                        const marginBottom = isNextSameSender ? "mb-[2px]" : "mb-6";

                        // Border Radius Logic
                        let borderRadiusClass = "rounded-[18px]";
                        if (isSender) {
                            if (isNextSameSender && !isPrevSameSender) borderRadiusClass = "rounded-[18px] rounded-br-none";
                            else if (isPrevSameSender && isNextSameSender) borderRadiusClass = "rounded-[18px] rounded-tr-none rounded-br-none";
                            else if (isPrevSameSender && !isNextSameSender) borderRadiusClass = "rounded-[18px] rounded-tr-none";
                        } else {
                            if (isNextSameSender && !isPrevSameSender) borderRadiusClass = "rounded-[18px] rounded-bl-none";
                            else if (isPrevSameSender && isNextSameSender) borderRadiusClass = "rounded-[18px] rounded-tl-none rounded-bl-none";
                            else if (isPrevSameSender && !isNextSameSender) borderRadiusClass = "rounded-[18px] rounded-tl-none";
                        }

                        // Find sender details for incoming messages
                        const sender = chatData.find((user) => user.messageId === msg.senderId);
                        const showTime = !nextMsg || nextMsg.timestamp !== msg.timestamp || !isNextSameSender;
                        const formattedTime = format(new Date(msg.timestamp), "h:mm a");

                        return (
                            <div key={msg.id || index} className={`flex w-full flex-col ${isSender ? 'items-end' : 'items-start'} ${marginBottom}`}>
                                <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[70%] ${isSender ? 'flex-row-reverse' : 'flex-row'}`}>

                                    {/* Avatar (Left side for others) */}
                                    {!isSender && (
                                        <div className="shrink-0 w-[28px] pb-1">
                                            {!isPrevSameSender && sender ? (
                                                <Image
                                                    src={sender.image || "/default-profile.png"}
                                                    alt={sender.name || "Sender"}
                                                    width={28}
                                                    height={28}
                                                    className="rounded-full object-cover h-[28px] w-[28px]"
                                                />
                                            ) : <div className="w-[28px]" />}
                                        </div>
                                    )}

                                    {/* Message Bubble */}
                                    <div className="flex flex-col min-w-0">
                                        {/* Sender Name in Group Chat (only for first message in sequence) */}
                                        {!isSender && !isPrevSameSender && sender && (
                                            <span className="text-[11px] text-gray-500 ml-3 mb-1 truncate max-w-[200px]">
                                                {sender.name}
                                            </span>
                                        )}

                                        <div
                                            className={`
                                                px-4 sm:px-5 py-3 text-[14px] leading-relaxed break-words
                                                ${borderRadiusClass} 
                                                ${isSender
                                                    ? 'bg-[#F2F2F2] text-[#181818]'
                                                    : 'bg-[#31A7AC] text-white'
                                                }
                                            `}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>

                                {/* Time Stamp */}
                                {showTime && (
                                    <div className={`flex items-center gap-1 mt-1 ${isSender ? 'mr-1' : 'ml-[44px]'}`}>
                                        <span className="text-[11px] text-gray-400">
                                            {formattedTime}
                                            {isSender && msg.status === "sending" && " • Sending..."}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Input Bar */}
            <div className="shrink-0 w-full bg-white px-2 sm:px-4 pb-4 pt-2">
                <div className="mx-auto w-full max-w-3xl border border-[#FA596E] rounded-full flex items-center gap-2 p-1 pl-4 h-[56px] shadow-sm">
                    <Input
                        placeholder="Message ..."
                        className="border-none shadow-none text-[15px] font-normal flex-1 focus-visible:ring-0 px-0 bg-transparent"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
                    />
                    <div className="flex items-center gap-1 pr-1 shrink-0">
                        <Button
                            className="h-10 w-10 rounded-full flex items-center justify-center bg-[#FA596E] hover:bg-[#fa4059] transition-colors p-0"
                            type="button"
                        >
                            <Paperclip className="text-white h-5 w-5" />
                        </Button>
                        <Button
                            className="h-10 w-10 rounded-full flex items-center justify-center bg-[#FA596E] hover:bg-[#fa4059] transition-colors p-0"
                            type="button"
                            onClick={handleSend}
                        >
                            <Send className="text-white h-5 w-5 ml-0.5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}