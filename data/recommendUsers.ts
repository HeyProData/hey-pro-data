export type RecommendationUser = {
    id: string,
    avatar?: string,
    name: string
    role: string
    handle: string
}

export const recommendationUsers: RecommendationUser[] = [
    { id: "1", name: "Ava Patel", avatar: "/image (2).png", role: "Producer", handle: "@avap" },
    { id: "2", name: "Liam Wright", avatar: "/image (2).png", role: "Director", handle: "@liamwright" },
    { id: "3", name: "Noah Kim", avatar: "/image (2).png", role: "Sound Designer", handle: "@noahk" },
    { id: "4", name: "Sophia Martinez", avatar: "/image (2).png", role: "Editor", handle: "@sophiam" },
    { id: "5", name: "Ethan Chen", avatar: "/image (2).png", role: "Cinematographer", handle: "@ethanc" },
    { id: "6", name: "Mia Johnson", avatar: "/image (2).png", role: "Production Manager", handle: "@miaj" },
    { id: "7", name: "Oliver Scott", avatar: "/image (2).png", role: "Lighting Director", handle: "@oscott" },
    { id: "8", name: "Charlotte Lee", avatar: "/image (2).png", role: "Art Director", handle: "@charlee" },
]
