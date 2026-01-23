import { useState } from "react";
import { addMemberToGroup } from "../../services/api"// Import the function we just made
import { Link } from "react-router-dom";

const GroupCard = ({ group }) => {
    // State to hold the username typed in THIS specific card
    const [usernameInput, setUsernameInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleAddMember = async () => {
        if (!usernameInput.trim()) return alert("Please enter a username");

        setIsLoading(true);
        try {
            // CALL THE API HERE
            await addMemberToGroup(group.id, usernameInput);
            
            alert(`Success! ${usernameInput} has been added to ${group.name}`);
            setUsernameInput(""); // Clear the input box on success
        } catch (error) {
            // Show the specific error from backend (e.g., "User not found")
            alert(`Error: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">{group.name}</h3>
                    <span className="text-xs text-gray-400">ID: {group.id}</span>
                </div>
                <Link to={`/dashboard/${group.id}`} className="text-blue-600 text-sm">
                    Open Dashboard &rarr;
                </Link>
            </div>

            {/* Members List (Optional - just to show current count) */}
            <div className="mb-4 text-sm text-gray-600">
                Members: {group.members ? group.members.length : 0}
            </div>

            {/* Add Member Section */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="text-xs text-gray-500 font-semibold uppercase">Add Member by Username</label>
                <div className="flex gap-2 mt-2">
                    <input 
                        type="text" 
                        placeholder="e.g. rahul123" 
                        className="w-full px-3 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={usernameInput} 
                        onChange={(e) => setUsernameInput(e.target.value)}
                    />
                    <button 
                        onClick={handleAddMember}
                        disabled={isLoading}
                        className="text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1 rounded font-medium disabled:opacity-50"
                    >
                        {isLoading ? "..." : "Add"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GroupCard;