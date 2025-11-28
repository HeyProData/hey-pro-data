type CollabStatus = "waitlisted" | "interested";

const toSlug = (value: string) =>
    value
        .toLowerCase()
        .replace(/[|()]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

export type CollabPost = {
    id: number;
    title: string;
    slug: string;
    summary: string;
    tags: string[];
    status: CollabStatus;
    interests: number;
    interestAvatars: string[];
    postedOn: string;
    author: string;
    avatar: string;
    cover: string;
};

const collabPosts: CollabPost[] = [
    {
        id: 1,
        title: "Midnight Circus | Horror Launch",
        slug: toSlug("Midnight Circus | Horror Launch"),
        summary:
            "Enter a chilling world of suspense and terror where every shadow hides a secret and every whisper could be a scream. Our horror film delves into the eerie silence of an isolated house, where dark pasts resurface and the line between reality and nightmare blurs.",
        tags: ["film writing", "screenplay", "creativity", "collaboration", "movie launch"],
        status: "waitlisted",
        interests: 18,
        interestAvatars: ["/image (1).png", "/image (2).png", "/image (3).png"],
        postedOn: "15 Oct, 2025",
        author: "Michael Molar",
        avatar: "/image (2).png",
        cover: "/bg.jpg",
    },
    {
        id: 2,
        title: "Psychological Thriller Anthology",
        slug: toSlug("Psychological Thriller Anthology"),
        summary:
            "Join forces to craft a series of unsettling vignettes that peel back the layers of the human mind. We are blending noir visuals with experimental sound design to deliver an experience that lingers long after the credits roll.",
        tags: ["film writing", "screenplay", "creativity", "collaboration", "movie launch"],
        status: "interested",
        interests: 15,
        interestAvatars: ["/image (1).png", "/image (2).png", "/image (3).png"],
        postedOn: "12 Oct, 2025",
        author: "Michael Molar",
        avatar: "/image (2).png",
        cover: "/bg.jpg",
    },
];

export const getCollabById = (id: number) => collabPosts.find((post) => post.id === id);
export const getAllCollabs = () => collabPosts;
