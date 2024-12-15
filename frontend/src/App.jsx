import { useEffect, useState } from 'react';
import ExpenseTracker from './components/ExpenseTracker';
import Login from './components/Login';

const [isLoggedIn, setIsLoggedIn] = useState(false);

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

 useEffect(() => {
    checkLoginStatus();
  }, []);

function App() {

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
