import Link from "next/link";
import { EditWhatsOnForm } from "../../../components/EditWhatsOnForm";
import type { WhatsOnEvent } from "@/data/whatsOnEvents";
import { Button } from "@/components/ui/button";

const emptyEvent: WhatsOnEvent = {
    id: "new",
    title: "",
    slug: "",
    location: "",
    isOnline: false,
    isPaid: false,
    priceLabel: "Free",
    dateRangeLabel: "",
    rsvpBy: "",
    host: {
        name: "",
        organization: "",
        avatar: "/assets/whatson/host-avatar.svg",
    },
    schedule: [{ dateLabel: "", timeRange: "", timezone: "" }],
    description: [""],
    terms: [""],
    tags: [],
    thumbnail: "",
    heroImage: "",
};

export default function AddNewWhatsOnPage() {
    return (
        <div>
            <div className="flex sm:flex-row flex-col gap-3 sm:gap-0  sm:items-center sm:justify-between  bg-white mb-5">
                <span className="bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent text-3xl font-semibold">Add New What&apos;s On</span>
                <div className="flex gap-4 items-center ml-3.5 sm:ml-0">
                    <Link href={'/whats-on/manage-whats-on'} className="flex items-center justify-center rounded-[10px] border border-[#31A7AC] h-[44px] px-4 py-2 text-[#31A7AC]">Discard</Link>
                    <Button className="rounded-[10px] h-[44px] bg-[#31A7AC] hover:bg-[#31A7AC]/90 px-4 py-2 text-sm font-semibold text-white">
                        Save Event
                    </Button>
                </div>

            </div>
            <EditWhatsOnForm event={emptyEvent} />
        </div>
    );
}