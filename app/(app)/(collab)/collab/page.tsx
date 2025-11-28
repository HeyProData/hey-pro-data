"use client";
import Image from "next/image";
import { Heart, MessageCircle, Share2, } from "lucide-react";
import React from "react";

import { Header } from "../components/Header";
import Comment from "@/components/comment/comment";

type CollabPost = {
    id: number;
    title: string;
    summary: string;
    tags: string[];
    status: "waitlisted" | "interested";
    interests: number;
    interestAvatars: string[];
    postedOn: string;
    author: string;
    avatar: string;
    cover: string;
};

const collabPosts: CollabPost[] = [
    {
        id: 1,
        title: "Midnight Circus | Horror Launch",
        summary:
            "Enter a chilling world of suspense and terror where every shadow hides a secret and every whisper could be a scream. Our horror film delves into the eerie silence of an isolated house, where dark pasts resurface and the line between reality and nightmare blurs.",
        tags: ["film writing", "screenplay", "creativity", "collaboration", "movie launch"],
        status: "waitlisted",
        interests: 18,
        interestAvatars: ["/image (1).png", "/image (2).png", "/image (3).png"],
        postedOn: "15 Oct, 2025",
        author: "Michael Molar",
        avatar: "/image (2).png",
        cover: "/bg.jpg",
    },
    {
        id: 2,
        title: "Psychological Thriller Anthology",
        summary:
            "Join forces to craft a series of unsettling vignettes that peel back the layers of the human mind. We are blending noir visuals with experimental sound design to deliver an experience that lingers long after the credits roll.",
        tags: ["film writing", "screenplay", "creativity", "collaboration", "movie launch"],
        status: "interested",
        interests: 15,
        interestAvatars: ["/image (1).png", "/image (2).png", "/image (3).png"],
        postedOn: "12 Oct, 2025",
        author: "Michael Molar",
        avatar: "/image (2).png",
        cover: "/bg.jpg",
    },
];


const TagPill = ({ label }: { label: string }) => (
    <span className="rounded-[40px] h-[24px] flex justify-center items-center border border-[#2FD3D8] px-4 py-1 text-xs font-medium text-[#2FD3D8]">{label}</span>
);

const StatusButton = ({ status }: { status: CollabPost["status"] }) => {
    if (status === "waitlisted") {
        return <button className="rounded-[33px] w-[103px] bg-[#2FD3D8] px-6 py-2 text-sm font-[600] text-black">Waitlisted</button>;
    }
    return <button className="rounded-[33px] w-[129px] border flex items-center justify-center border-[#2FD3D8] px-2 py-2 text-[14px] font-[600] text-[#2FD3D8]">I&apos;m interested</button>;
};

export default function Collab() {
    return (
        <div className=" flex flex-col items-center h-screen overflow-x-auto">
            <Header />

            <div className="mt-16 sm:max-w-[960px] max-w-[393px] w-full h-full max-h-[537px] space-y-10 text-black bg-transparent">
                <section className="space-y-8">
                    {collabPosts.map((post) => (
                        <article key={post.id} className="grid gap-6 md:grid-cols-[360px_auto] p-2">
                            <div className="overflow-hidden ">
                                <Image
                                    src={post.cover}
                                    alt={post.title}
                                    width={360}
                                    height={220}
                                    className="h-full w-full object-cover rounded-[10px]"
                                />
                            </div>
                            <div className="rounded-[32px] border border-white/10 p-6">
                                <div className="flex items-center gap-3">
                                    <Image
                                        src={post.avatar}
                                        alt={post.author}
                                        width={48}
                                        height={48}
                                        className="rounded-full border border-white/10"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-black">{post.author}</p>
                                        <p className="text-xs text-black/60">Posted on {post.postedOn}</p>
                                    </div>
                                </div>
                                <p className="text-[18px] font-[400]">{post.title}</p>
                                <p className="mt-4 text-sm leading-relaxed text-black">{post.summary}</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {post.tags.map((tag) => (
                                        <TagPill key={tag} label={tag} />
                                    ))}
                                </div>
                                <div className="mt-6 flex sm:flex-wrap flex-row items-center gap-4 text-sm text-white/70">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center">
                                            {post.interestAvatars.map((avatar, index) => (
                                                <Image
                                                    key={`${avatar}-${index}`}
                                                    src={avatar}
                                                    alt="Interested member"
                                                    width={25}
                                                    height={25}
                                                    className="rounded-full object-cover"
                                                    style={{ marginLeft: index === 0 ? 0 : -10 }}
                                                    unoptimized
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs hidden sm:flex text-black/70">{post.interests} interested</span>
                                    </div>
                                    <div className="ml-auto flex items-center gap-3">
                                        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAFAFA] text-[#FA6E80] ">
                                            <Heart className="h-5 w-5" />
                                        </button>
                                        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAFAFA] text-[#31A7AC] ">
                                            <Share2 className="h-5 w-5" />
                                        </button>
                                        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAFAFA]  text-black ">
                                            <Comment />
                                        </button>
                                        <StatusButton status={post.status} />
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </section>
            </div>
        </div>
    );
}