"use client";
import { ChevronDown, ChevronUp, Filter, Search, MapPin } from "lucide-react";
import Link from "next/link";
import React from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
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
            <div className="max-w-7xl">
                <span className="hidden p-2 md:inline-block bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent text-3xl font-semibold">Crew Directory</span>
                <div className="sticky top-0 z-20 flex w-full flex-row gap-3 bg-white/90 p-4 backdrop-blur sm:flex-row sm:items-center">
                    <Popover onOpenChange={setIsFilterOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                className={`flex h-12 w-auto items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${isFilterOpen ? 'bg-[#FA6E80] text-white border-[#FA6E80] sm:w-[281px] ' : 'bg-transparent text-[#FA6E80] border-[#FA6E80]'}`}
                            >
                                <span className="flex items-center space-x-2">
                                    <span>Filter (<span>{"3"}</span>)</span>
                                    <Filter className="h-5 w-5" />
                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <form onSubmit={handleFilterSubmit} className=" space-y-2 rounded-[10px] bg-[#F8F8F8] p-4 text-[#017A7C]">
                                <div className="space-y-1 rounded-[5.71px]  border border-[#017A7C]/30 px-4 py-2 justify-center items-center flex ">
                                    <label className="text-sm font-[400]">Availability</label>

                                </div>

                                <div className="space-y-1">
                                    <select
                                        value={filterForm.productionType}
                                        onChange={(e) => handleFilterChange("productionType", e.target.value)}
                                        className="w-full rounded-[5.71px] border border-[#017A7C]/30 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#31A7AC]"
                                    >
                                        <option value="">Select production type</option>
                                        <option value="commercial">Commercial</option>
                                        <option value="tv">TV</option>
                                        <option value="film">Film</option>
                                        <option value="social">Social / Digital</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 rounded-xl border border-[#017A7C]/30 px-4 py-2">
                                        <MapPin className="h-4 w-4 text-[#017A7C]" />
                                        <input
                                            value={filterForm.location}
                                            onChange={(e) => handleFilterChange("location", e.target.value)}
                                            className="w-full border-none text-sm outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-[400]">Experience</label>
                                        <ChevronDown className="h-4 w-4 text-[#017A7C]" />
                                    </div>
                                    <div className="space-y-3 rounded-xl border border-[#017A7C]/20 px-4 py-3">
                                        {experienceOptions.map((exp) => (
                                            <button
                                                key={exp.title}
                                                type="button"
                                                onClick={() => handleFilterChange("experience", exp.title)}
                                                className={`w-full text-left text-sm ${filterForm.experience === exp.title ? "text-[#017A7C] font-semibold" : "text-gray-700"}`}
                                            >
                                                <div className="font-bold">{exp.title}</div>
                                                <div className="text-xs text-gray-500">{exp.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-sm font-semibold text-gray-700">Rate Range</p>
                                    <div className="flex items-center justify-between text-sm font-semibold">
                                        <span className="text-[#FA6E80]">{filterForm.minRate}</span>
                                        <span className="text-[#31A7AC]">{filterForm.maxRate}</span>
                                    </div>
                                    <div className="relative pt-2">
                                        <input
                                            type="range"
                                            min={0}
                                            max={5000}
                                            value={filterForm.minRate}
                                            onChange={(e) => {
                                                const value = Number(e.target.value);
                                                if (value < filterForm.maxRate) {
                                                    handleFilterChange("minRate", value);
                                                }
                                            }}
                                            className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FA6E80] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#FA6E80] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                                            style={{ zIndex: 3 }}
                                        />
                                        <input
                                            type="range"
                                            min={0}
                                            max={5000}
                                            value={filterForm.maxRate}
                                            onChange={(e) => {
                                                const value = Number(e.target.value);
                                                if (value > filterForm.minRate) {
                                                    handleFilterChange("maxRate", value);
                                                }
                                            }}
                                            className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#31A7AC] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#31A7AC] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                                            style={{ zIndex: 4 }}
                                        />
                                        <div className="relative w-full h-2 bg-gray-200 rounded-full">
                                            <div
                                                className="absolute h-2 bg-gradient-to-r from-[#FA6E80] to-[#31A7AC] rounded-full"
                                                style={{
                                                    left: `${(filterForm.minRate / 5000) * 100}%`,
                                                    right: `${100 - (filterForm.maxRate / 5000) * 100}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>


                            </form>
                        </PopoverContent>
                    </Popover>
                    <div className="flex h-12 flex-row w-full items-center justify-between rounded-full border px-2 py-2">
                        <input
                            type="text"
                            placeholder="Search by name, role, or department..."
                            className="border-none w-[calc(100%-3rem)] text-sm outline-none focus:ring-0"
                            onChange={(e) => console.log(e.target.value)}
                        />
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FA6E80]">
                            <Search className="h-5 w-5 text-white" />
                        </span>
                    </div>

                </div>
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
                    <div className="w-full flex-1 overflow-x-hidden  p-2 sm:p-4 mx-auto">{children}</div>
                </div>

            </div>
        </>
    )
}