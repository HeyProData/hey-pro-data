/** @format */

"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HighlightItem {
    id: string;
    title: string;
    description: string;
    images: string;
}

interface HighlightsProps {
    highlights: HighlightItem[];
}

export const letters = Array.from("HIGHLIGHTS");
export const gradientText =
    "bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent";

export function HighlightCard({
    highlight,
    className = "",
}: {
    highlight: HighlightItem;
    className?: string;
}) {
    const words = highlight.description.trim().split(/\s+/);
    const truncated = words.slice(0, 20).join(" ");
    const hasMore = words.length > 20;

    return (
        <article className={`space-y-3 ${className}`}>
            <div className="relative w-[275px] h-[263px] overflow-hidden rounded-[8px]">
                <Image
                    src={highlight.images}
                    alt={highlight.title}
                    fill
                    sizes="275px"
                    className="object-cover"
                />
            </div>
            <h3 className="text-lg font-semibold">{highlight.title}</h3>
            <p className="text-sm text-gray-600">
                {truncated}
                {hasMore && (
                    <>
                        …<br /><Link href={'#'} className="ml-1 text-[#FA596E]">Read more</Link>
                    </>
                )}
            </p>
        </article>
    );
}

export default function Highlights({ highlights }: HighlightsProps) {
    if (!highlights?.length) {
        return null;
    }

    return (
        <section className="w-full hidden lg:block">
            <div className="hidden lg:flex gap-6">
                <aside className="sticky top-24 self-start w-full max-w-[336px] space-y-6">
                    <Button
                        variant="outline"
                        className="w-full h-11 rounded-[10px] border-[#31A7AC] text-black hover:bg-transparent"
                    >
                        Edit Highlights
                    </Button>
                    <div className="space-y-6">
                        {highlights.map((highlight) => (
                            <HighlightCard key={highlight.id} highlight={highlight} />
                        ))}
                    </div>
                </aside>

                <div className="flex flex-none flex-col items-center gap-4">
                    <div className="flex flex-col items-center gap-2">
                        {letters.map((char, index) => (
                            <span key={index} className={`text-xl font-bold leading-none ${gradientText}`}>
                                {char}
                            </span>
                        ))}
                    </div>
                    <div className="flex-1 w-px bg-gradient-to-b from-[#FA6E80] via-[#6A89BE] to-[#31A7AC]" />
                </div>
            </div>


        </section>
    );
}
