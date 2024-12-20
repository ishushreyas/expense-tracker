import { useEffect, useState } from 'react';
import ExpenseTracker from './components/ExpenseTracker';
import Login from './components/Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // State to hold logged-in user details

  const checkLoginStatus = async () => {
    try {
      const response = await fetch('/api/check-login', {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json(); // Assume API returns user data in JSON
        setIsLoggedIn(true);
        setUser(userData); // Save user data
      } else {
        setIsLoggedIn(false);
        setUser(null); // Clear user data on failed login
      }
    } catch (error) {
      console.error("Error checking login status:", error);
      setIsLoggedIn(false);
      setUser(null); // Clear user data on fetch error
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  return (
    <>
      {isLoggedIn ? (
        <ExpenseTracker user={user} /> // Pass user details to ExpenseTracker component
      ) : (
        <Login setIsLoggedIn={setIsLoggedIn} setUser={setUser} /> // Pass setUser to Login component
      )}
    </>
  );
}

export default App;
