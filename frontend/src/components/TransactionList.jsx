// TransactionList.js
import React from "react";
import { Trash2 } from "lucide-react";

const TransactionList = ({ transactions, setSelectedTransaction, setConfirmDelete, loading }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Transaction History</h3>
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : transactions.length === 0 ? (
        <p className="text-gray-500 text-center">No transactions yet</p>
      ) : (
        <ul className="space-y-2">
          {transactions.map((txn) => (
            <li
              key={txn.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800">₹{txn.amount}</span>
                <span className="text-sm text-gray-600">
                  Payer: {txn.payer_name || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedTransaction(txn)}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  View
                </button>
                <Trash2
                  onClick={() => setConfirmDelete({ id: txn.id, show: true })}
                  className="text-red-500 hover:text-red-700 cursor-pointer transition"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TransactionList;
