import { useEffect, useState } from 'react';
import ExpenseTracker from './components/ExpenseTracker';
import Login from './components/Login';

const checkLoginStatus = async () => {
  try {
    const response = await axios.get('/check-login', {
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
    });
    alert(response.data);
  } catch (error) {
    alert('Not logged in');
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
