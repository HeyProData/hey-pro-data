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
    const totalProfiles = profiles.length
    const availableProfiles = profiles.filter((profile) => profile.availability === "available").length

    return (
        <section className="space-y-10">
            <header className="space-y-6 rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-[0_25px_65px_rgba(4,42,61,0.05)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">Explore talent</p>
                        <h1 className="text-4xl font-semibold text-slate-900">Mixed Crew Directory</h1>
                        <p className="max-w-3xl text-base text-slate-600">
                            Browse a blended lineup of directors, producers, and production managers trusted across MENA.
                            Use this view when you need inspiration or want to message multiple disciplines at once.
                        </p>
                    </div>
                    <div className="flex gap-6 text-sm text-slate-600">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-400">Profiles</p>
                            <p className="text-2xl font-semibold text-slate-900">{totalProfiles}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-400">Available now</p>
                            <p className="text-2xl font-semibold text-slate-900">{availableProfiles}</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                    {Array.from(new Set(profiles.map((profile) => profile.category))).map((category) => (
                        <span
                            key={category}
                            className="rounded-full border border-[#31A7AC]/40 bg-[#F0FBFB] px-4 py-1 text-[#017A7C]"
                        >
                            {category}
                        </span>
                    ))}
                </div>
            </header>

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