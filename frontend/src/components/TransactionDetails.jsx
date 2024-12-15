import React, { useState } from "react";
import { X, Save, Edit3, AlertTriangle, BadgeCheck } from "lucide-react";

const TransactionDetails = ({
  transaction,
  onClose,
  onEditTransaction,
  users,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTransaction, setEditedTransaction] = useState(transaction);
  const [errors, setErrors] = useState({});

  const validateTransaction = () => {
    const newErrors = {};
    if (!editedTransaction.payer_id) {
      newErrors.payer = "Please select a payer";
    }
    if (!editedTransaction.amount || editedTransaction.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
    if (editedTransaction.members.length === 0) {
      newErrors.members = "Select at least one member";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditedTransaction(transaction);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTransaction((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) : value,
    }));
    // Clear specific error when user starts fixing it
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleMemberChange = (memberId) => {
    setEditedTransaction((prev) => {
      const isSelected = prev.members.includes(memberId);
      const newMembers = isSelected
        ? prev.members.filter((id) => id !== memberId)
        : [...prev.members, memberId];
      
      // Clear members error if at least one is selected
      if (newMembers.length > 0 && errors.members) {
        setErrors((prev) => ({ ...prev, members: undefined }));
      }
      
      return { ...prev, members: newMembers };
    });
  };

  const handleSave = () => {
    if (validateTransaction()) {
      onEditTransaction(editedTransaction);
      setIsEditing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden">
        {/* Header */}
        <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-b">
          <h3 className="text-2xl font-bold text-gray-800">
            {isEditing ? "Edit Transaction" : "Transaction Details"}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-600 hover:text-red-500 transition-colors rounded-full p-2 hover:bg-red-50"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Payer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payer
            </label>
            {isEditing ? (
              <>
                <select
                  name="payer_id"
                  value={editedTransaction.payer_id || ""}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg p-2 ${
                    errors.payer 
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
                      : "border-gray-300"
                  }`}
                >
                  <option value="">Select Payer</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))}
                </select>
                {errors.payer && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertTriangle className="mr-1" size={16} /> {errors.payer}
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-800 font-semibold">{transaction.payer_name}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            {isEditing ? (
              <>
                <input
                  type="number"
                  name="amount"
                  value={editedTransaction.amount || ""}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg p-2 ${
                    errors.amount 
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
                      : "border-gray-300"
                  }`}
                  min="0"
                  step="0.01"
                />
                {errors.amount && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertTriangle className="mr-1" size={16} /> {errors.amount}
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-800 font-semibold">
                {formatCurrency(transaction.amount)}
              </p>
            )}
          </div>

          {/* Members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Split Among
            </label>
            {isEditing ? (
              <>
                <div className="flex flex-wrap gap-2">
            {users.map((user) => {
              return (
                <div
                  key={user.id}
                  onClick={() => handleMemberChange(user.id)}
                  className={`
                    flex items-center p-2 rounded-lg cursor-pointer
                    transition-all duration-200
                    ${
                      isSelected
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }
                  `}
                >
                  {user.username}
                  ${
                      isSelected
                        ? <BadgeCheck className="text-green-500" size={20} />
                        : ""
                    }
                </div>
              );
            })}
          </div>
                {errors.members && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertTriangle className="mr-1" size={16} /> {errors.members}
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-800 font-semibold">
                {transaction.members_name.join(", ")}
              </p>
            )}
          </div>

          {/* Remark */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remark
            </label>
            {isEditing ? (
              <textarea
                name="remark"
                value={editedTransaction.remark || ""}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-2"
                rows={3}
              />
            ) : (
              <p className="text-gray-800 font-semibold">
                {transaction.remark || "No remarks"}
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <p className="text-gray-800 font-semibold">
              {formatDate(transaction.created_at)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-100 px-6 py-4 flex justify-end space-x-3 border-t">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex items-center bg-black text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                <Save className="mr-2" />
                Save Changes
              </button>
              <button
                onClick={handleEditToggle}
                className="flex items-center bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleEditToggle}
              className="flex items-center bg-black text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Edit3 className="mr-2" />
              Edit Transaction
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;
