import React, { useState } from "react";
import { Trash2, PlusCircle } from "lucide-react";

const UsersTab = ({ users, onAddUser, onDeleteUser, loading }) => {
  const [newUserName, setNewUserName] = useState("");

  const handleAddUser = (e) => {
    e.preventDefault();
    if (newUserName.trim().length < 2) {
      alert("User name must be at least 2 characters long.");
      return;
    }
    onAddUser(newUserName);
    setNewUserName("");
  };

  return (
    <div className="p-4">
      {/* User List */}
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        {users.length > 0 ? (
          <ul className="space-y-4">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm"
              >
                <span className="text-gray-800 font-medium">{user.name}</span>
		    {/*  <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => onDeleteUser(user.id)}
                  disabled={loading}
                >
                  <Trash2 />
                </button> */}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No users added yet.</p>
        )}
    </div>
  );
};

export default UsersTab;
