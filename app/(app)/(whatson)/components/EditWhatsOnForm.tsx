"use client";

import Image from "next/image";
import { Calendar as CalendarIcon, LocationEdit, Plus, X } from "lucide-react";
import { format } from "date-fns";
import React from "react";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import type { WhatsOnEvent } from "@/data/whatsOnEvents";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";


const badgeClass = "rounded-full border border-[#FF81A5] bg-[#FFE8F0] px-2 py-0.5 text-xs font-semibold text-[#FF4B82]";

type EditWhatsOnFormProps = {
    event: WhatsOnEvent;
};

export function EditWhatsOnForm({ event }: EditWhatsOnFormProps) {
    const [title, setTitle] = React.useState(event.title);
    const [venue, setVenue] = React.useState(event.location);
    const [isOnline, setIsOnline] = React.useState(event.isOnline);
    const [dateRange, setDateRange] = React.useState(event.rsvpBy);
    const [schedule, setSchedule] = React.useState(event.schedule);
    const [description, setDescription] = React.useState(event.description.join("\n\n"));
    const [terms, setTerms] = React.useState(event.terms.join("\n\n"));
    const [tags, setTags] = React.useState(event.tags);
    const [tagInput, setTagInput] = React.useState("");
    const [posterPreview, setPosterPreview] = React.useState(event.heroImage);

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

    const handleAddSchedule = () => {
        setSchedule((prev) => [...prev, { dateLabel: "", timeRange: "", timezone: "" }]);
    };

    const handleScheduleChange = (index: number, key: "dateLabel" | "timeRange" | "timezone", value: string) => {
        setSchedule((prev) => prev.map((slot, i) => (i === index ? { ...slot, [key]: value } : slot)));
    };

    const handleRemoveSchedule = (index: number) => {
        setSchedule((prev) => prev.filter((_, i) => i !== index));
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

    return (
        <section className="relative mx-auto w-full max-w-[1075px] rounded-[32px] bg-white p-4  sm:p-6 lg:p-8">
            <form className="flex flex-col gap-8" onSubmit={(event) => event.preventDefault()}>
                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Event title</label>
                            <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-2xl border border-black/20 bg-black/5 px-4 py-3 text-sm text-black focus:border-[#31A7AC] focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <Checkbox className="h-5 w-5" />
                            <span className="text-sm text-gray-700">Guest Can Select The Dates To Attend</span>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <label className="text-sm font-medium text-gray-500 sm:text-base sm:min-w-[80px]">Venue</label>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-1">
                                    <div className="flex items-center gap-2 rounded-2xl border border-black/20 bg-black/5 px-4 py-3 w-full sm:flex-1">
                                        <LocationEdit className="h-4 w-4 flex-shrink-0" />
                                        <input value={venue} onChange={(event) => setVenue(event.target.value)} className="w-full bg-transparent text-sm text-black focus:border-[#31A7AC] focus:outline-none" placeholder="Enter venue" />
                                    </div>
                                    <Button
                                        type="button"
                                        className={`h-[45px] w-full sm:w-[120px] rounded-2xl border text-sm font-semibold ${isOnline ? "bg-[#FA596E] text-white" : "bg-transparent text-black"}`}
                                        onClick={() => setIsOnline(!isOnline)}
                                    >
                                        Online
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="flex w-full flex-col gap-4">
                            <div className="flex flex-col gap-4 rounded-lg lg:flex-row">
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-500">Event date</label>
                                    <div className="mt-2 rounded-lg border border-gray-300 bg-gray-100 p-4">

                                        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-400">
                                            <span>Schedule</span>
                                            <button type="button" onClick={handleAddSchedule} className="inline-flex items-center gap-2 rounded-full bg-[#31A7AC] px-3 py-1 text-xs font-semibold text-white">
                                                <Plus className="h-3 w-3" />
                                                Add
                                            </button>
                                        </div>
                                        <div className="mt-3 max-h-[262px] space-y-3 overflow-y-auto pr-1">
                                            {schedule.map((slot, index) => (
                                                <div key={`slot-${index}`} className="flex flex-col gap-2 rounded-2xl bg-white/70 px-3 py-2 text-sm sm:flex-row sm:items-center">
                                                    <CalendarIcon className="h-4 w-4 text-[#31A7AC]" />
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <button
                                                                type="button"
                                                                className="flex-1 sm:w-[200px] h-[27px] rounded-[15px]  px-2 py-1 border border-gray-300 text-left text-xs text-gray-700 focus:border-[#31A7AC] focus:outline-none"
                                                            >
                                                                {slot.dateLabel || "Select date"}
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent align="start" className="w-auto p-0">
                                                            <Calendar
                                                                mode="single"
                                                                selected={slot.dateLabel ? new Date(slot.dateLabel) : undefined}
                                                                onSelect={(date) => {
                                                                    if (date) {
                                                                        handleScheduleChange(index, "dateLabel", format(date, "EEE, MMM dd yyyy"));
                                                                    }
                                                                }}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    {(() => {
                                                        // Normalize any 12-hour times with AM/PM into 24-hour HH:MM before binding to <input type="time">
                                                        const to24 = (t: string): string => {
                                                            const trimmed = t.trim();
                                                            const match = /^(\d{1,2}):(\d{2})\s*([AP]M)$/i.exec(trimmed);
                                                            if (!match) return trimmed;
                                                            const [, hrStr, minStr, ampm] = match;
                                                            let hr = parseInt(hrStr, 10);
                                                            if (ampm.toUpperCase() === "PM" && hr !== 12) hr += 12;
                                                            if (ampm.toUpperCase() === "AM" && hr === 12) hr = 0;
                                                            return `${String(hr).padStart(2, "0")}:${minStr}`;
                                                        };
                                                        const rawRange = slot.timeRange || "21:00 - 22:00";
                                                        const [rawStart = "21:00", rawEnd = "22:00"] = rawRange.split(" - ");
                                                        const start = to24(rawStart);
                                                        const end = to24(rawEnd);
                                                        return (
                                                            <div className="flex flex-1 flex-col gap-2 rounded-xl border border-gray-200 px-2 py-2 sm:flex-row sm:items-center">
                                                                <input
                                                                    type="time"
                                                                    step="60"
                                                                    value={start}
                                                                    onChange={(event) => handleScheduleChange(index, "timeRange", `${event.target.value} - ${end}`)}
                                                                    className=" appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                                                />
                                                                <span className="hidden text-xs text-gray-400 sm:inline">-</span>
                                                                <input
                                                                    type="time"
                                                                    step="60"
                                                                    value={end}
                                                                    onChange={(event) => handleScheduleChange(index, "timeRange", `${start} - ${event.target.value}`)}
                                                                    className=" appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveSchedule(index)}
                                                                    className="self-end rounded-full border border-[#FF8080] p-1 text-[#FF8080] sm:self-auto"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            ))}

                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 flex w-full flex-col gap-4 rounded-lg lg:mt-6">
                                    <div className="flex items-center gap-2  px-3 py-2">
                                        <Label className="text-sm font-medium text-gray-500">Max Spots Per Person</Label>
                                        <Input type="number" min={1} defaultValue={1} disabled className="max-w-[120px] border border-gray-300 bg-[#828282]" />
                                    </div>
                                    <div>
                                        <div className="mb-2 flex items-center gap-2 rounded-2xl border border-gray-300 px-3">
                                            <Label className="text-sm font-[600] text-gray-500">Spots</Label>
                                            <Separator orientation="vertical" className="h-4 w-2px bg-gray-300" />
                                            <Input
                                                type="number"
                                                min={1}
                                                defaultValue={20}
                                                className="w-full border-none bg-transparent px-4 py-3 text-sm text-black focus:border-[#31A7AC] focus:outline-none"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Checkbox className="h-5 w-5" />
                                            <span className="text-sm text-gray-700">Unlimited spots</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="mb-2 flex items-center gap-2 rounded-2xl border border-gray-300 px-3">
                                            <Label className="text-sm font-[600] text-gray-500">ADE</Label>
                                            <Separator orientation="vertical" className="h-4 w-2px bg-gray-300" />
                                            <Input
                                                type="number"
                                                min={1}
                                                defaultValue={20}
                                                className="w-full border-none bg-transparent px-4 py-3 text-sm text-black focus:border-[#31A7AC] focus:outline-none"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Checkbox className="h-5 w-5" />
                                            <span className="text-sm text-gray-700">Free Event</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">RSVP by</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className="mt-2 w-full rounded-2xl border border-black/20 bg-black/5 px-4 py-3 text-left text-sm text-black focus:border-[#31A7AC] focus:outline-none">
                                        {dateRange || "Select date"}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={dateRange ? new Date(dateRange) : undefined}
                                        onSelect={(date) => {
                                            if (date) {
                                                setDateRange(format(date, "EEE, MMM dd yyyy"));
                                            }
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="rounded-[30px] bg-black/10">
                            <div className="relative h-[220px] w-full overflow-hidden rounded-[26px] sm:h-[320px]">
                                <input
                                    id="poster-upload"
                                    type="file"
                                    accept="image/png,image/jpeg"
                                    className="hidden"
                                    onClick={(e) => (e.currentTarget.value = "")}
                                    onChange={handlePosterChange}
                                />

                                {posterPreview ? (
                                    <div className="group relative h-[4600px] sm:h-[499px] w-[408px] ">
                                        <Image src={posterPreview} alt={event.title} fill sizes="(min-width: 1024px) 320px, 100vw" className="object-cover" />
                                        <div className="absolute inset-0 opacity-0 transition-opacity duration-200 bg-[#656565] ease-out group-hover:opacity-100">
                                            {/* <div className="absolute inset-0 bg-black/50" /> */}
                                            <div className="relative z-10 flex h-full w-full  flex-col items-center justify-center gap-3 px-4 text-center text-white">
                                                <p className="text-2xl font-semibold">Replace Banner Image</p>
                                                <p className="text-sm opacity-90">Optimal dimensions 3000 x 750px</p>
                                                <div className="mt-2 flex flex-wrap  items-center justify-center gap-3">
                                                    <label
                                                        htmlFor="poster-upload"
                                                        className="cursor-pointer rounded-full bg-[#FF6F8F] px-6 py-2 text-sm font-semibold text-white shadow"
                                                    >
                                                        Replace Image
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPosterPreview("")}
                                                        className="rounded-full bg-gray-600/90 px-6 py-2 text-sm font-semibold text-white"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="poster-upload"
                                        className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 bg-[#656565]"
                                    >
                                        <p className="text-2xl font-semibold text-gray-100">Replace Banner Image</p>
                                        <p className="text-sm text-gray-100">Optimal dimensions 3000 x 750px</p>
                                        <span className="mt-2 rounded-full bg-[#FF6F8F] px-6 py-2 text-sm font-semibold text-white">
                                            Add Image
                                        </span>
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-semibold text-gray-600">Details</label>
                    <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 min-h-[180px] w-full rounded-[28px] border border-black/20 bg-black/5 p-4 text-sm text-gray-800 focus:border-[#31A7AC] focus:outline-none" />
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-gray-600">What&apos;s on Tags</label>
                        {tags.length > 0 && <span className={badgeClass}>{tags.length} tags</span>}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 rounded-[18px] border bg-black/5 p-2">
                        {tags.map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-2 border rounded-full bg-white px-4 py-1 text-xs font-medium text-gray-700">
                                {tag}
                                <button type="button" onClick={() => handleRemoveTag(tag)} aria-label={`Remove ${tag}`}>
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                    <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-black/20 p-2 sm:flex-row sm:items-center">
                        <input
                            value={tagInput}
                            onChange={(event) => setTagInput(event.target.value)}
                            placeholder="Add new tag"
                            className="flex-1 rounded-2xl px-4 py-3 text-sm text-gray-800 focus:border-[#31A7AC] focus:outline-none"
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    handleAddTag();
                                }
                            }}
                        />
                        <button type="button" onClick={handleAddTag} className="rounded-[18px] bg-[#31A7AC] p-3 text-sm font-semibold text-white">
                            <Plus className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-semibold text-gray-600">Terms & Conditions (optional)</label>
                    <textarea value={terms} onChange={(event) => setTerms(event.target.value)} className="mt-2 min-h-[140px] w-full rounded-[28px] border border-black/20 bg-black/5 p-4 text-sm text-gray-800 focus:border-[#31A7AC] focus:outline-none" />
                </div>
            </form>
        </section>
    );
}
