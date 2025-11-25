"use client"
import Image from "next/image"
import { addDays, endOfMonth, endOfWeek, format, getDate, isSameMonth, startOfMonth, startOfWeek } from "date-fns"
import { Calendar, Mail, MapPin, Paperclip } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { GigsDataType } from "@/data/gigs"

type ApplyGigsProps = {
    gig: GigsDataType[number]
}

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"]
const WEEK_START_OPTIONS = { weekStartsOn: 1 as const }

const buildMonthMatrix = (year: number, month: number) => {
    const firstDay = startOfMonth(new Date(year, month, 1))
    const gridStart = startOfWeek(firstDay, WEEK_START_OPTIONS)
    const gridEnd = endOfWeek(endOfMonth(firstDay), WEEK_START_OPTIONS)

    const days: Date[] = []
    let cursor = gridStart
    while (cursor <= gridEnd) {
        days.push(cursor)
        cursor = addDays(cursor, 1)
    }

    const rows: Date[][] = []
    for (let index = 0; index < days.length; index += 7) {
        rows.push(days.slice(index, index + 7))
    }
    return rows
}

export default function ApplyGigs({ gig }: ApplyGigsProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="default" className="inline-flex h-[44px] w-[116px] items-center gap-2 rounded-[14px] bg-[#FA6E80] px-6 py-3 text-sm font-medium text-white shadow-md">
                    <Mail className="h-5 w-5" /> Apply
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[92vh] max-h-[92vh] overflow-y-auto rounded-t-[32px] border-none px-0">
                <div className="mx-auto w-full max-w-5xl px-6 py-8">
                    <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-6">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wide text-[#27A4A7]">Your Application</p>
                            <div className="mt-4 flex items-center gap-3">
                                <Image src={gig.postedBy.avatar} alt={gig.postedBy.name} width={48} height={48} className="rounded-full" />
                                <div>
                                    <p className="text-base font-semibold text-slate-900">{gig.postedBy.name}</p>
                                    <p className="text-xs text-slate-500">Posted on {gig.postedOn}</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs uppercase tracking-wide text-slate-500">Apply before</p>
                            <p className="text-lg font-semibold text-[#FF4B82]">{gig.applyBefore}</p>
                            <SheetClose asChild>
                                <button type="button" className="mt-4 text-sm font-medium text-[#27A4A7] underline-offset-4 transition hover:underline">Close</button>
                            </SheetClose>
                        </div>
                    </div>

                    <section className="mt-6 space-y-4 rounded-[32px] bg-white p-6">
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                            <span className="font-semibold uppercase tracking-wide text-slate-400">Gig Rate</span>
                            <span className="text-2xl font-semibold text-[#FF4B82]">{gig.budgetLabel}</span>
                        </div>
                        <h2 className="text-3xl font-semibold text-slate-900">{gig.title}</h2>
                        <p className="text-sm text-slate-600">{gig.description}</p>
                        <p className="text-sm text-slate-700"><span className="font-semibold">Qualifying criteria:</span> {gig.qualifyingCriteria}</p>
                        <div className="grid gap-4 text-sm text-slate-600 md:grid-cols-2">
                            <div className="flex items-start gap-3">
                                <div className="rounded-full bg-[#22A5A8]/10 p-2 text-[#22A5A8]">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-400">Location</p>
                                    <p>{gig.location}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="rounded-full bg-[#22A5A8]/10 p-2 text-[#22A5A8]">
                                    <Paperclip className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-400">Supporting files</p>
                                    <p>{gig.supportingFileLabel}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mt-8 space-y-5 rounded-[32px] bg-white p-6 shadow-[0_20px_50px_rgba(36,35,37,0.08)]">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-base font-semibold text-slate-900">Click on date to select</p>
                                <p className="text-xs text-slate-500">Plan your preferred production days</p>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-semibold uppercase">
                                {[
                                    { label: "N/A", color: "bg-[#6B7280]" },
                                    { label: "P1", color: "bg-[#22A5A8]" },
                                    { label: "P2", color: "bg-[#FFB347]" },
                                ].map((status) => (
                                    <div key={status.label} className="flex items-center gap-1">
                                        <span className={`h-4 w-4 rounded-full ${status.color}`} />
                                        <span>{status.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4 overflow-x-auto">
                            {gig.calendarMonths.map((month) => {
                                const monthDate = new Date(month.year, month.month, 1)
                                const matrix = buildMonthMatrix(month.year, month.month)
                                const highlighted = new Set(month.highlightedDays)

                                return (
                                    <div key={`${gig.id}-${month.month}-${month.year}`} className="min-w-[250px] rounded-[28px] border border-[#F2F0ED] bg-white p-4">
                                        <div className="mb-4 flex items-center justify-between text-base font-semibold text-[#FF4B82]">
                                            <span>{format(monthDate, "MMM, yyyy")}</span>
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <div className="grid grid-cols-7 gap-[6px] text-[11px] font-semibold text-[#FF4B82]">
                                            {WEEKDAY_LABELS.map((label) => (
                                                <span key={`${gig.id}-${month.month}-${label}`} className="text-center">
                                                    {label}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="mt-3 space-y-1">
                                            {matrix.map((week, weekIndex) => (
                                                <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-[2px]">
                                                    {week.map((day) => {
                                                        const dayNumber = getDate(day)
                                                        const currentMonth = isSameMonth(day, monthDate)
                                                        const isHighlighted = currentMonth && highlighted.has(dayNumber)
                                                        const prevHighlighted = currentMonth && highlighted.has(dayNumber - 1)
                                                        const nextHighlighted = currentMonth && highlighted.has(dayNumber + 1)
                                                        const baseColor = currentMonth ? "text-[#22A5A8]" : "text-slate-300"
                                                        const highlightBgClass = isHighlighted
                                                            ? [
                                                                "absolute inset-y-0 bg-[#22A5A8]",
                                                                prevHighlighted ? "-left-1" : "left-0 rounded-l-full",
                                                                nextHighlighted ? "-right-1" : "right-0 rounded-r-full",
                                                            ].join(" ")
                                                            : ""

                                                        return (
                                                            <div key={day.toISOString()} className="relative flex h-8 items-center justify-center overflow-visible">
                                                                {isHighlighted && <span className={highlightBgClass} />}
                                                                <span onClick={() => (alert("test"))} className={`relative z-10 text-sm ${isHighlighted ? "font-semibold text-white" : baseColor}`}>
                                                                    {currentMonth ? dayNumber : ""}
                                                                </span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                    <section className="mt-8 space-y-6 rounded-[32px] bg-white p-6 shadow-[0_20px_50px_rgba(36,35,37,0.08)]">
                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="credits" className="text-xs uppercase tracking-wide text-slate-500">Select your credits</Label>
                                <Input id="credits" placeholder="Choose the credits that fit this gig" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rate-profile" className="text-xs uppercase tracking-wide text-slate-500">Select rate from profile</Label>
                                <Input id="rate-profile" placeholder="Use saved rate" />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            <span className="h-px flex-1 bg-slate-200" />
                            Or
                            <span className="h-px flex-1 bg-slate-200" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="custom-rate" className="text-xs uppercase tracking-wide text-slate-500">Enter rate</Label>
                            <Textarea id="custom-rate" rows={3} placeholder="Share the rate or packages you can offer" className="resize-none rounded-2xl bg-slate-50" />
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="message" className="text-xs uppercase tracking-wide text-slate-500">Message to producer</Label>
                            <Textarea id="message" rows={4} placeholder="Tell the producer why you are the perfect fit" className="rounded-2xl bg-slate-50" />
                        </div>

                        <div className="flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                            <p>By submitting you agree to share your profile details with {gig.postedBy.name} for this gig only.</p>
                            <Button type="button" className="inline-flex items-center gap-2 rounded-2xl bg-[#FF4B82] px-6 py-4 text-base font-semibold text-white">
                                <Mail className="h-5 w-5" /> Submit Application
                            </Button>
                        </div>
                    </section>
                </div>
            </SheetContent>
        </Sheet>
    )
}
