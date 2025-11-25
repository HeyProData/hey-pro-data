"use client"
import React from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
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
}
export default function AvalableDilog({ initialProfile }: EditAvalableProps) {

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
                <Button variant="ghost" className="flex items-center gap-2 border border-none text-[#31A7AC]">
                    {availability}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Update availability</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                    <label className="text-base font-normal">Availability</label>
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
                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
