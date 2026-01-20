import { useState } from "react";
import { useParams } from "react-router-dom";
import { getSettlements } from "../services/api";

const Dashboard = () => {
    const { groupId } = useParams();  
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSettleUp = async () => {
        setLoading(true);
        const data = await getSettlements(groupId);
        setTransactions(data);
        setLoading(false);
    };

    return (
        <div className="container mx-auto mt-10 p-4 max-w-4xl">
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
                FairShare Dashboard
            </h1>

            <div className="bg-white shadow-lg rounded-xl p-8 mb-8 text-center border border-gray-100">
                <h5 className="text-2xl font-semibold text-gray-700 mb-2">Group Balance</h5>
                <p className="text-gray-500 mb-6">Calculates the minimum transactions needed.</p>
                
                <button 
                    onClick={handleSettleUp} 
                    disabled={loading}
                    className={`px-6 py-3 rounded-lg text-white font-medium transition-all 
                        ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 shadow-md'}`}
                >
                    {loading ? "Calculating..." : "Settle Up Now"}
                </button>
            </div>

            {transactions.length > 0 && (
                <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                    <div className="bg-green-600 px-6 py-4">
                        <h3 className="text-white font-bold">Optimized Settlement Plan</h3>
                    </div>
                    <ul className="divide-y divide-gray-100">
                        {transactions.map((t, index) => (
                            <li key={index} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
                                <div className="text-gray-700">
                                    <span className="font-semibold text-gray-900">User {t.payerId}</span> 
                                    <span className="mx-2 text-gray-400">⟶</span> 
                                    pays 
                                    <span className="mx-2 font-semibold text-gray-900">User {t.payeeId}</span>
                                </div>
                                <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
                                    ${t.amount.toFixed(2)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Dashboard;