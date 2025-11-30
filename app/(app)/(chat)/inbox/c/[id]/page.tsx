"use client";
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, EllipsisVertical, Paperclip, Send } from "lucide-react";
import { getChatUser, getMessagesBetweenUsers } from "@/data/chatMessage";
import Image from "next/image";
import Link from "next/link";
type paramsType = { id: string };
export default function MessageInbox({ params }: { params: paramsType }) {
    const { id } = params;
    // Simulate current user
    const currentUser = {
        messageId: "msg-1", // This should match your chatData for the current user
        name: "You",
        image: "/image (2).png",
        state: "online",
    };
    // Get chat user and messages
    const chatUser = getChatUser(id);
    // Get all messages between current user and chat user
    const initialMessages = chatUser
        ? getMessagesBetweenUsers(currentUser.messageId, chatUser.messageId)
        : [];
    // Message input state
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState(initialMessages);

    // Send message handler
    const handleSend = () => {
        if (message.trim().length === 0 || !chatUser) return;
        const newMsg = {
            id: `messageId-${messages.length + 1}`,
            senderId: currentUser.messageId,
            receiverId: chatUser.messageId,
            timestamp: new Date().toISOString(),
            content: message,
            status: "sending",
        };
        setMessages([...messages, newMsg]);
        setMessage("");
        // Simulate sending delay
        setTimeout(() => {
            setMessages((msgs) =>
                msgs.map((msg) =>
                    msg.id === newMsg.id ? { ...msg, status: "sent" } : msg
                )
            );
        }, 800);
    };

    return (
        <div className="w-full h-full flex flex-col justify-between">
            {/* Header */}
            <div className="w-full flex flex-row justify-between items-center px-4 sm:px-5 bg-[#F4F4F4] rounded-t-2xl h-20">
                <div className="flex items-center gap-2 sm:gap-1 relative">
                    <Link href={"/inbox"} className="sm:hidden flex"><ArrowLeft className="h-6 w-6" /></Link>
                    <Image
                        src={chatUser?.image || "/default-profile.png"}
                        alt={chatUser?.name || "User Profile"}
                        width={45}
                        height={45}
                        className="rounded-full"
                    />
                    {chatUser?.state == 'online' && (
                        <span className="absolute left-9 bottom-1 block h-2 w-2 ring ring-white rounded-full bg-[#34A353]" />
                    )}
                    <div>
                        <div className="text-black font-medium text-lg ">{chatUser?.name || "User Name"}</div>
                        <div className={`${chatUser?.state === 'online' ? 'text-[#34A353]' : 'text-gray-500'} text-sm font-normal`}>{chatUser?.state || "Online"}</div>
                    </div>
                </div>
                <EllipsisVertical className="text-black" />
            </div>

            {/* Messages */}
            <div className="flex-1 w-full flex flex-col overflow-y-auto px-2 sm:px-4 py-4 sm:py-6 bg-white no-scrollbar">
                <div className="mx-auto w-full max-w-2xl">
                    {messages.map((msg, index) => {
                        const isSender = msg.senderId === currentUser.messageId;
                        const prevMsg = messages[index - 1];
                        const nextMsg = messages[index + 1];
                        const isPrevSameSender = prevMsg && prevMsg.senderId === msg.senderId;
                        const isNextSameSender = nextMsg && nextMsg.senderId === msg.senderId;
                        const marginBottom = isNextSameSender ? "mb-1" : "mb-6";
                        let borderRadiusClass = "rounded-2xl";
                        if (isSender) {
                            if (isNextSameSender && !isPrevSameSender) borderRadiusClass = "rounded-2xl rounded-br-none";
                            else if (isPrevSameSender && isNextSameSender) borderRadiusClass = "rounded-2xl rounded-tr-none rounded-br-none";
                            else if (isPrevSameSender && !isNextSameSender) borderRadiusClass = "rounded-2xl rounded-tr-none";
                        } else {
                            if (isNextSameSender && !isPrevSameSender) borderRadiusClass = "rounded-2xl rounded-bl-none";
                            else if (isPrevSameSender && isNextSameSender) borderRadiusClass = "rounded-2xl rounded-tl-none rounded-bl-none";
                            else if (isPrevSameSender && !isNextSameSender) borderRadiusClass = "rounded-2xl rounded-tl-none";
                        }
                        const showTime = !nextMsg || nextMsg.timestamp !== msg.timestamp;
                        const formattedTime = format(new Date(msg.timestamp), "h:mm a");
                        return (
                            <div key={msg.id || index} className={`flex w-full flex-col ${isSender ? 'items-end' : 'items-start'} ${marginBottom}`}>
                                <div
                                    className={`max-w-[85vw] sm:max-w-[50%] px-4 sm:px-5 py-3 text-[14px] leading-relaxed ${borderRadiusClass} ${isSender ? 'bg-[#F2F2F2] text-[#181818] font-medium text-[12px]' : 'bg-[#31A7AC] text-white font-medium text-[12px]'}`}
                                >
                                    {msg.content}
                                    {isSender && msg.status === "sending" && (
                                        <span className="ml-2 text-xs text-gray-400">Sending...</span>
                                    )}
                                </div>
                                {showTime && (
                                    <span className={`text-xs text-gray-400 mt-1 ${isSender ? 'text-right' : 'text-left'}`}>{formattedTime}</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Input Bar */}
            <div className="w-full mx-auto max-w-2xl border border-[#FA596E] rounded-full flex items-center gap-2 sm:gap-3 h-14 px-2 sm:px-2.5 bg-white z-50">
                <Input
                    placeholder="Message ..."
                    className="border-none shadow-none text-[14px] font-normal flex-1"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
                />
                <Button className="size-11 rounded-full flex items-center justify-center bg-[#FA596E]" type="button">
                    <Paperclip className="text-[#ffffff] size-6" />
                </Button>
                <Button className="size-11 rounded-full flex items-center justify-center bg-[#FA596E]" type="button" onClick={handleSend}>
                    <Send className="text-[#ffffff] size-6" />
                </Button>
            </div>
        </div>
    );
}