"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Ticket, DollarSign } from "lucide-react";
import { Poppins } from "next/font/google";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-poppins",
});

import { whatsOnEvents } from "@/data/whatsOnEvents";


const formatSpots = (id: string) => {
    const event = whatsOnEvents.find((event) => event.id === id);
    if (!event) {
        return { filled: 0, total: 0 };
    }
    const total = 150;
    const filled = 100; // Fixed to match design "100/150"
    return { filled, total };
};

const ManageCard = ({ event }: { event: (typeof whatsOnEvents)[number] }) => {
    const { filled, total } = formatSpots(event.id);

    return (
        <Link
            href={`/whats-on/manage-whats-on/${event.id}`}
            className="flex flex-col md:flex-row items-start bg-[#F8F8F8] rounded-[15px] p-[15px] gap-[30px] w-full md:w-[960px] md:h-[303px] transition-shadow hover:shadow-md relative"
        >
            <div className="relative shrink-0 w-full md:w-auto">
                <div className="relative w-full h-[423px] md:w-[234px] md:h-[273px] rounded-[15.45px] overflow-hidden">
                    <Image
                        src={event.thumbnail}
                        alt={event.title}
                        fill
                        className="object-cover"
                    />
                </div>
            </div>
            <div className="flex flex-col flex-1 w-full gap-[8px] md:h-[255px] relative">
                {event.isPaid && (
                    <div className="absolute right-0 top-0 z-10 flex h-[25px] w-[25px] items-center justify-center rounded-full bg-[#FCAF45] shadow-[0.9px_0.9px_8.2px_rgba(0,0,0,0.04)]">
                        <DollarSign className="h-[14px] w-[14px] text-white" strokeWidth={3} />
                    </div>
                )}
                <div className="flex items-center gap-[9.4px] h-[27px]">
                    <div className="w-[27px] h-[27px] flex items-center justify-center">
                        <Ticket className="h-[20px] w-[20px] text-black" strokeWidth={1.5} />
                    </div>
                    <span className="text-[18px] leading-[27px] font-normal text-black font-poppins">
                        {filled}/{total} Spots
                    </span>
                </div>

                <h3 className="text-[20px] leading-[30px] font-[600] text-[#444444] font-poppins line-clamp-2 md:line-clamp-1 w-full md:pr-[40px]">
                    {event.title}
                </h3>

                <p className="text-[16px] leading-[24px] font-normal text-[#444444] font-poppins line-clamp-3 md:line-clamp-2">
                    {event.description[0]}
                </p>
                <div className="flex flex-col justify-center gap-[10px] py-1">
                    {event.schedule.map((slot, index) => (
                        <div key={`${slot.dateLabel}-${index}`} className="flex items-center gap-[10px]">
                            <Calendar className="h-[26px] w-[26px] text-black" strokeWidth={2.2} />
                            <span className="text-[14px] leading-[21px] font-normal text-black font-poppins">
                                {slot.dateLabel} • {slot.timeRange} {slot.timezone}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-auto flex flex-col md:flex-row md:items-center justify-between w-full gap-4 md:gap-0">
                    <div className="flex items-end gap-[15px] h-[35px]">
                        <div className="flex items-center pl-[12.5px]">
                            {event.recommendedpopels?.map((popel, i) => (
                                <div
                                    key={i}
                                    className="relative h-[25px] w-[25px] -ml-[12.5px] rounded-full border border-white z-20 overflow-hidden"
                                >
                                    <Image
                                        src={popel}
                                        alt={popel}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                            <div className="relative z-30 flex h-[25px] w-[25px] -ml-[12.5px] items-center justify-center rounded-full bg-[#31A7AC] text-[7.7px] font-bold text-white shadow-sm border border-white">
                                15+
                            </div>
                        </div>
                        <span className="text-[14px] leading-[21px] font-[400] text-[#444444] font-poppins">
                            295 Attending
                        </span>
                    </div>

                    <div className="text-[18px] leading-[27px] font-[400] text-[#444444] font-poppins">
                        <span className="font-[600]">RSVP by </span>{event.rsvpBy}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default function ManageWhatsOnPage() {
    return (
        <div className={`space-y-10 p-4 md:p-8 ${poppins.variable} font-poppins bg-white min-h-screen`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent text-3xl font-semibold">
                    Manage What&apos;s On
                </span>
                <Link
                    href="/whats-on/manage-whats-on/add-new"
                    className="rounded-[10px] bg-[#31A7AC] px-6 py-2 text-white font-[600] h-[44px] items-center justify-center flex w-[180px] hover:bg-[#288a8e] transition-colors"
                >
                    Create What&apos;s on
                </Link>
            </div>
            <section className="flex flex-col gap-[10px] items-center md:items-start">
                {whatsOnEvents.map((event) => (
                    <ManageCard key={event.id} event={event} />
                ))}
            </section>
        </div>
    );
}