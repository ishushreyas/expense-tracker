import React from "react";
import { Trash2, NotebookTabs, AlertCircle } from "lucide-react";

const TransactionList = ({ 
  transactions, 
  setSelectedTransaction, 
  setConfirmDelete, 
  loading,
  error 
}) => {
  // Format amount with commas for better readability
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Truncate long names
  const truncateName = (name, maxLength = 15) => {
    return name && name.length > maxLength 
      ? `${name.slice(0, maxLength)}...`
      : name || "Unknown";
  };

  // Render error state
  if (error) {
    return (
      <div className="flex items-center justify-center p-6 bg-red-50 rounded-lg">
        <AlertCircle className="text-red-500 mr-2" size={24} />
        <span className="text-red-600 font-medium">{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
      <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
        Transaction History
      </h3>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-500"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 mb-2 opacity-50" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" 
            />
          </svg>
          <p className="text-gray-500 text-center">No transactions recorded</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {transactions.map((txn) => (
            <li
              key={txn.id}
              className="py-3 px-2 hover:bg-gray-50 transition-colors duration-200 rounded-lg group"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800 text-base">
                    {formatAmount(txn.amount)}
                  </span>
                  <span className="text-sm text-gray-500">
                    Payer: {truncateName(txn.payer_name)}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    className="text-gray-400 hover:text-blue-500 transition-colors p-1 rounded-full hover:bg-blue-50"
                    onClick={() => setSelectedTransaction(txn)}
                    aria-label="Edit Transaction"
                  >
                    <NotebookTabs size={20} />
                  </button>
                  <button
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
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
    </div>
  );
};

TransactionList.defaultProps = {
  transactions: [],
  loading: false,
  error: null
};

export default TransactionList;
