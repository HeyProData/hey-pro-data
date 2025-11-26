const toSlug = (value: string) =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

export type WhatsOnEvent = {
    id: string;
    isOnline?: boolean;
    title: string;
    slug: string;
    location: string;
    isPaid: boolean;
    priceLabel: string;
    dateRangeLabel: string;
    rsvpBy: string;
    host: {
        name: string;
        organization: string;
        avatar: string;
    };
    schedule: Array<{
        dateLabel: string;
        timeRange: string;
        timezone: string;
    }>;
    description: string[];
    terms: string[];
    tags: string[];
    thumbnail: string;
    heroImage: string;
};

const baseDescription = [
    "Filmmaking Q&A - Bi-weekly event for all your filmmaking questions.",
    "If you have any questions related to filmmaking, ask here. Screenplay, Cinematography, Lighting, Direction, Editing etc.",
    "No judgement. Just answers. Limited spots in a session. Please RSVP if you are attending.",
    "Don't miss this opportunity to connect with fellow filmmakers and enhance your craft!",
];

const baseTerms = [
    "Introduction: By accessing or using this website/application, you agree to comply with and be bound by these Terms and Conditions. If you do not accept these terms, please do not use our services.",
    "Use of Service: You agree to use the platform only for lawful purposes and in a way that does not infringe on the rights of others or restrict their use of the service.",
    "User Accounts: You are responsible for maintaining the confidentiality of your account information. Any activity under your account will be considered your responsibility.",
    "Intellectual Property: All content, including text, graphics, logos, and software, is the property of the service provider and protected by applicable copyright laws.",
    "Limitation of Liability: We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of our service.",
    "Changes to Terms: We reserve the right to modify these Terms and Conditions at any time. Your continued use of the service implies acceptance of the updated terms.",
    "Governing Law: These Terms and Conditions are governed by the laws of the relevant jurisdiction.",
    "By using this website/application, you acknowledge that you have read, understood, and agree to these terms.",
];

const baseSchedule = [
    { dateLabel: "Sun, Oct 26 2025", timeRange: "9:00 PM - 10:00 PM", timezone: "IST" },
    { dateLabel: "Sun, Oct 26 2025", timeRange: "9:00 PM - 10:00 PM", timezone: "IST" },
    { dateLabel: "Sun, Oct 26 2025", timeRange: "9:00 PM - 10:00 PM", timezone: "IST" },
];

const baseTags = [
    "Movie",
    "Film",
    "AI",
    "Mountain View",
    "Online movie streaming services",
    "Filmmaking",
    "Activity planning tools",
    "Editing",
];

const createEvent = (id: string, title: string, location: string, isPaid: boolean): WhatsOnEvent => ({
    id,
    title,
    slug: toSlug(title),
    location,
    isPaid,
    priceLabel: isPaid ? "100 AED" : "Free",
    dateRangeLabel: "Oct 15, 2025 - Oct 18, 2025",
    rsvpBy: "Sun, Oct 23 2025",
    host: {
        name: "Cinema Studio",
        organization: "Cinema Studio",
        avatar: "/whats-on.png",
    },
    schedule: baseSchedule,
    description: baseDescription,
    terms: baseTerms,
    tags: baseTags,
    thumbnail: "/whats-on.png",
    heroImage: "/whats-on.png",
});

export const whatsOnEvents: WhatsOnEvent[] = [
    createEvent("1", "Movie Makers' Meetup: Bi-Weekly Q&A", "UAE, Dubai", true),
    createEvent("2", "Cinematography Lighting Lab", "UAE, Dubai", false),
    createEvent("3", "Production Sound Masterclass", "UAE, Dubai", true),
    createEvent("4", "Directors' Table Talk", "UAE, Dubai", true),
    createEvent("5", "Script Breakdown Workshop", "UAE, Dubai", false),
    createEvent("6", "Post Production Roundtable", "UAE, Dubai", true),
    createEvent("7", "Film Financing 101", "UAE, Dubai", true),
    createEvent("8", "On-Set Safety Briefing", "UAE, Dubai", false),
    createEvent("9", "Casting & Audition Clinic", "UAE, Dubai", true),
];

export const getWhatsOnEventBySlug = (slug: string) => whatsOnEvents.find((event) => event.slug === slug);
export const getWhatsOnEventById = (id: string) => whatsOnEvents.find((event) => event.id === id);