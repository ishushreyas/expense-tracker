import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Loader,
  Users,
  PlusCircle,
  Trash2,
  User,
  X,
} from "lucide-react";
import AddTransactionForm from "./AddTransactionForm";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ErrorNotification from "./ErrorNotification";
import SummaryTab from "./SummaryTab";
import Tabs from "./Tabs";
import TransactionList from "./TransactionList";
import UsersTab from "./UsersTab";
import TransactionDetails from "./TransactionDetails"; 

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

  const API_BASE_URL = "/api";

  // Utility function for API requests
  const apiRequest = async (url, options = {}) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error("API Request Error:", err);
      throw err;
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await apiRequest(`${API_BASE_URL}/users`);
      setUsers(data || []);
    } catch (err) {
      setError(`Failed to fetch users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const transactionData = await apiRequest(`${API_BASE_URL}/transactions`);
      const userMap = users.reduce(
        (acc, user) => ({ ...acc, [user.id]: user.name }),
        {}
      );
      const enrichedTransactions = (transactionData?.transactions || []).map(
        (txn) => ({
          ...txn,
          payer_name: userMap[txn.payer_id] || "Unknown User",
          members_name: txn.members.map((id) => userMap[id] || "Unknown User"),
        })
      );
      setTransactions(enrichedTransactions);
    } catch (err) {
      setError(`Failed to fetch transactions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const data = await apiRequest(`${API_BASE_URL}/summary`);
      setSummary(data || {});
    } catch (err) {
      setError(`Failed to fetch summary: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (newUser.trim().length < 2) {
      setError("Name must be at least 2 characters long");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await apiRequest(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newUser.trim() }),
      });
      setUsers((prev) => [...prev, data]);
      setNewUser("");
    } catch (err) {
      setError(`Failed to add user: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

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

  const handleDeleteUser = async (userId) => {
    setLoading(true);
    try {
      await apiRequest(`${API_BASE_URL}/users/${userId}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (err) {
      setError(`Failed to delete user: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTransaction = async (updatedTransaction) => {
  setLoading(true);
  try {
    // Send the updated transaction to the backend
    const data = await apiRequest(`${API_BASE_URL}/transactions/${updatedTransaction.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
	id: updatedTransaction.id,
        payer_id: updatedTransaction.payer_id,
        amount: updatedTransaction.amount,
        members: updatedTransaction.members,
        remark: updatedTransaction.remark,
      }),
    });

    // Update the transactions state with the new details
    setTransactions((prev) =>
      prev.map((txn) =>
        txn.id === updatedTransaction.id ? { ...txn, ...data } : txn
      )
    );

    // Close the transaction details view after editing
    setSelectedTransaction(null);
  } catch (err) {
    setError(`Failed to update transaction: ${err.message}`);
  } finally {
    setLoading(false);
  }
};

  const handleDeleteTransaction = async (transactionId) => {
    setLoading(true);
    try {
      await apiRequest(`${API_BASE_URL}/transactions/${transactionId}/soft-delete`, {
        method: "DELETE",
      });
      setTransactions((prev) => prev.filter((txn) => txn.id !== transactionId));
      setConfirmDelete({ id: null, show: false });
    } catch (err) {
      setError(`Failed to delete transaction: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionClose = () => setSelectedTransaction(null);

  useEffect(() => {
    fetchUsers();
    fetchSummary();
  }, []);

  useEffect(() => {
    if (users.length) fetchTransactions();
  }, [users]);

  return (
    <div className="min-h-screen py-6">
      {error && <ErrorNotification error={error} setError={setError} />}
      <DeleteConfirmationModal
        show={confirmDelete.show}
        onClose={() => setConfirmDelete({ id: null, show: false })}
        onConfirm={() => handleDeleteTransaction(confirmDelete.id)}
      />
      <div className="w-full rounded max-w-4xl mx-auto">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === "summary" && <SummaryTab users={users} summary={summary} />}
        {activeTab === "transactions" && (
          <TransactionList
            transactions={transactions}
            setSelectedTransaction={setSelectedTransaction}
            setConfirmDelete={setConfirmDelete}
            loading={loading}
	    error={error}
          />
        )}
        {selectedTransaction && (
          <TransactionDetails
            transaction={selectedTransaction}
            onClose={handleTransactionClose}
            onEditTransaction={handleEditTransaction}
            users={users}
          />
        )}
        {activeTab === "add-transaction" && (
          <AddTransactionForm
            users={users}
            newTransaction={newTransaction}
            setNewTransaction={setNewTransaction}
            handleAddTransaction={handleAddTransaction}
          />
        )}
        {activeTab === "users" && (
          <UsersTab
            users={users}
            onAddUser={handleAddUser}
            onDeleteUser={handleDeleteUser}
          />
        )}
      </div>
        {loading && (
  <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
    <Loader className="animate-spin h-16 w-16 text-gray-500" />
  </div>
)}
    </div>
  );
}

export default ExpenseTracker;
