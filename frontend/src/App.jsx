import { useEffect, useState } from 'react';
import ExpenseTracker from './components/ExpenseTracker';
import Login from './components/Login';

const checkLoginStatus = async () => {
  try {
    const response = await fetch('/api/check-login', {
	    method: "GET",
    }).then((response) => {
	    setIsLoggedIn(true);
    });
  } catch (error) {
  }
};

function App() {
const [isLoggedIn, setIsLoggedIn] = useState(false);

 useEffect(() => {
    checkLoginStatus();
  }, []);

  return (
    <>
     {isLoggedIn ? (
      <ExpenseTracker />
     ) : (
      <Login
        setIsLoggedIn={setIsLoggedIn} />
     )}
    </>
  )
}

export default App
