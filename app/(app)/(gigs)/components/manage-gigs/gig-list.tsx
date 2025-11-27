import { CalendarDays, MapPin } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { gigsData } from "@/data/gigs";

type GigListProps = {
    selectedGigIds: string[];
    onToggleGig: (gigId: string, checked: boolean) => void;
};

export function GigList({ selectedGigIds, onToggleGig }: GigListProps) {
    return (
        <section className="space-y-4  bg-transparent p-4 sm:p-6">
            {gigsData.map((gig) => (
                <article key={gig.id} className="flex gap-4">
                    <div className="flex items-start justify-start mt-12 sm:mt-0 sm:items-center sm:justify-center">
                        <Checkbox
                            aria-label={`Select ${gig.title}`}
                            className="mt-1 h-[30px] w-[30px] border-2 border-[#FA6E80] data-[state=checked]:border-[#FA6E80] data-[state=checked]:bg-[#FA6E80]"
                            checked={selectedGigIds.includes(gig.id)}
                            onCheckedChange={(checked) => onToggleGig(gig.id, Boolean(checked))}
                        />
                    </div>
                    <div className="flex flex-1 flex-col gap-4 bg-[#FFFFFF] rounded-[17px] p-5 sm:flex-row sm:gap-6">
                        <div className="flex-1 space-y-3">
                            <div>
                                <p className="text-lg font-[400] text-gray-900">{gig.title}</p>
                                <p className="mt-1 text-sm text-gray-600">{gig.description}</p>
                            </div>
                            <p className="text-sm text-[#444444">
                                <span className="font-[600] text-gray-900">Qualifying criteria:</span>{" "}
                                {gig.qualifyingCriteria}
                            </p>
                        </div>
                        <div className="h-full hidden sm:flex w-px border border-[#E1E1E1]" />
                        <div className="h-px sm:hidden flex w-full border border-[#E1E1E1]" />
                        <div className="flex w-full flex-col gap-3 rounded-2xl border border-white bg-white/70 text-sm text-gray-700 ">
                            <span className="text-left text-[14px] font-[400] text-[#000000]">
                                <span className="font-[600] text-[#000000]">ADE</span> {gig.budgetLabel}
                            </span>
                            <div className="flex items-start gap-2 text-sm text-[#444444]">
                                <CalendarDays className="h-4 w-4 text-gray-400" />
                                <div className="space-y-1">
                                    {gig.dateWindows.map((window) => (
                                        <p key={`${gig.id}-${window.label}`}>
                                            <span className="font-medium text-gray-900">{window.label}</span>
                                            <span className="mx-2">|</span>
                                            {window.range}
                                        </p>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <p>{gig.location}</p>
                            </div>
                        </div>
                    </div>
                </article>
            ))}
        </section>
    );
}
