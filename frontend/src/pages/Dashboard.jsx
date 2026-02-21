import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { addMemberToGroup, getGroupDetails, getSettlements, recordSettlement, addGroupExpense, inviteUserToGroup } from "../services/api"; 
import AddExpenseModal from "../components/groups/AddExpenseModal"
import InviteMemberModal from "../components/groups/InviteMemberModal";

const Dashboard = () => {
    const { groupId } = useParams();
    const [groupData, setGroupData] = useState(null);
    const [settlements, setSettlements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    
    const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);

    
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const data = await getGroupDetails(groupId);
                setGroupData(data);

                const settlementData = await getSettlements(groupId);
                setSettlements(settlementData);
            } catch (err) {
                setError("Failed to load group details.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [groupId]);

    

    
    const handleAddExpense = async (newExpense) => {
        
        const optimisticExpense = {
            ...newExpense,
            id: Date.now(),
            date: new Date().toISOString()
        };

        
        setGroupData((prev) => ({
            ...prev,
            expenses: [optimisticExpense, ...(prev.expenses || [])]
        }));

        await addGroupExpense(groupId, newExpense);


    };

    
    const handleInviteMember = async (username) => {
        console.log(`Inviting user: ${username}`);
        alert(`Invite sent to ${username}!`);

        await inviteUserToGroup(groupData, username)

        
    };

    
    const handleSettleUp = async (transaction) => {
        try {
            await recordSettlement(groupId, transaction);
            alert("Settlement recorded successfully!");

            
            const [newData, newSettlements] = await Promise.all([
                getGroupDetails(groupId),
                getSettlements(groupId)
            ]);
            setGroupData(newData);
            setSettlements(newSettlements);
        } catch (error) {
            alert("Error recording settlement.");
        }
    };

    if (loading) return <div className="text-center mt-20">Loading Dashboard...</div>;
    if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;
    if (!groupData) return null;

    
    const totalExpense = groupData.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">

                {}
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

                    {}
                    <div className="space-y-6">

                        {}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-gray-500 text-sm font-semibold uppercase">Total Spending</h3>
                            <p className="text-4xl font-bold text-indigo-600 mt-2">₹{totalExpense}</p>
                        </div>

                        {}
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

                            {}
                            <button
                                onClick={() => setInviteModalOpen(true)}
                                className="w-full mt-6 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition text-sm font-medium"
                            >
                                + Invite Member
                            </button>
                        </div>
                    </div>

                    {}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-800">Recent Expenses</h3>

                                {}
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

                        {}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50">
                                <h3 className="text-lg font-bold text-indigo-900">Settlements (Who owes who)</h3>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {settlements.length > 0 ? (
                                    settlements.map((s, idx) => {
                                        
                                        const payerName = groupData.members.find(m => m.id === s.payerId)?.username || `User ${s.payerId}`;
                                        const payeeName = groupData.members.find(m => m.id === s.payeeId)?.username || `User ${s.payeeId}`;

                                        return (
                                            <div key={idx} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-red-500">{payerName}</span>
                                                    <span className="text-gray-500 text-sm">owes</span>
                                                    <span className="font-bold text-green-600">{payeeName}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="font-bold text-lg">₹{s.amount.toFixed(2)}</span>
                                                    <button
                                                        onClick={() => handleSettleUp(s)}
                                                        className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded font-bold hover:bg-indigo-200 transition"
                                                    >
                                                        Settle Up
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="p-8 text-center text-gray-400 text-sm italic">
                                        All settled up! No active debts.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {}
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