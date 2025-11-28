
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, MessageCircle } from "lucide-react";
import Image from "next/image";
export default function DataTable({ rsvpEntries }: {
    rsvpEntries: Array<{
        id: string;
        name: string;
        ticketNo: string;
        reference: string;
        chatEnabled: boolean;
        paid: boolean;
    }>
}) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-5">
                <h3 className="text-lg font-semibold text-gray-800">RSVP ({rsvpEntries.length}/20)</h3>
                <button type="button" className="inline-flex items-center gap-2 rounded-[18px] bg-[#31A7AC] px-4 py-2 text-sm font-semibold text-white">
                    <Download className="h-4 w-4" />
                    Export Data
                </button>
            </div>
            <div className=" border-black/10 bg-white p-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Ticket No</TableHead>
                            <TableHead>Reference No</TableHead>
                            <TableHead>Chat</TableHead>
                            <TableHead>Payment</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rsvpEntries.map((entry) => (
                            <TableRow key={entry.id}>
                                <TableCell className="flex items-center gap-3">
                                    <Image src="/assets/whatson/host-avatar.svg" alt={entry.name} width={32} height={32} className="rounded-full" />
                                    {entry.name}
                                </TableCell>
                                <TableCell>{entry.ticketNo}</TableCell>
                                <TableCell>{entry.reference}</TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center gap-1 text-gray-600">
                                        <MessageCircle className="h-4 w-4" />
                                        {entry.chatEnabled ? "Open" : "-"}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center gap-1 ${entry.paid ? "text-green-600" : "text-[#FF4B82]"}`}>
                                        <span className="text-xs font-semibold">{entry.paid ? "Paid" : "Unpaid"}</span>
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}