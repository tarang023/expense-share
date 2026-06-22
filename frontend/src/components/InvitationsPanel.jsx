import { useEffect, useState, useRef } from "react";
import { getPendingInvites, acceptInvite, rejectInvite } from "../services/api";

/**
 * InvitationsPanel
 * A bell icon in the navbar. Clicking it opens a dropdown listing all
 * PENDING invitations for the logged-in user. Each row has Accept / Reject
 * buttons that call the backend and refresh the list.
 */
export default function InvitationsPanel() {
    const [invites, setInvites] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef(null);

    const load = async () => {
        setLoading(true);
        const data = await getPendingInvites();
        setInvites(data);
        setLoading(false);
    };

    useEffect(() => {
        load();
        // poll every 30 s so new invites appear without a page refresh
        const interval = setInterval(load, 30000);
        return () => clearInterval(interval);
    }, []);

    // close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAccept = async (inviteId) => {
        try {
            await acceptInvite(inviteId);
            setInvites((prev) => prev.filter((i) => i.id !== inviteId));
        } catch (err) {
            alert("Failed to accept invite.");
        }
    };

    const handleReject = async (inviteId) => {
        try {
            await rejectInvite(inviteId);
            setInvites((prev) => prev.filter((i) => i.id !== inviteId));
        } catch (err) {
            alert("Failed to reject invite.");
        }
    };

    return (
        <div className="relative" ref={panelRef}>
            {/* ── Bell button ── */}
            <button
                id="invitations-bell"
                onClick={() => setOpen((o) => !o)}
                className="relative p-2 rounded-full hover:bg-white/10 transition"
                aria-label="Invitations"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* Badge */}
                {invites.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold
                                     rounded-full w-5 h-5 flex items-center justify-center">
                        {invites.length}
                    </span>
                )}
            </button>

            {/* ── Dropdown panel ── */}
            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border
                                border-gray-100 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800 text-sm">Group Invitations</h3>
                        <span className="text-xs text-gray-400">{invites.length} pending</span>
                    </div>

                    {loading ? (
                        <div className="p-6 text-center text-sm text-gray-400">Loading…</div>
                    ) : invites.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-400">
                            No pending invitations 🎉
                        </div>
                    ) : (
                        <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                            {invites.map((inv) => (
                                <li key={inv.id} className="px-4 py-3">
                                    <p className="text-sm text-gray-800 font-medium mb-0.5">
                                        {inv.groupName}
                                    </p>
                                    <p className="text-xs text-gray-500 mb-2">
                                        Invited by <span className="font-semibold">{inv.inviterUsername}</span>
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            id={`accept-invite-${inv.id}`}
                                            onClick={() => handleAccept(inv.id)}
                                            className="flex-1 text-xs bg-indigo-600 hover:bg-indigo-700
                                                       text-white font-semibold py-1.5 rounded-lg transition"
                                        >
                                            ✓ Accept
                                        </button>
                                        <button
                                            id={`reject-invite-${inv.id}`}
                                            onClick={() => handleReject(inv.id)}
                                            className="flex-1 text-xs bg-gray-100 hover:bg-red-50
                                                       hover:text-red-600 text-gray-600 font-semibold
                                                       py-1.5 rounded-lg transition"
                                        >
                                            ✕ Reject
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
