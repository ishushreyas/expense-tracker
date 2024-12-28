import React, { useEffect } from "react";
import { Pencil, CircleCheck } from "lucide-react";
import PayerSelect from "./PayerSelect";

const AddTransactionForm = ({
  users,
  newTransaction,
  setNewTransaction,
  error,
  selectedTransaction,
  setSelectedTransaction, 
}) => {
  // Pre-fill form with selected transaction details
  useEffect(() => {
    if (selectedTransaction) {
      setNewTransaction({
        amount: selectedTransaction.amount,
        payer: selectedTransaction.payer_id,
        members: selectedTransaction.members,
        remark: selectedTransaction.remark || "",
      });
    }
  }, [selectedTransaction, setNewTransaction]);
  
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!newTransaction.payerId || newTransaction.members.length === 0) {
      setError("Please select a payer and at least one member.");
      return;
    }
    const amount = parseFloat(newTransaction.amount);
    if (isNaN(amount) || amount <= 0) {
      setError("Amount must be a positive number.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await apiRequest(`${API_BASE_URL}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payer_id: newTransaction.payerId,
          amount,
          members: newTransaction.members,
          remark: newTransaction.remark,
        }),
      });
      setTransactions((prev) => [...prev, data]);
      setNewTransaction({ payerId: "", amount: "", members: [] });
    } catch (err) {
      setError(`Failed to add transaction: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };


  // Handle form reset for editing
  const handleFormReset = () => {
    setNewTransaction({
      amount: "",
      payer: "",
      members: [],
      remark: "",
    });
    setSelectedTransaction(null); // Clear selected transaction
  };

  return (
    <form
      onSubmit={handleAddTransaction}
      className="mt-6 bg-gray-50 p-4 rounded-lg shadow-md"
    >
      <div className="space-y-4">
        {/* Payer Select */}
        <PayerSelect
          users={users}
          newTransaction={newTransaction}
          setNewTransaction={setNewTransaction}
        />

        {/* Amount Input */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Amount</label>
          <input
            type="number"
            value={newTransaction.amount}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, amount: e.target.value })
            }
            placeholder="Enter amount"
            min="0.01"
            step="0.01"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>

        {/* Members Selection */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Split Among
          </label>
          <div className="flex flex-wrap gap-2">
            {users.map((user) => {
              const isSelected = newTransaction.members.includes(user.id);
              return (
                <div
                  key={user.id}
                  onClick={() =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      members: isSelected
                        ? prev.members.filter((id) => id !== user.id)
                        : [...prev.members, user.id],
                    }))
                  }
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
                  {
                      isSelected
                        ? <CircleCheck className="text-white" size={20} />
                        : ""
                    }
                </div>
              );
            })}
          </div>
        </div>

        {/* Remark Section */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Remark</label>
          <div className="relative">
            <input
              type="text"
              value={newTransaction.remark}
              onChange={(e) =>
                setNewTransaction({ ...newTransaction, remark: e.target.value })
              }
              placeholder="Add a remark (optional)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
            <Pencil className="absolute top-3 right-3 text-gray-400" size={20} />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition"
        >
          {selectedTransaction ? "Update Transaction" : "Add Transaction"}
        </button>

        {/* Reset Button (Visible during editing) */}
        {selectedTransaction && (
          <button
            type="button"
            onClick={handleFormReset}
            className="w-full mt-3 bg-gray-100 text-gray-800 p-3 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </form>
  );
};

export default AddTransactionForm;
