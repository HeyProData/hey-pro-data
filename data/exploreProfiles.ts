const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[|()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

export type ExploreProfile = {
  id: string
  name: string
  location: string
  summary: string
  roles: string[]
  availability: "available" | "booked"
  bgimage?: string
  avatar?: string
}

export type ExploreCategory = {
  slug: string
  title: string
  summary: string
  lastUpdated: string
  profiles: ExploreProfile[]
}

const categories: ExploreCategory[] = [
  {
    slug: toSlug("Producer"),
    title: "Producers Collective",
    summary:
      "Curated roster of producers ready to take on commercials, TV, and digital-first campaigns across MENA.",
    lastUpdated: "Updated 3 days ago",
    profiles: [
      {
        id: "producer-michael",
        name: "Michael Molar",
        location: "UAE, Dubai",
        summary:
          "Behind-the-scenes documentary capturing the energy and creativity of Dubai Fashion Week 2024.",
        roles: ["Producer", "Producer | Creative", "Production Manager"],
        availability: "available",
        bgimage: "/image.png",
        avatar: "/image (2).png"
      },
      {
        id: "producer-alia",
        name: "Alia Rahman",
        location: "Qatar, Doha",
        summary:
          "Cross-cultural storyteller delivering large-scale live experiences for global luxury houses.",
        roles: ["Executive Producer", "Line Producer", "Producer"],
        availability: "available",
        bgimage: "/image.png",
        avatar: "/image (2).png"
      },
      {
        id: "producer-samir",
        name: "Samir Pasha",
        location: "KSA, Riyadh",
        summary:
          "Hybrid producer blending physical production with virtual stages for high-speed automotive shoots.",
        roles: ["Producer", "Virtual Production", "Line Producer", "Production Manager"],
        availability: "booked",
        bgimage: "/image.png",
        avatar: "/image (2).png"
      },
    ],
  },
  {
    slug: toSlug("Director"),
    title: "Narrative Directors",
    summary: "Visual voices crafting cinematic storytelling for brands, film, and episodic content.",
    lastUpdated: "Updated yesterday",
    profiles: [
      {
        id: "director-lara",
        name: "Lara Choi",
        location: "UAE, Abu Dhabi",
        summary: "Character-first director focused on grounded sci-fi and high-gloss automotive spots.",
        roles: ["Director", "Director | Commercial", "Cinematographer"],
        availability: "available",
        bgimage: "/image.png",
        avatar: "/image (2).png"
      },
      {
        id: "director-adil",
        name: "Adil Kanaan",
        location: "Morocco, Casablanca",
        summary:
          "Long-form storyteller fluent in Arabic, French, and English, leading crews across North Africa.",
        roles: ["Director", "Writer", "Cinematographer", "Line Producer"],
        availability: "booked",
        bgimage: "/image.png",
        avatar: "/image (2).png"
      },
      {
        id: "director-ines",
        name: "Ines Valdez",
        location: "Spain, Barcelona",
        summary: "Documentary director embedding with sports teams and live events worldwide.",
        roles: ["Director", "Assistant Director", "Producer"],
        availability: "available",
        bgimage: "/image.png",
        avatar: "/image (2).png"
      },
    ],
  },
  {
    slug: toSlug("Production Manager"),
    title: "Production Management",
    summary:
      "End-to-end operators covering schedules, budgets, visas, and vendor networks for complex shoots.",
    lastUpdated: "Updated 5 hours ago",
    profiles: [
      {
        id: "pm-huda",
        name: "Huda Al Marri",
        location: "UAE, Dubai",
        summary: "Behind-the-scenes documentary capturing the energy and creativity of Dubai Fashion Week 2024. We need a skilled team to document designers, models, and the fashion industry magic..",
        roles: ["Production Manager", "Logistics", "Fixer", "Line Producer"],
        availability: "available",
        bgimage: "/image.png",
        avatar: "/image (2).png"
      },
      {
        id: "pm-jake",
        name: "Jake O'Connor",
        location: "Ireland, Dublin",
        summary: "Specializes in EU / GCC co-productions with deep tax incentive knowledge.",
        roles: ["Line Producer", "Production Manager"],
        availability: "available",
        bgimage: "/image.png",
        avatar: "/image (2).png"
      },
      {
        id: "pm-saira",
        name: "Saira Khan",
        location: "Pakistan, Karachi",
        summary: "Remote-friendly PM coordinating multi-country documentary crews on tight timelines.",
        roles: ["Production Coordinator", "Production Manager"],
        availability: "booked",
        bgimage: "/image.png",
        avatar: "/image (2).png"
      },
    ],
  },
]

const categoryMap = new Map(categories.map((category) => [category.slug, category]))

export function getExploreCategory(slug: string) {
  return categoryMap.get(slug) ?? null
}

export function listExploreSlugs() {
  return categories.map((category) => category.slug)
}

export function listExploreCategories() {
  return categories
}