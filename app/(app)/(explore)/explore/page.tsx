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
        <section className="flex flex-wrap gap-3 xl:gap-4 mx-auto justify-center items-center">
            {profiles.map((profile) => {
                const initials = profile.name
                    .split(" ")
                    .map((chunk) => chunk[0])
                    .join("")
                    .slice(0, 2)
                return (
                    <article
                        key={profile.id}
                        className="relative h-[188px] sm:h-[218px] xl:h-[250px] w-[169px] sm:w-[197px] xl:w-[230px] flex-none rounded-[8.5px] xl:rounded-[12px] bg-[#FAFAFA]"
                    >
                        {profile.bgimage && (
                            <Image
                                src={profile.bgimage}
                                alt={profile.name}
                                width={198}
                                height={48}
                                className="absolute left-0 top-0 h-[48px] sm:h-[48px] xl:h-[60px] w-full object-cover rounded-[8.5px] xl:rounded-[12px]"
                            />
                        )}

                        <div className="absolute left-1/2 top-[21px] xl:top-[26px] flex h-[55px] sm:h-[63px] xl:h-[78px] w-[55px] sm:w-[63px] xl:w-[78px] -translate-x-1/2 items-center justify-center overflow-hidden rounded-full border border-white bg-[#D9D9D9] text-xs sm:text-xs xl:text-sm font-semibold text-gray-700">
                            {profile.avatar ? (
                                <Image
                                    src={profile.avatar}
                                    alt={profile.name}
                                    width={80}
                                    height={80}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                initials || profile.name.charAt(0)
                            )}
                        </div>

                        <div className="absolute left-1/2 sm:top-[86px] top-[74px] xl:top-[105px] flex w-[120px] sm:w-[130px] xl:w-[160px] -translate-x-1/2 flex-col items-center text-center">
                            <p className="text-[12px] sm:text-[12px] xl:text-[14px] font-medium text-black">{profile.name}</p>
                            <div className="mt-1 flex items-center gap-1 text-[8.5px] sm:text-[9px] xl:text-[10px] text-[#444444]">
                                <MapPin className="h-[10px] w-[10px] sm:h-[10px] sm:w-[10px] xl:h-[12px] xl:w-[12px] stroke-[1.2px] text-[#444444]" />
                                <span className="truncate">{profile.location}</span>
                            </div>
                        </div>

                        <p className="absolute left-3 sm:left-3 xl:left-4 sm:top-[126px] top-[108px] xl:top-[150px] text-[6px] sm:text-[7.7px] xl:text-[9px] leading-[11px] xl:leading-[13px] text-[#444444] line-clamp-3">
                            {profile.summary}
                        </p>

                        <div className="absolute left-3 sm:left-3 xl:left-4 sm:top-[167px] top-[144px] xl:top-[205px] flex h-[37px] xl:h-auto flex-wrap gap-1 xl:gap-1.5">
                            {profile.roles.slice(0, 3).map((role) => (
                                <span
                                    key={`${profile.id}-${role}`}
                                    className="rounded-[2px] xl:rounded-[3px] border border-[#31A7AC] bg-white px-[5px] xl:px-[7px] py-[2.5px] xl:py-[3px] h-[16px] xl:h-[20px] text-[7.7px] xl:text-[9px] text-[#31A7AC]"
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