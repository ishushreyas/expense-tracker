import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Users,
  PlusCircle,
  CheckCircle2,
  Trash2,
  User,
  X
} from "lucide-react";
import AddTransactionForm from "./AddTransactionForm";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ErrorNotification from "./ErrorNotification";
import SummaryTab from "./SummaryTab";
import Tabs from "./Tabs";
import TransactionList from "./TransactionList";

function ExpenseTracker() {
  const [activeTab, setActiveTab] = useState("summary");
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({});
  const [newUser, setNewUser] = useState("");
  const [newTransaction, setNewTransaction] = useState({
    payerId: "",
    amount: "",
    members: [],
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ id: null, show: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = "http://192.0.0.2:3000/api";

  // Improved Error Handling Function
  const handleApiError = (errorMessage, context) => {
    console.error(`${context}: ${errorMessage}`);
    setError(errorMessage);
    setLoading(false);
  };

  // Fetch Users with Improved Error Handling
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data || []);
    } catch (err) {
      handleApiError(err.message, "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Fetch User by Id with Improved Handling
  const fetchUserById = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.name || 'Unknown User';
    } catch (err) {
      handleApiError(err.message, "Failed to fetch user");
      return 'Unknown User';
    }
  };

  // Fetch Transactions with Improved Error Handling
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Add user names to transactions
      const enrichedTransactions = await Promise.all(
        data.transactions.map(async (txn) => {
          // Fetch the payer's name
          const payerName = await fetchUserById(txn.payer_id);

          // Fetch the member names from member IDs
          const memberNames = await Promise.all(
            txn.members.map(async (memberId) => await fetchUserById(memberId))
          );

          return {
            ...txn,
            payer_name: payerName,
            members: memberNames, // Replace IDs with names
          };
        })
      );

      setTransactions(enrichedTransactions || []);
    } catch (err) {
      handleApiError(err.message, "Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/summary`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSummary(data || {});
    } catch (err) {
      handleApiError(err.message, "Failed to fetch summary");
    } finally {
      setLoading(false);
    }
  };

  // Delete User Handler
  const handleDeleteUser = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setUsers(users.filter((user) => user.id !== userId));
        setError(""); // Clear any previous errors
      } else {
        const errorData = await response.json();
        handleApiError(errorData.message || "Failed to delete user", "Delete User");
      }
    } catch (err) {
      handleApiError(err.message, "Error deleting user");
    } finally {
      setLoading(false);
    }
  };

  // Delete Transaction Handler
  const handleDeleteTransaction = async (transactionId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setTransactions(transactions.filter((txn) => txn.id !== transactionId));
        setConfirmDelete({ id: null, show: false });
        setError(""); // Clear any previous errors
      } else {
        const errorData = await response.json();
        handleApiError(errorData.message || "Failed to delete transaction", "Delete Transaction");
      }
    } catch (err) {
      handleApiError(err.message, "Error deleting transaction");
    } finally {
      setLoading(false);
    }
  };

  // Add User Handler
  const handleAddUser = async (e) => {
    e.preventDefault();
    setError("");
    if (newUser.trim().length < 2) {
      setError("Name must be at least 2 characters long");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newUser.trim() }),
      });
      if (response.ok) {
        const data = await response.json();
        setUsers([...users, data]);
        setNewUser("");
      } else {
        const errorData = await response.json();
        handleApiError(errorData.message || "Failed to add user", "Add User");
      }
    } catch (err) {
      handleApiError(err.message, "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  // Add Transaction Handler
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setError("");
    if (!newTransaction.payerId) {
      setError("Please select a payer");
      return;
    }
    const amount = parseFloat(newTransaction.amount);
    if (isNaN(amount) || amount <= 0) {
      setError("Amount must be a positive number");
      return;
    }
    if (newTransaction.members.length === 0) {
      setError("Select at least one member");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payer_id: newTransaction.payerId,
          amount,
          members: newTransaction.members,
          remark: newTransaction.remark,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions([...transactions, data]);
        setNewTransaction({ payerId: "", amount: "", members: [] });
      } else {
        const errorData = await response.json();
        handleApiError(errorData.message || "Failed to add transaction", "Add Transaction");
      }
    } catch (err) {
      handleApiError(err.message, "Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchUsers();
    fetchTransactions();
    fetchSummary();
  }, []);

	return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      {/* Error Notification */}
	<ErrorNotification 
		error={error}
		setError={setError} />
	
      {/* Delete Confirmation Modal */}
	<DeleteConfirmationModal 
	      show={confirmDelete.show}
		onClose={() => setConfirmDelete({ id: null    , show: false })}
		onConfirm={() => handleDeleteTransaction(confirmDelete.id)}
		/>

      {/* Main Container */}
      <div className="w-full max-w-4xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-200 mb-20 md:mb-0">
        {/* Navigation Tabs */}
	<Tabs activeTab={activeTab}
		setActiveTab={setActiveTab}
		/>

        {/* Summary Tab */}
        {activeTab === "summary" && (
          <div className="p-6">
            <SummaryTab users={users} summary={summary} /> 
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div className="p-6">
            <TransactionList
              transactions={transactions}
              setSelectedTransaction={setSelectedTransaction}
              setConfirmDelete={setConfirmDelete}
              loading={loading}
            />
          </div>
        )}
		{/* Add Transaction Tab*/}
		{activeTab === "add-transaction" && (
		<div className="p-6">
            <AddTransactionForm
              users={users}
              newTransaction={newTransaction}
              setNewTransaction={setNewTransaction}
              handleAddTransaction={handleAddTransaction}
              error={error}
            />
			</div>
		)}
		{/* Transaction Details Modal */}
            {selectedTransaction && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-2xl w-96 max-w-full">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">Transaction Details</h3>
                  <div className="space-y-2">
                    <p><strong>Payer:</strong> {selectedTransaction.payer_name}</p>
                    <p><strong>Amount:</strong> ₹{selectedTransaction.amount}</p>
		    <p>
		    <strong>Time:</strong>{" "}
		            {new Date(selectedTransaction.created_at).toLocaleString('en-US', {
	year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
        })}
		    </p>
                    <p>
                      <strong>Split Among:</strong>{" "}
                      {selectedTransaction.members.join(", ")}
                    </p>
		    <p>
		    <strong>Remark:</strong>{" "}
		    {selectedTransaction.remark}
		    </p>
                  </div>
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="mt-4 w-full bg-black text-white p-2 rounded-lg hover:bg-gray-800 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

                {/* Users Tab (with balances) */}
        {activeTab === "users" && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Users</h2>
            {loading ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : users.length === 0 ? (
              <p className="text-gray-500 text-center">No users yet</p>
            ) : (
              <ul className="space-y-2">
                {users.map((user) => {
                  const userBalance = summary.user_balances?.[user.id] || 0;
                  return (
                    <li
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center space-x-2">
                        <User className="text-gray-600" />
                        <span className="text-gray-800 font-medium">{user.name}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`font-semibold ${userBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{userBalance.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-500 hover:text-red-700 transition flex items-center"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Add User Form */}
            <form
              onSubmit={handleAddUser}
              className="mt-6 bg-gray-50 p-4 rounded-lg shadow-md flex space-x-2"
            >
              <input
                type="text"
                placeholder="Add new user name"
                value={newUser}
                onChange={(e) => setNewUser(e.target.value)}
                className="flex-grow p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
              <button
                type="submit"
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition flex items-center"
              >
                <PlusCircle className="mr-2" /> Add User
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-700"></div>
        </div>
      )}
    </div>
  );
}

export default ExpenseTracker;
