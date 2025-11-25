
"use client"


import { Badge } from "@/components/ui/badge";
import { MapPin, Camera, Calendar, Edit2 } from "lucide-react";
import { ProfileProgress } from "@/app/(app)/profile/components/profileProgress";



import React, { useState } from "react";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import LinksDialog from "./Links";
import ProfileEditor from "./ProfileEdit";
import { ProfileDataTypes } from "@/types";
import AvalableDilog from "./Avalable";
export default function ShortProfile({ Profile }: { Profile: ProfileDataTypes }) {

    const [profileImageHovered, setProfileImageHovered] = useState(false)

    return (
        <>
            {/* Profile Picture - Overlapping */}
            <div className="-mt-40 ml-15" >
                <div className="relative w-[112px] h-[112px]" onMouseEnter={() => setProfileImageHovered(true)} onMouseLeave={() => setProfileImageHovered(false)}>
                    <ProfileProgress value={Profile.profileCompletion} imageUrl={Profile.avtar} className="rounded-full" />
                    {Profile.profileCompletion > 0 && <div className="absolute text-xl px-3 py-1.5 text-[#FA6E80] -bottom-4 ml-9 mx-auto  bg-[#FFFFFF] rounded-2xl">{Profile.profileCompletion}%</div>}
                    <div className={`absolute inset-1 p-3.5 h-full w-full  flex flex-col items-center justify-center rounded-full transition-opacity ${profileImageHovered ? 'opacity-100 bg-black/60 text-white' : 'opacity-0'}`}>
                        <div className="flex gap-3 -mt-2">
                            <Button variant="default" size="sm" className="rounded-full bg-transparent hover:bg-transparent"><Camera className="h-10 w-10" /></Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Info Section */}
            <div className="space-y-2 mx-auto">
                {/* Name and Status */}
                <div className="flex flex-row sm:flex-row sm:items-center sm:justify-between gap-4 justify-end">
                    <div className="flex flex-row justify-between w-full">
                        <div className="">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-3xl sm:text-4xl font-bold">{Profile.persionalDetails.name}</h1>
                                <div className="flex flex-row justify-center items-center gap-0   px-2 py-1">
                                    <span className="h-2 w-2 rounded-full bg-[#34A353]" />
                                    <Badge className=" text-green-700 text-xl  bg-transparent"><AvalableDilog initialProfile={Profile.persionalDetails} /></Badge>

                                    <div className="flex flex-row justify-center items-center gap-3 text-[#31A7AC]">
                                        <span className="">View in Calendar </span> { } <Calendar className="h-5 w-5" color="#31A7AC" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                                <MapPin className="h-5 w-5" />
                                <span className="text-base">{Profile.persionalDetails.location}</span>
                            </div>
                        </div>
                        <ProfileEditor
                            initialProfile={Profile.persionalDetails}
                            trigger={
                                <Button size="icon" variant="ghost" className="rounded-full bg-[#31A7AC] hover:bg-[#31A7AC]">
                                    <Edit2 className="h-5 w-5 text-white" />
                                </Button>
                            }

                        />

                    </div>
                </div>

                {/* shortAbout */}
                <p className="text-base leading-relaxed ">
                    {Profile.persionalDetails.shortAbout}
                </p>
                {/* Links */}
                <div className="flex items-center gap-2 text-cyan-500">
                    <LinksDialog links={Profile.persionalDetails.links} />
                </div>
                <div className="">
                    <div>
                        {Profile.recomendPeoples.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">People also viewed:</p>
                                <div className="flex items-center flex-row">
                                    {Profile.recomendPeoples.slice(0, 5).map((person, index) => (
                                        <div key={index} className={`w-12 h-12 rounded-full overflow-hidden border-2 border-white ${index > 0 ? '-ml-4' : ''}`}>

                                            <Image
                                                src={person.imgUrl}
                                                alt={`Profile ${index + 1}`}
                                                width={50}
                                                height={50}
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                    ))}
                                    {Profile.recomendPeoples.length > 1 && (
                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center -ml-4 border-2 border-white">
                                            <span className="text-sm font-semibold text-gray-700">+{Profile.recomendPeoples.length - 2}</span>
                                        </div>
                                    )}
                                    <span className="text-[#FA6E80] text-xl">+{Profile.recomendPeoples.length - 2} recommendation</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recommend Peoples */}



            </div>
        </>)
}