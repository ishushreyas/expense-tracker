import React, { useState } from 'react';
import { UserCircle2, Check } from 'lucide-react';

const PayerSelect = ({ 
  users, 
  newTransaction, 
  setNewTransaction 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (userId) => {
    setNewTransaction({
      ...newTransaction, 
      payerId: userId
    });
    setIsOpen(false);
  };

  const selectedUser = users.find(user => user.id === newTransaction.payerId);

  return (
    <div className="relative w-full">
      <label className="flex items-center text-gray-700 font-medium mb-2">
        <UserCircle2 className="mr-2 text-gray-500" size={20} />
        Payer
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 pl-10 pr-10 border border-gray-300 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                     text-left flex items-center justify-between"
        >
          <div className="flex items-center">
            <UserCircle2 className="mr-2 text-gray-500" size={20} />
            {selectedUser ? selectedUser.username : 'Select Payer'}
          </div>
          <svg 
            className="h-5 w-5 text-gray-400" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>

        {isOpen && (
          <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {users.map((user) => (
              <li 
                key={user.id}
                onClick={() => handleSelect(user.id)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
              >
                <span>{user.username}</span>
                {newTransaction.payer_id === user.id && (
                  <Check className="text-green-500" size={20} />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PayerSelect;
