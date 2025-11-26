'use client'

import Image from "next/image";
import { Calendar, MapPin, Paperclip, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { gigsData } from "@/data/gigs";

import { MainGigHeader } from "../components/gigs-header";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function GigsPage() {
    return (
        <>
            <MainGigHeader />
            <div className="px-4 pb-10 overflow-x-auto">
                <section className="mx-auto max-w-5xl mt-40 sm:mt-25">
                    <form
                        onSubmit={(event) => event.preventDefault()}
                        className="relative flex h-[52px] w-full items-center justify-center rounded-full border border-[#FA6E80] bg-white"
                        role="search"
                        aria-label="Search gigs"
                    >
                        <Input
                            type="search"
                            placeholder="Search gigs..."
                            className="border-none bg-transparent pr-14 text-sm text-slate-700 focus-visible:ring-0"
                            aria-label="Search gigs"
                        />
                        <button
                            type="submit"
                            className="absolute right-3 top-1/2 flex h-[34px] w-[34px] -translate-y-1/2 items-center justify-center rounded-full bg-[#FA6E80] text-white transition hover:bg-[#f95569]"
                            aria-label="Submit search"
                        >
                            <Search className="h-[18px] w-[18px]" />
                        </button>
                    </form>
                </section>

                <section className="mx-auto mt-10 max-w-5xl space-y-6">
                    {gigsData.map((gig) => (
                        <Link
                            href={`/gigs/${gig.slug}`}
                            key={gig.id}
                            className="block p-6 transition"
                        >
                            <div className="flex flex-col gap-6 lg:flex-row">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4">
                                        <Image src={gig.postedBy.avatar} alt={gig.postedBy.name} width={54} height={54} className="rounded-full" />
                                        <div>
                                            <p className="text-base font-medium text-slate-900">{gig.postedBy.name}</p>
                                            <p className="text-sm text-slate-500">Posted on {gig.postedOn}</p>
                                        </div>
                                    </div>
                                    <h3 className="mt-4 text-2xl font-medium text-slate-900">{gig.title}</h3>
                                    <p className="mt-3 text-base text-slate-600">{gig.description}</p>
                                    <p className="mt-4 text-base text-slate-700">
                                        <span className="font-medium">Qualifying criteria: </span>
                                        {gig.qualifyingCriteria}
                                    </p>
                                </div>

                                <div className="lg:w-px lg:bg-slate-200" aria-hidden />

                                <div className="flex flex-col gap-4 lg:w-[260px]">
                                    <div className="flex flex-col items-start gap-1 text-right lg:items-end">
                                        <span className="text-xs font-medium uppercase tracking-wide text-[#FA6E80]">Apply before {gig.applyBefore}</span>
                                        <p className="text-lg font-medium text-slate-900">{gig.budgetLabel}</p>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="rounded-full bg-[#FA6E80]/10 p-2 text-[#FA6E80]">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <div className="space-y-1 text-sm text-slate-700">
                                            {gig.dateWindows.map((window) => (
                                                <p key={`${gig.id}-${window.label}`}>
                                                    <span className="font-medium text-slate-900">{window.label}</span>
                                                    <span className="text-slate-500"> | {window.range}</span>
                                                </p>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 text-sm text-slate-700">
                                        <div className="rounded-full bg-[#FA6E80]/10 p-2 text-[#FA6E80]">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <p className="leading-5">{gig.location}</p>
                                    </div>

                                    <div className="flex items-start gap-3 text-sm text-slate-700">
                                        <div className="rounded-full bg-[#FA6E80]/10 p-2 text-[#FA6E80]">
                                            <Paperclip className="h-4 w-4" />
                                        </div>
                                        <p>{gig.supportingFileLabel}</p>
                                    </div>
                                </div>
                            </div>
                            <Separator className="my-4" />
                        </Link>

                    ))}
                </section>
            </div>
        </>
    )
}