"use client";

import { CalendarDays, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { gigsData } from "@/data/gigs"

function GigList() {
    return (
        <section className="space-y-4 rounded-3xl bg-white p-4 shadow-sm sm:p-6">
            {gigsData.map((gig) => (
                <article key={gig.id} className="flex gap-4">
                    <div className="flex items-start justify-center">
                        <Checkbox
                            aria-label={`Select ${gig.title}`}
                            className="mt-1 h-5 w-5 border-2 border-rose-300 data-[state=checked]:border-rose-500 data-[state=checked]:bg-rose-500"
                        />
                    </div>
                    <div className="flex flex-1 flex-col gap-4 rounded-3xl border border-gray-100 bg-gray-50/80 p-5 sm:flex-row sm:gap-6">
                        <div className="flex-1 space-y-3">
                            <div>
                                <p className="text-lg font-semibold text-gray-900">{gig.title}</p>
                                <p className="mt-1 text-sm text-gray-600">{gig.description}</p>
                            </div>
                            <p className="text-sm text-gray-700">
                                <span className="font-semibold text-gray-900">Qualifying criteria:</span>{" "}
                                {gig.qualifyingCriteria}
                            </p>
                        </div>
                        <div className="flex w-full flex-col gap-3 rounded-2xl border border-white bg-white/70 p-4 text-sm text-gray-700 sm:max-w-xs">
                            <div className="text-right text-base font-semibold text-gray-900">
                                {gig.budgetLabel}
                            </div>
                            <div className="flex items-start gap-2 text-sm text-gray-600">
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
                            <div className="flex items-start gap-2 text-sm text-gray-600">
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

export default function ManageGigsPage() {
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4">
            <Tabs defaultValue="gigs" className="space-y-6">
                <TabsList className="flex flex-wrap gap-2">
                    <TabsTrigger value="gigs">Gigs</TabsTrigger>
                    <TabsTrigger value="application">Application</TabsTrigger>
                    <TabsTrigger value="availability">Availability Check</TabsTrigger>
                    <TabsTrigger value="contacts">Contact list</TabsTrigger>
                </TabsList>

                <TabsContent value="gigs">
                    <GigList />
                </TabsContent>

                <TabsContent value="application">
                    <Card>
                        <CardHeader>
                            <CardTitle>Application</CardTitle>
                            <CardDescription>
                                Track applicant status, leave notes, and move talent forward without leaving the dashboard.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="application-name">Talent name</Label>
                                <Input id="application-name" placeholder="Noah Elder" />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="application-stage">Stage</Label>
                                <Input id="application-stage" placeholder="Shortlisted" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Update pipeline</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="availability">
                    <Card>
                        <CardHeader>
                            <CardTitle>Availability Check</CardTitle>
                            <CardDescription>
                                Send availability pings to talent and review confirmations in one unified queue.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="availability-session">Session name</Label>
                                <Input id="availability-session" placeholder="Lookbook session" />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="availability-responses">Responses</Label>
                                <Input id="availability-responses" placeholder="3 / 6" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Send reminders</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="contacts">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact list</CardTitle>
                            <CardDescription>
                                Maintain a curated list of collaborators with quick access to their details.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="contacts-name">Contact name</Label>
                                <Input id="contacts-name" placeholder="Maya Chen" />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="contacts-email">Email</Label>
                                <Input id="contacts-email" placeholder="maya@collective.io" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Add to list</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
