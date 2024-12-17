import { useEffect, useState } from 'react';
import ExpenseTracker from './components/ExpenseTracker';
import Login from './components/Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkLoginStatus = async () => {
    try {
      const response = await fetch('/api/check-login', {
        method: "GET",
      });

      if (response.ok) { // Check if the response status is in the 200-299 range
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false); // In case of non-2xx response
      }
    } catch (error) {
      console.error("Error checking login status:", error);
      setIsLoggedIn(false); // Handle fetch error
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  return (
    <>
      {isLoggedIn ? (
        <ExpenseTracker />
      ) : (
        <Login setIsLoggedIn={setIsLoggedIn} />
      )}
    </>
  );
}

export default App;