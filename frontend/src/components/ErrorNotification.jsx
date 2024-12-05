import {
	AlertCircle,
	X
} from "lucide-react";
function ErrorNotification({ error, clearError }) {
  if (!error) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-black text-white p-4 rounded-lg shadow-lg flex items-center">
      <AlertCircle className="mr-2" />
      {error}
      <button
	  onClick={() => setError("")}
        className="ml-4 p-1 rounded-full hover:bg-gray-700 transition"
        aria-label="Dismiss error notification"
      >
        <X size={20} />
      </button>
    </div>
  );
}

export default ErrorNotification;
