'use client'

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RecommendationUser, recommendationUsers } from "@/data/recommendUsers"
import { UserPlus, X } from "lucide-react"
import Image from "next/image"

export function SendRecommendationDialog() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedUsers, setSelectedUsers] = useState<RecommendationUser[]>([])

    const filteredUsers = useMemo(() => {
        const query = searchTerm.trim().toLowerCase()
        if (!query) {
            return recommendationUsers
        }

        return recommendationUsers.filter((user) => {
            return (
                user.name.toLowerCase().includes(query) ||
                user.handle.toLowerCase().includes(query)
            )
        })
    }, [searchTerm])

    const handleSelectUser = (user: RecommendationUser) => {
        setSelectedUsers((prev) => {
            if (prev.some((existing) => existing.id === user.id)) {
                return prev
            }
            return [...prev, user]
        })
    }

    const handleRemoveUser = (id: string) => {
        setSelectedUsers((prev) => prev.filter((user) => user.id !== id))
    }

    const handleSend = () => {
        console.log("Recommendation recipients:", selectedUsers)
    }

    return (
        <Dialog>
            <div>
                <DialogTrigger asChild>
                    <Button type="button" className="inline-flex h-[44px] items-center gap-2 rounded-[14px] bg-[#2AA9A7] px-6 py-3 text-sm font-medium text-white shadow-md">
                        <UserPlus className="h-4 w-4" />
                        Recommend
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[540px]">
                    <DialogHeader>
                        <DialogTitle>Select people to recommend</DialogTitle>
                        <DialogDescription>
                            Search the network, tap a name to add them to your
                            recommendation list, and remove anyone before sending.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="user-search">Search people</Label>
                            <Input
                                id="user-search"
                                placeholder="Type a name or handle"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">All users</p>
                                <span className="text-xs uppercase text-muted-foreground">
                                    {filteredUsers.length} found
                                </span>
                            </div>
                            <ScrollArea className="max-h-64 rounded-[14px] border border-[#E4E7EC] bg-white">
                                {filteredUsers.length > 0 ? (
                                    <ul className="divide-y divide-[#F4F7F7] h-50">
                                        {filteredUsers.map((user) => (
                                            <li key={user.id}>
                                                <button
                                                    type="button"
                                                    className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-[#F4F7F7]"
                                                    onClick={() => handleSelectUser(user)}
                                                >
                                                    <div>
                                                        <Image
                                                            src={user.avatar || "/default-avatar.png"}
                                                            alt={user.name}
                                                            width={40}
                                                            height={40}
                                                            className="rounded-full"
                                                        />
                                                    </div>
                                                    <div className="flex-1 leading-tight">
                                                        <p className="text-sm font-semibold text-[#101828]">
                                                            {user.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">{user.role}</p>
                                                    </div>
                                                    <span className="text-xs font-medium text-[#2AA9A7]">
                                                        {user.handle}
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="px-4 py-6 text-sm text-muted-foreground">
                                        No users match your search.
                                    </p>
                                )}
                            </ScrollArea>
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm font-medium">Selected users</p>
                            {selectedUsers.length > 0 ? (
                                <div className="flex flex-wrap gap-3">
                                    {selectedUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center gap-2 rounded-full border border-[#E4E7EC] bg-[#F4F7F7] px-3 py-1"
                                        >
                                            <div className="leading-tight flex items-center gap-2">
                                                <Image
                                                    src={user.avatar || "/default-avatar.png"}
                                                    alt={user.name}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-full"
                                                />
                                                <div>
                                                    <p className="text-sm font-semibold text-[#101828]">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{user.role}</p>
                                                </div>

                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveUser(user.id)}
                                                className="text-[#475467] transition hover:text-red-500"
                                                aria-label={`Remove ${user.name}`}
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No one selected yet. Choose people from the list above.
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button type="button" disabled={selectedUsers.length === 0} onClick={handleSend}>
                                Send recommendation
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </div>
        </Dialog>
    )
}
