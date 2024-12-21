import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/users/rememberUser', {
                credentials: 'include',
            });

            const data = await response.json();
            if (!data) {
                navigate('/login');
                return;
            }

            setUser(data);
        } catch (error) {
            console.error('Error:', error);
            navigate('/login');
        }
    };

    fetchUserInfo();
}, [navigate]);

const handleLogout = async () => {
    try {
        await fetch('http://localhost:5001/api/users/logout', {
            method: 'POST',
            credentials: 'include'
        });
        // Only navigate after successful logout
        navigate('/login');
    } catch (error) {
        console.error('Logout failed:', error);
    }
};



  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        {user && (
          <div>
            <p>Welcome, {user.username}!</p>
            <p>Email: {user.email}</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;