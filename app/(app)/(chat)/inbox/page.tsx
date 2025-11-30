export default function InboxPage() {
    return (
        <main className="p-10">
            {/* Messaging skeleton */}
            <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar h-[600px]">
                {[...Array(50)].map((_, i) => (
                    i % 2 === 0 ? (
                        <div key={i} className="flex items-center gap-3 animate-pulse justify-start">
                            <div className="w-12 h-12 rounded-full bg-gray-200" />
                            <div className="flex-1 flex flex-col items-start">
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                                <div className="h-3 bg-gray-100 rounded w-1/3" />
                            </div>
                        </div>
                    ) : (
                        <div key={i} className="flex items-center gap-3 animate-pulse justify-end">
                            <div className="flex-1 flex flex-col items-end">
                                <div className="h-8 bg-gray-100 rounded w-1/2 mb-2" />
                                <div className="h-6 bg-gray-100 rounded w-1/3" />
                            </div>
                            <div className="w-12 h-12 rounded-full bg-gray-200" />
                        </div>
                    )
                ))}
            </div>
        </main>
    )
}