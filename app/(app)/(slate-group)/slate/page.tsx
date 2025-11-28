"use client";
import { Separator } from "@/components/ui/separator";
import { Ellipsis, Heart, MessageCircle, Send } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SlatePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            console.log('[Slate] Checking authentication...');
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                console.log('[Slate] No session found, redirecting to login');
                router.push('/login');
                return;
            }
            
            console.log('[Slate] Session found, checking profile with retry mechanism...');
            const token = session.access_token;
            
            // Retry mechanism for profile check (handles race conditions)
            const checkProfileWithRetry = async (retries = 3, delay = 1000): Promise<boolean> => {
                for (let attempt = 1; attempt <= retries; attempt++) {
                    try {
                        console.log(`[Slate] Profile check attempt ${attempt}/${retries}`);
                        
                        const response = await fetch('/api/profile', {
                            headers: { 'Authorization': `Bearer ${token}` },
                            cache: 'no-store' // Prevent caching
                        });
                        
                        const data = await response.json();
                        console.log(`[Slate] Profile check result (attempt ${attempt}):`, data);
                        
                        if (data.success && data.data) {
                            console.log('[Slate] Profile found!');
                            return true;
                        }
                        
                        // Profile not found, wait before retry (except on last attempt)
                        if (attempt < retries) {
                            console.log(`[Slate] Profile not found, waiting ${delay}ms before retry...`);
                            await new Promise(resolve => setTimeout(resolve, delay));
                        }
                    } catch (error) {
                        console.error(`[Slate] Profile check error (attempt ${attempt}):`, error);
                        if (attempt < retries) {
                            await new Promise(resolve => setTimeout(resolve, delay));
                        }
                    }
                }
                
                return false;
            };
            
            try {
                const profileExists = await checkProfileWithRetry();
                
                if (!profileExists) {
                    console.log('[Slate] No profile found after retries, redirecting to form');
                    router.push('/form');
                    return;
                }
                
                console.log('[Slate] All checks passed, showing page');
                setLoading(false);
            } catch (error) {
                console.error('[Slate] Fatal profile check error:', error);
                router.push('/login');
            }
        };
        
        checkAuth();
    }, [router]);
    interface Slate {
        id: string,
        profileAvtar: string,
        profileName: string,
        role: string,
        totlerole: string,
        noLike: number,
        noComment: number,
        description: string
        slateSrc?: string

    }
    const slate: Slate[] = [
        {
            id: "1",
            profileAvtar: "/Image (1).png",
            profileName: "Jone Dev",
            role: "Cinematographer",
            totlerole: "15 Roles",
            noLike: 10000,
            noComment: 1000,
            slateSrc: "/slate.png",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        },
        {
            id: "2",
            profileAvtar: "/Image (2).png",
            profileName: "Jone Dev",
            role: "Cinematographer",
            totlerole: "15 Roles",
            noLike: 10000,
            noComment: 1000,
            slateSrc: "/slate.png",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        },
        {
            id: "3",
            profileAvtar: "/Image (3).png",
            profileName: "Jone Dev",
            role: "Cinematographer",
            totlerole: "15 Roles",
            noLike: 10000,
            noComment: 1000,
            slateSrc: "/slate.png",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        },
        {
            id: "4",
            profileAvtar: "/slate.png",
            profileName: "Jone Dev",
            role: "Cinematographer",
            totlerole: "15 Roles",
            noLike: 10000,
            noComment: 1000,
            slateSrc: "/slate.png",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        }

    ]
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA6E80] mx-auto"></div>
                    <p className="text-gray-900 text-lg">Loading slate...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="mt-3">
            <div>
                {
                    slate.map((item) => (
                        <div key={item.id} className="mb-4">
                            <SlateCard
                                profileAvtar={item.profileAvtar}
                                profileName={item.profileName}
                                role={item.role}
                                totlerole={item.totlerole}
                                noLike={item.noLike}
                                noComment={item.noComment}
                                description={item.description}
                                slateSrc={item.slateSrc}
                            />
                        </div>
                    ))
                }
            </div>
        </div>
    );
}


function SlateCard({ profileAvtar,
    profileName,
    role,
    totlerole,
    description,
    slateSrc
}: {
    profileAvtar: string,
    profileName: string,
    role: string,
    totlerole: string,
    noLike: number,
    noComment: number,
    description: string,
    slateSrc?: string
}) {
    return (
        <div className=" max-w-[377px] border-gray-300 rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center mb-4">
                    <Image
                        src={profileAvtar}
                        alt={profileName}
                        height={100}
                        width={100}
                        className="w-11 h-11 rounded-full mr-4 object-cover"
                    />
                    <div>
                        <h2 className="text-lg font-semibold">{profileName}</h2>
                        <p className="text-sm text-gray-600">{role} + {totlerole}</p>
                    </div>
                </div>
                <div>
                    {<Ellipsis className="h-6 w-6" />}
                </div>
            </div>
            <div>
                {slateSrc && (
                    <Image
                        src={slateSrc}
                        alt={profileName}
                        height={377}
                        width={377}
                        className="w-[377px] h-[377px] object-cover rounded-lg mb-4"
                    />
                )}
            </div>
            <div className=" flex flex-row gap-3.5 justify-start">
                <span><Heart className="h-6 w-6" /></span>
                <span><MessageCircle className="h-6 w-6" /></span>
                <span><Send className="h-6 w-6" /></span>
            </div>
            <DescriptionWithShowMore description={description} />
            <Separator className="" />

        </div>
    );
}

function DescriptionWithShowMore({ description }: { description: string }) {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const shouldTruncate = description.length > 150;
    const displayedDescription = isExpanded || !shouldTruncate
        ? description
        : description.slice(0, 200) + '...';

    return (
        <div className="mb-4">
            <p className="text-gray-700 mb-1 text-[12px]">{displayedDescription}</p>
            {shouldTruncate && (
                <button
                    onClick={toggleExpand}
                    className="text-[12px]"
                >
                    {isExpanded ? 'Show Less' : 'Show More'}
                </button>
            )}
        </div>
    );
}