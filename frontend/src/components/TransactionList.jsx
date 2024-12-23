import React, { useState } from "react";
import { Trash2, FileEdit, AlertTriangle, Plus, X, Send, Download } from "lucide-react";
import AddTransactionForm from "./AddTransactionForm";

const TransactionList = ({ 
  users,
  newTransaction,
  setNewTransaction,
  handleAddTransaction,
  transactions, 
  setSelectedTransaction, 
  setConfirmDelete, 
  loading,
  error,
  onAddTransaction,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Previous helper methods remain the same
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const truncateName = (name, maxLength = 15) => {
    return name && name.length > maxLength 
      ? `${name.slice(0, maxLength)}...`
      : name || "Unknown";
  };

  // Error state rendering
  if (error) {
    return (
      <div className="flex items-center justify-center p-6 bg-red-50 rounded-lg">
        <AlertTriangle className="text-red-500 mr-2" size={24} />
        <span className="text-red-600 font-medium">{error}</span>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 mr-2 text-black" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0z" 
            />
          </svg>
          Transaction History
        </h3>
          <button 
            className="bg-black text-white rounded-xl p-3 shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2"
            onClick={() => setIsAddDialogOpen(true)}
            aria-label="Add Transaction"
          >
            <Plus size={24} />
            <span className="hidden md:inline">Add Transaction</span>
          </button>
      </div>
      
      {/* Rest of the existing rendering logic remains the same */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400 p-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 mb-4 opacity-50 text-gray-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
            />
          </svg>
          <p className="text-gray-500 text-center font-medium">No transactions recorded</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 sm:mb-8">
          {transactions.map((txn) => (
            <li
              key={txn.id}
              className="px-4 py-3 hover:bg-gray-50 transition-colors duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className={`font-bold text-black`}>
                    {formatAmount(txn.amount)}
                  </span>
                  <span className="text-sm text-gray-500 mt-1">
                    Payer: {truncateName(txn.payer_name)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="text-gray-400 hover:text-blue-600 transition-all p-2 rounded-full hover:bg-blue-50"
                    onClick={() => setSelectedTransaction(txn)}
                    aria-label="Edit Transaction"
                  >
                    <FileEdit size={20} />
                  </button>
                  <button
                    className="text-gray-400 hover:text-red-600 transition-all p-2 rounded-full hover:bg-red-50"
                    onClick={() => setConfirmDelete({ id: txn.id, show: true })}
                    aria-label="Delete Transaction"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add Transaction Dialog */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Add Transaction</h2>
              <button
                onClick={() => setIsAddDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <AddTransactionForm
              users={users} 
              newTransaction={newTransaction} 
              setNewTransaction={setNewTransaction}
              handl
eAddTransaction={handleAddTransaction}      
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
