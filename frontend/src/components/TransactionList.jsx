import React, { useState } from "react";
import { Trash2, FileEdit, AlertTriangle, Plus, X, Send, Download } from "lucide-react";

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

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 bg-red-900 rounded-2xl">
        <AlertTriangle className="text-red-300 mr-4" size={32} />
        <span className="text-red-100 text-xl font-bold">{error}</span>
      </div>
    );
  }

  return (
    <div className="relative bg-gray-900 rounded-3xl shadow-2xl border border-gray-800 overflow-hidden">
      <div className="bg-black border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8 mr-3 text-white" 
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
          className="bg-blue-600 text-white rounded-2xl px-6 py-4 shadow-lg hover:bg-blue-700 transition-all duration-300 flex items-center space-x-3 text-lg font-semibold"
          onClick={() => setIsAddDialogOpen(true)}
          aria-label="Add Transaction"
        >
          <Plus size={28} />
          <span className="hidden md:inline">Add Transaction</span>
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400 p-6">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-20 w-20 mb-4 opacity-50 text-gray-600" 
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
          <p className="text-gray-400 text-center text-xl font-medium">No transactions recorded</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-800">
          {transactions.map((txn) => (
            <li
              key={txn.id}
              className="px-6 py-4 hover:bg-gray-800 transition-colors duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-white">
                    {formatAmount(txn.amount)}
                  </span>
                  <span className="text-lg text-gray-400 mt-2">
                    Payer: {truncateName(txn.payer_name)}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    className="text-gray-400 hover:text-blue-400 transition-all p-3 rounded-full hover:bg-blue-900/50"
                    onClick={() => setSelectedTransaction(txn)}
                    aria-label="Edit Transaction"
                  >
                    <FileEdit size={24} />
                  </button>
                  <button
                    className="text-gray-400 hover:text-red-400 transition-all p-3 rounded-full hover:bg-red-900/50"
                    onClick={() => setConfirmDelete({ id: txn.id, show: true })}
                    aria-label="Delete Transaction"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-6">
          <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-auto border border-gray-800">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h2 className="text-2xl font-bold text-white">Add Transaction</h2>
              <button
                onClick={() => setIsAddDialogOpen(false)}
                className="text-gray-400 hover:text-gray-200 p-2"
              >
                <X size={28} />
              </button>
            </div>
            <AddTransactionForm
              users={users} 
              newTransaction={newTransaction} 
              setNewTransaction={setNewTransaction}
              handleAddTransaction={handleAddTransaction}      
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;