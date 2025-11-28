"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

import { getAllCollabs } from "@/data/collabPosts";
import { ManageCollabHeader } from "../../components/Header";
import { Plus, X } from "lucide-react";


const inputBase = "w-full rounded-[15px] border border-[#2FD3D8]/40 bg-transparent px-5 py-3 text-sm text-black placeholder:text-black focus:border-[#2FD3D8] focus:outline-none";


export default function ManageCollab() {
    const collabPosts = getAllCollabs();

    const [posterPreview, setPosterPreview] = React.useState<string>("");
    const [collabTitle, setCollabTitle] = React.useState("");
    const [collabIdea, setCollabIdea] = React.useState("");
    const [tagInput, setTagInput] = React.useState("");
    const [tags, setTags] = React.useState<string[]>([]);

    const handlePosterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            if (typeof loadEvent.target?.result === "string") {
                setPosterPreview(loadEvent.target.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleAddTag = () => {
        const value = tagInput.trim();
        if (!value || tags.includes(value)) return;
        setTags((prev) => [...prev, value]);
        setTagInput("");
    };

    const handleRemoveTag = (value: string) => {
        setTags((prev) => prev.filter((tag) => tag !== value));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log("Collab submitted", {
            collabTitle,
            collabIdea,
            tags,
            posterPreview,
        });
    };
    const TagPill = ({ label }: { label: string }) => (
        <span className="rounded-full border border-[#0FC6D1] px-4 py-1 text-xs font-medium text-[#0FC6D1]">{label}</span>
    );

    return (
        <div className="space-y-10">
            <ManageCollabHeader />
            <section className="space-y-10">
                <section className="rounded-[36px] p-6">
                    <form onSubmit={handleSubmit} className="flex sm:flex-row flex-col gap-6">
                        <div className="rounded-[32px] p-2 text-center text-sm text-black/70">
                            <div className="relative flex h-[197px] w-[326px] items-center justify-center overflow-hidden rounded-[24px] bg-[#D9D9D9]">
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg"
                                    className="absolute inset-0 cursor-pointer opacity-0"
                                    onChange={handlePosterChange}
                                />
                                {posterPreview ? (
                                    <Image
                                        src={posterPreview}
                                        alt="Poster preview"
                                        fill
                                        sizes="(max-width: 960px) 100vw, 340px"
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <span>Upload poster / moodboard</span>
                                )}
                            </div>
                            <p className="mt-4 text-xs text-black/60">16:9 recommended • PNG / JPG up to 5MB</p>
                        </div>
                        <div className="space-y-1 text-black w-full">
                            <input
                                className={inputBase}
                                placeholder="Collab title"
                                value={collabTitle}
                                onChange={(e) => setCollabTitle(e.target.value)}
                            />
                            <textarea
                                className={`${inputBase} min-h-[110px] rounded-3xl`}
                                placeholder="What&apos;s your collab idea?"
                                value={collabIdea}
                                onChange={(e) => setCollabIdea(e.target.value)}
                            />
                            <div className="space-y-1 max-h-30 overflow-y-auto mb-3">
                                <div className="flex gap-3 border rounded-2xl p-1 border-[#2FD3D8]">
                                    <input
                                        className={" border-none focus:outline-none px-3.5 bg-transparent w-full"}
                                        placeholder="Add collab tags"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") {
                                                event.preventDefault();
                                                handleAddTag();
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddTag}
                                        className="whitespace-nowrap rounded-[15px] h-[41px] px-4 py-3 text-sm font-[400] text-[#FA6E80]"
                                    >
                                        <Plus className="h-6 w-6" />
                                    </button>
                                </div>
                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((tag) => (
                                            <span key={tag} className="inline-flex items-center gap-2 rounded-[15px] border border-[#2FD3D8] px-4 py-1 text-xs font-medium text-[#2FD3D8]">
                                                {tag}
                                                <button type="button" onClick={() => handleRemoveTag(tag)} aria-label={`Remove ${tag}`}>
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button type="submit" className="w-full  rounded-[15px] h-[41px]  bg-[#FA6E80] py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#f5576b]">
                                Post your collab
                            </button>
                        </div>
                    </form>
                </section>

                {collabPosts.map((post) => (
                    <Link
                        href={`/collab/manage-collab/${post.id}`}
                        key={post.id}
                        className="flex w-full flex-col gap-6 rounded-[36px] bg-white px-5 md:flex-row"
                    >
                        <div className="overflow-hidden rounded-[10px] md:min-w-[360px]">
                            <Image
                                src={post.cover}
                                alt={post.title}
                                width={326}
                                height={167}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="flex flex-1 flex-col gap-4 text-gray-800">
                            <div className="text-sm text-gray-500">Posted on {post.postedOn}</div>
                            <div>
                                <h3 className="text-2xl font-semibold text-gray-900">{post.title}</h3>
                                <p className="mt-3 text-sm leading-relaxed text-gray-600">{post.summary}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag) => (
                                    <TagPill key={tag} label={tag} />
                                ))}
                            </div>
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center">
                                        {post.interestAvatars.map((avatar, index) => (
                                            <Image
                                                key={`${avatar}-${index}`}
                                                src={avatar}
                                                alt="Interested member"
                                                width={28}
                                                height={28}
                                                className="rounded-full border-2 border-white object-cover shadow"
                                                style={{ marginLeft: index === 0 ? 0 : -12 }}
                                                unoptimized
                                            />
                                        ))}
                                    </div>
                                    <div className="text-sm font-medium text-gray-600">
                                        <span className="mr-1 text-[#0FC6D1]">{post.interests}</span>
                                        interested
                                    </div>
                                </div>

                            </div>

                        </div>
                    </Link>
                ))}
            </section>
        </div>
    )
}