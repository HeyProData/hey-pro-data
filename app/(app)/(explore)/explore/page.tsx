import { Badge } from "@/components/ui/badge"
import { listExploreCategories } from "@/data/exploreProfiles"

type MixedProfile = {
    id: string
    name: string
    location: string
    summary: string
    roles: string[]
    availability: "available" | "booked"
    category: string
    slug: string
}

const buildMixedProfiles = (): MixedProfile[] => {
    const categories = listExploreCategories()
    return categories.flatMap((category) =>
        category.profiles.map((profile) => ({
            ...profile,
            category: category.title,
            slug: category.slug,
        })),
    )
}

const AVAILABILITY_COPY: Record<MixedProfile["availability"], { label: string; color: string }> = {
    available: { label: "Available", color: "text-emerald-600" },
    booked: { label: "Currently booked", color: "text-amber-600" },
}

export default function ExplorePage() {
    const profiles = buildMixedProfiles()

    return (
        <section className="space-y-10">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {profiles.map((profile) => {
                    const availabilityCopy = AVAILABILITY_COPY[profile.availability]

                    return (
                        <article
                            key={profile.id}
                            className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_15px_35px_rgba(4,42,61,0.07)]"
                        >
                            <div className="h-24 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500" />
                            <div className="-mt-10 flex flex-col gap-4 px-6 pb-6">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-slate-200 text-lg font-semibold text-slate-600">
                                        {profile.name
                                            .split(" ")
                                            .map((chunk) => chunk[0])
                                            .join("")}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs uppercase tracking-wide text-[#017A7C]">{profile.category}</p>
                                        <p className="text-lg font-semibold text-slate-900">{profile.name}</p>
                                        <p className="text-sm text-slate-500">{profile.location}</p>
                                        <p className={`text-xs font-medium ${availabilityCopy.color}`}>{availabilityCopy.label}</p>
                                    </div>
                                </div>
                                <p className="text-sm leading-relaxed text-slate-600">{profile.summary}</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.roles.map((role) => (
                                        <Badge
                                            key={`${profile.id}-${role}`}
                                            variant="outline"
                                            className="border-[#31A7AC]/40 bg-[#E4F5F5] text-xs text-[#017A7C]"
                                        >
                                            {role}
                                        </Badge>
                                    ))}
                                </div>
                                <a
                                    href={`/explore/${profile.slug}`}
                                    className="mt-1 inline-flex items-center text-sm font-semibold text-[#017A7C] hover:text-[#015e60]"
                                >
                                    View category
                                </a>
                            </div>
                        </article>
                    )
                })}
            </div>
        </section>
    )
}