import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { addMemberToGroup, getGroupDetails } from "../services/api"; // Ensure this path matches your project
import AddExpenseModal from "../components/groups/AddExpenseModal"
import InviteMemberModal from "../components/groups/InviteMemberModal";
import { addGroupExpense } from "../services/api";
import { inviteUserToGroup } from "../services/api";
const Dashboard = () => {
    const { groupId } = useParams();
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Modal State Management ---
    const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);

    // Load data when component mounts
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const data = await getGroupDetails(groupId);
                setGroupData(data);
            } catch (err) {
                setError("Failed to load group details.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [groupId]);

    // --- Handlers ---

    // 1. Handle adding a new expense (Optimistic UI Update)
    const handleAddExpense = async (newExpense) => {
        // Create a temporary ID for immediate display
        const optimisticExpense = { 
            ...newExpense, 
            id: Date.now(),
            date: new Date().toISOString() 
        };

        // Update local state immediately so user sees it
        setGroupData((prev) => ({
            ...prev,
            expenses: [optimisticExpense, ...(prev.expenses || [])]
        }));
        
        await addGroupExpense(groupId,newExpense);
        
 
    };

    // 2. Handle sending an invite
    const handleInviteMember = async (username) => {
        console.log(`Inviting user: ${username}`);
        alert(`Invite sent to ${username}!`);
        
        await inviteUserToGroup(groupData,username)
       
        // await api.inviteUser(groupId, email);
    };

    if (loading) return <div className="text-center mt-20">Loading Dashboard...</div>;
    if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;
    if (!groupData) return null;

    // Calculate Total Expense
    const totalExpense = groupData.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                
                {/* --- HEADER --- */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{groupData.groupName}</h1>
                        <p className="text-gray-500">Group ID: {groupData.groupId}</p>
                    </div>
                    <Link to="/groups" className="text-indigo-600 hover:text-indigo-800 font-medium">
                        &larr; Back to Groups
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* --- LEFT COLUMN: MEMBERS & STATS --- */}
                    <div className="space-y-6">
                        
                        {/* Summary Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-gray-500 text-sm font-semibold uppercase">Total Spending</h3>
                            <p className="text-4xl font-bold text-indigo-600 mt-2">₹{totalExpense}</p>
                        </div>

                        {/* Members List */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Members</h3>
                            <div className="space-y-3">
                                {groupData.members && groupData.members.length > 0 ? (
                                    groupData.members.map((member) => (
                                        <div key={member.id} className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm">
                                                {member.username.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-gray-700">{member.username}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 italic">No members yet.</p>
                                )}
                            </div>
                            
                            {/* Invite Member Button */}
                            <button 
                                onClick={() => setInviteModalOpen(true)}
                                className="w-full mt-6 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition text-sm font-medium"
                            >
                                + Invite Member
                            </button>
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: EXPENSES LIST --- */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-800">Recent Expenses</h3>
                                
                                {/* Add Expense Button */}
                                <button 
                                    onClick={() => setExpenseModalOpen(true)}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 shadow-sm"
                                >
                                    + Add Expense
                                </button>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {groupData.expenses && groupData.expenses.length > 0 ? (
                                    groupData.expenses.map((expense) => (
                                        <div key={expense.id} className="p-4 hover:bg-gray-50 transition flex justify-between items-center">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-xl">
                                                    💸
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{expense.description}</p>
                                                    <p className="text-sm text-gray-500">Paid by <span className="font-medium">{expense.paidBy}</span></p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-800 text-lg">₹{expense.amount}</p>
                                                <p className="text-xs text-gray-400">{new Date(expense.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-10 text-center text-gray-400">
                                        <p>No expenses recorded yet.</p>
                                        <p className="text-sm">Click "Add Expense" to get started!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- MODALS RENDERED HERE --- */}
            <AddExpenseModal 
                isOpen={isExpenseModalOpen} 
                onClose={() => setExpenseModalOpen(false)}
                members={groupData.members || []}
                onAddExpense={handleAddExpense}
            />

            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setInviteModalOpen(false)}
                onInvite={handleInviteMember}
            />
        </div>
    );
};

export default Dashboard;