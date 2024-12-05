function DeleteConfirmationModal({ show, onClose, onConfirm }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-96 transform transition-all hover:scale-105">
        <h2 className="text-lg font-semibold text-gray-800">Confirm Delete</h2>
        <p className="text-sm text-gray-500 mb-4">Are you sure you want to delete this item?</p>
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
            Cancel
          </button>
          <button onClick={onConfirm} className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationModal;
