import { useEffect, useState } from "react";
import { createGroup, getAllGroups } from "../services/api";
import GroupCard from "../components/groups/GroupCard";

const GroupManager = () => {
    const [groups, setGroups] = useState([]);
    const [newGroupName, setNewGroupName] = useState("");

    useEffect(() => { loadGroups(); }, []);

    const loadGroups = async () => {
        const data = await getAllGroups();
        setGroups(data);
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName) return;
        await createGroup(newGroupName);
        setNewGroupName("");
        loadGroups(); 
    };

    return (
        <div className="container mx-auto mt-10 p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Manage Groups</h1>

            {}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                 <form onSubmit={handleCreateGroup} className="flex gap-4">
                    <input 
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="New Group Name"
                        className="flex-1 px-4 py-2 border rounded-lg"
                    />
                    <button className="bg-indigo-600 text-white px-6 rounded-lg">Create</button>
                </form>
            </div>

            {}
            <div className="grid gap-4 md:grid-cols-2">
                {groups.map(group => (
                    
                    <GroupCard key={group.id} group={group} />
                ))}
            </div>
        </div>
    );
};

export default GroupManager;