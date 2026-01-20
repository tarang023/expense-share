import { useEffect, useState } from "react";
import { createGroup, getAllGroups, addMemberToGroup } from "../services/api";
import { Link } from "react-router-dom";

const GroupManager = () => {
    const [groups, setGroups] = useState([]);
    const [newGroupName, setNewGroupName] = useState("");
    const [joinUserId, setJoinUserId] = useState("");
    
    // Refresh list on load
    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        const data = await getAllGroups();
        setGroups(data);
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName) return;
        await createGroup(newGroupName);
        setNewGroupName("");
        loadGroups(); // Refresh list
    };

    const handleJoinGroup = async (groupId) => {
        if (!joinUserId) {
            alert("Please enter a User ID first!");
            return;
        }
        try {
            await addMemberToGroup(groupId, joinUserId);
            alert(`User ${joinUserId} added to group!`);
        } catch (error) {
            alert("Error joining group (User ID might be wrong)");
        }
    };

    return (
        <div className="container mx-auto mt-10 p-4 max-w-4xl">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Groups</h1>

            {/* Create Group Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <h2 className="text-lg font-semibold mb-4">Create a New Trip / Group</h2>
                <form onSubmit={handleCreateGroup} className="flex gap-4">
                    <input 
                        type="text" 
                        placeholder="Group Name (e.g. Manali Trip)" 
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                    />
                    <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium">
                        Create
                    </button>
                </form>
            </div>

            {/* List Groups */}
            <div className="grid gap-4 md:grid-cols-2">
                {groups.map(group => (
                    <div key={group.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{group.name}</h3>
                                <span className="text-xs text-gray-400 uppercase tracking-wider">Group ID: {group.id}</span>
                            </div>
                            <Link to={`/dashboard/${group.id}`} className="text-blue-600 hover:underline text-sm font-medium">
                                Open Dashboard &rarr;
                            </Link>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <label className="text-xs text-gray-500 font-semibold uppercase">Add Member</label>
                            <div className="flex gap-2 mt-2">
                                <input 
                                    type="number" 
                                    placeholder="User ID" 
                                    className="w-24 px-3 py-1 border rounded text-sm"
                                    onChange={(e) => setJoinUserId(e.target.value)}
                                />
                                <button 
                                    onClick={() => handleJoinGroup(group.id)}
                                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
                                >
                                    Join
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroupManager;