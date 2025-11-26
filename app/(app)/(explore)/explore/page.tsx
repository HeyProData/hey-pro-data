import { listExploreCategories } from "@/data/exploreProfiles"
import { MapPin } from "lucide-react"
import Image from "next/image"

type MixedProfile = {
    id: string
    name: string
    location: string
    summary: string
    roles: string[]
    availability: "available" | "booked"
    category: string
    slug: string
    bgimage: string
    avatar: string
}

const buildMixedProfiles = (): MixedProfile[] => {
    const categories = listExploreCategories()
    return categories.flatMap((category) =>
        category.profiles.map((profile) => ({
            ...profile,
            category: category.title,
            slug: category.slug,
            bgimage: profile.bgimage || "",
            avatar: profile.avatar || "",
        })),
    )
}

export default function ExplorePage() {
    const profiles = buildMixedProfiles()

    return (
        <section className="flex flex-wrap  gap-3 sm:gap-3 w-[352px] sm:w-[615px]">
            {profiles.map((profile) => {
                const initials = profile.name
                    .split(" ")
                    .map((chunk) => chunk[0])
                    .join("")
                    .slice(0, 2)
                return (
                    <article
                        key={profile.id}
                        className="relative h-[188px] sm:h-[218px] w-[169px] sm:w-[197px] flex-none rounded-[8.5px]  bg-[#FAFAFA]"
                    >
                        {profile.bgimage && (
                            <Image
                                src={profile.bgimage}
                                alt={profile.name}
                                width={198}
                                height={48}
                                className="absolute left-0 top-0 h-[48px] w-full object-cover rounded-[8.5px] "
                            />
                        )}

                        <div className="absolute left-1/2 top-[21px] flex h-[63px] w-[63px] -translate-x-1/2 items-center justify-center overflow-hidden rounded-full border border-white bg-[#D9D9D9] text-xs font-semibold text-gray-700">
                            {profile.avatar ? (
                                <Image
                                    src={profile.avatar}
                                    alt={profile.name}
                                    width={63}
                                    height={63}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                initials || profile.name.charAt(0)
                            )}
                        </div>

                        <div className="absolute left-1/2 top-[86px] flex w-[120px] -translate-x-1/2 flex-col items-center text-center">
                            <p className="text-[12px] font-medium text-black">{profile.name}</p>
                            <div className="mt-1 flex items-center gap-1 text-[8.5px] text-[#444444]">
                                <MapPin className="h-[10px] w-[10px] stroke-[1.2px] text-[#444444]" />
                                <span className="truncate">{profile.location}</span>
                            </div>
                        </div>

                        <p className="absolute left-3 top-[126px] w-[173px] text-[7.7px] leading-[11px] text-[#444444] line-clamp-3">
                            {profile.summary}
                        </p>

                        <div className="absolute left-3 top-[167px] flex w-[173px] flex-wrap gap-1.5">
                            {profile.roles.slice(0, 3).map((role) => (
                                <span
                                    key={`${profile.id}-${role}`}
                                    className="rounded-[2px] border border-[#31A7AC] bg-white px-[5px] py-[2.5px] text-[7.7px] text-[#31A7AC]"
                                >
                                    {role}
                                </span>
                            ))}
                        </div>
                    </article>
                )
            })}
        </section>
    )
}