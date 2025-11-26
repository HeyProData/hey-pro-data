"use client"
import React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
interface EditAvalableProps {
    initialProfile: {
        availability: string
    }
    triggerClassName?: string
}
export default function AvalableDilog({ initialProfile, triggerClassName }: EditAvalableProps) {

    const [open, setOpen] = React.useState(false)
    const [availability, setAvailability] = React.useState(initialProfile.availability)
    const [draftAvailability, setDraftAvailability] = React.useState(initialProfile.availability)

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen)
        if (nextOpen) {
            setDraftAvailability(availability)
        }
    }

    const handleCancel = () => {
        setDraftAvailability(availability)
        setOpen(false)
    }

    const handleSave = () => {
        setAvailability(draftAvailability)
        setOpen(false)
    }


    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn("flex items-center gap-2 border border-none text-[#31A7AC]", triggerClassName)}
                >
                    {availability}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="mt-20">
                    <DialogTitle>Availability</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 h-40 -mt-30">
                    <Select value={draftAvailability} onValueChange={setDraftAvailability}>
                        <SelectTrigger className="w-full rounded-full border-none bg-[#34A353] text-white">
                            <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="Available">Available</SelectItem>
                            <SelectItem value="Busy">Busy</SelectItem>
                            <SelectItem value="Unavailable">Unavailable</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter className=" flex flex-row justify-start items-start -mt-60">
                    <DialogClose asChild>
                        <Button type="button" className="h-[44px] w-[128px] rounded-[15px] border-[#31A7AC]" variant="outline">
                            <span className="text-[#31A7AC]">Cancel</span>
                        </Button>
                    </DialogClose>
                    <Button type="button" className="h-[44px] rounded[15px] bg-[#31A7AC]" onClick={handleSave}>
                        Save roles
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
