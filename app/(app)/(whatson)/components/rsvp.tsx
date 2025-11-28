"use client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "lucide-react"
import { useState } from "react"

interface RSVPProps {
    event: Array<{
        dateLabel: string;
        timeRange: string;
        timezone: string;
    }>
    | undefined
}

export function RSVP({ event }: RSVPProps) {
    const [selectedDates, setSelectedDates] = useState<number[]>([])
    const [attendees, setAttendees] = useState([
        { name: "", email: "" },
        { name: "", email: "" },
        { name: "", email: "" }
    ])

    const handleDateToggle = (index: number) => {
        setSelectedDates(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        )
    }

    const handleAttendeeChange = (index: number, field: "name" | "email", value: string) => {
        setAttendees(prev => prev.map((att, i) =>
            i === index ? { ...att, [field]: value } : att
        ))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log({
            selectedDates: selectedDates.map(i => event?.[i]),
            attendees: attendees.filter(a => a.name || a.email)
        })
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="flex-1 h-full sm:max-w-[208px] w-[363px] sm:w-full rounded-full bg-[#FA6E80] px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-[#f4566d]">
                    Count me in!
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-[824px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="mb-2">RSVP</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-1">
                        <div className="flex flex-row gap-3">
                            <span className="text-sm font-medium text-gray-700"><Calendar /></span>
                            <span>Select dates</span>
                        </div>
                        <div>
                            {event?.map((slot, index) => (
                                <div key={`${slot.dateLabel}-${index}`} className="flex flex-row items-center gap-2 text-sm text-gray-700 py-2">
                                    <div className="flex items-center gap-2 font-medium text-gray-900">
                                        <Calendar className="h-4 w-4 text-[#017A7C]" />
                                        <span>{slot.dateLabel}</span>
                                    </div>
                                    <p className="text-gray-600">
                                        {slot.timeRange} · {slot.timezone}
                                    </p>
                                    <Checkbox
                                        checked={selectedDates.includes(index)}
                                        onCheckedChange={() => handleDateToggle(index)}
                                        className="ml-10 border-[#FA6E80] h-[25px] w-[25px]"
                                    />
                                </div>
                            ))}
                            <div className="flex flex-row justify-start items-center gap-3.5 mb-5">
                                <span>Number of spots</span>
                                <Input
                                    value={event?.length}
                                    className="w-[83px] rounded-[15px] text-center text-xl"
                                    readOnly
                                />
                            </div>
                            {attendees.map((attendee, index) => (
                                <div key={index} className="flex flex-row justify-start items-center gap-3.5 mb-2 rounded-[15px]">
                                    <Input
                                        placeholder="Name"
                                        value={attendee.name}
                                        onChange={(e) => handleAttendeeChange(index, "name", e.target.value)}
                                    />
                                    <Input
                                        placeholder="Email"
                                        type="email"
                                        value={attendee.email}
                                        onChange={(e) => handleAttendeeChange(index, "email", e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <Separator className="mb-5" />
                    <DialogFooter>
                        <DialogClose>
                            <Button>
                                Cancel
                            </Button>
                        </DialogClose>
                        <DialogClose>
                            <button type="submit" className="bg-[#31A7AC] px-4 py-2 rounded-[10px] text-white">
                                Save changes
                            </button>
                        </DialogClose>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
