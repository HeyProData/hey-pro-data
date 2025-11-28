"use client";
import { ChevronDown, ChevronUp, Filter, Search, MapPin } from "lucide-react";
import Link from "next/link";
import React from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
const toSlug = (s: string) =>
    s
        .toLowerCase()
        .replace(/[\|\(\)]/g, "") // remove | and parentheses
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

type FilterValue = { label: string; href: string };
type FilterOption = { label: string; value: FilterValue[] };

const makeValues = (arr: string[]): FilterValue[] =>
    arr.map(label => ({ label, href: `/explore/${toSlug(label)}` }));

const filterOptions: FilterOption[] = [
    {
        label: "Director",
        value: makeValues([
            "Director",
            "Director | Commercial",
            "Assistant Director",
            "Assistant Director | TV",
            "1st Assistant Director (1st AD)",
            "2nd Assistant Director (2nd AD)",
            "3rd Assistant Director (3rd AD)",
            "Assistant Director"
        ])
    },
    {
        label: "Cinematographer",
        value: makeValues([
            "Cinematographer",
            "Director of Photography (DP)",
            "Camera Operator",
            "1st AC (Focus Puller)",
            "2nd AC (Clapper Loader)",
            "Digital Imaging Technician (DIT)",
            "Steadicam Operator",
            "Gimbal Operator",
            "Drone Operator",
            "Camera Trainee"
        ])
    },
    {
        label: "Editor",
        value: makeValues([
            "Editor",
            "Assistant Editor",
            "Colorist",
            "VFX Artist",
            "Motion Graphics Designer",
            "Sound Editor",
            "Sound Designer",
            "Foley Artist",
            "Re-Recording Mixer"
        ])
    },
    {
        label: "Producer",
        value: makeValues([
            "Producer",
            "Executive Producer",
            "Line Producer",
            "Production Manager",
            "Production Coordinator",
            "Production Assistant"
        ])
    },
    {
        label: "Writer",
        value: makeValues(["Writer", "Screenwriter", "Script Supervisor", "Story Editor"])
    },
    {
        label: "Production Designer",
        value: makeValues([
            "Production Designer",
            "Art Director",
            "Set Designer",
            "Set Decorator",
            "Props Master",
            "Costume Designer",
            "Makeup Artist",
            "Hair Stylist"
        ])
    },
    {
        label: "Sound Designer",
        value: makeValues([
            "Sound Designer",
            "Sound Mixer",
            "Boom Operator",
            "Location Sound Recordist"
        ])
    },
    {
        label: "Camera Operator",
        value: makeValues([
            "Camera Operator",
            "Steadicam Operator",
            "Gimbal Operator",
            "Drone Operator"
        ])
    },
    {
        label: "Gaffer",
        value: makeValues([
            "Gaffer",
            "Key Gaffer",
            "Best Boy Gaffer",
            "Gimbal Gaffer",
            "Drone Gaffer",
            "3rd AC (Grip)",
            "2nd AC (Grip)",
            "1st AC (Grip)"
        ])
    },
    {
        label: "Location Scout",
        value: makeValues([
            "Location Scout",
            "Location Assistant",
            "Location Assistant (LA)",
            "Location Assistant (LA) | Commercial",
            "Location Assistant (LA) | TV"
        ])
    },
    {
        label: "VFX Artist",
        value: makeValues([
            "VFX Artist",
            "VFX Supervisor",
            "VFX Assistant",
            "VFX Assistant (VA)",
            "VFX Assistant (VA) | Commercial",
            "VFX Assistant (VA) | TV"
        ])
    },
    {
        label: "Colorist",
        value: makeValues([
            "Colorist",
            "Color Timer",
            "Colorist (Color Grading)",
            "Colorist (Color Correction)"
        ])
    },
    {
        label: "Sound Engineer",
        value: makeValues([
            "Sound Engineer",
            "Sound Technician",
            "Sound Engineer | Commercial",
            "Sound Engineer | TV"
        ])
    },
    {
        label: "Makeup Artist",
        value: makeValues([
            "Makeup Artist",
            "Makeup Artist | Commercial",
            "Makeup Artist | TV"
        ])
    },
    {
        label: "Other",
        value: makeValues([
            "Other",
            "Other | Commercial",
            "Other | TV",
            "Other | Commercial | TV"
        ])
    }
];

const experienceOptions = [
    { title: "Intern", description: "helped on set, shadowed role" },
    { title: "Learning | Assisted", description: "assisted the role under supervision" },
    { title: "Competent | Independent", description: "can handle role solo" },
    { title: "Expert | Lead", description: "leads team, multiple projects" },
];

const initialFilterState = {
    keyword: "",
    availability: "available",
    productionType: "",
    location: "UAE, Dubai",
    experience: "",
    minRate: 900,
    maxRate: 3000,
};

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const [isFilterOpen, setIsFilterOpen] = React.useState(false);
    const [filterForm, setFilterForm] = React.useState<typeof initialFilterState>(initialFilterState);

    const handleFilterChange = (field: keyof typeof initialFilterState, value: string | number) => {
        setFilterForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleFilterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log("Applied filters:", filterForm);
    };
    return (
        <>
            <div className="max-w-[960px]">
                <span className="hidden p-2 md:inline-block bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent text-3xl font-semibold">Message</span>

                <div className="flex w-full flex-col gap-6 lg:flex-row">
                    <div className={`${isFilterOpen ? 'sm:flex hidden' : 'hidden lg:flex'} w-full flex-col gap-4 rounded-2xl bg-white/50 p-4 lg:max-w-[280px] lg:overflow-y-auto`}>

                        {filterOptions.map(opt => (
                            <details key={opt.label} className="group  rounded-[10px]  border-[1px] border-[#989898]/10 rotate-[5px]  bg-whit">
                                <summary className="cursor-pointer select-none flex items-center justify-between px-3 py-2 text-sm font-[400px]">
                                    <span>{opt.label}</span>
                                    <span>
                                        <span className="group-open:hidden"><ChevronUp className="h-4 w-4 text-[#FA6E80]" /></span>
                                        <span className="hidden group-open:inline"><ChevronDown className="h-4 w-4 text-[#FA6E80]" /></span>
                                    </span>
                                </summary>
                                <ul className="px-3 pb-2 space-y-1 bg-[#FAFAFA]">
                                    {opt.value.map(v => (
                                        <li key={v.label}>
                                            <Link
                                                href={v.href}
                                                className="text-xs text-[#444444] hover:text-[#FA6E80] cursor-pointer block py-1"
                                            >
                                                {v.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </details>
                        ))
                        }
                    </div>
                    <div className="w-full flex-1 overflow-x-hidden  p-2 sm:p-4 lg:min-h-[600px]">{children}</div>
                </div>

            </div>
        </>
    )
}