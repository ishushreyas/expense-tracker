import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Wallet, TrendingUp, User } from 'lucide-react';

function SummaryTab({ summary, users }) {
  const userBalanceData = Object.entries(summary.user_balances || {}).map(([userId, balance]) => {
    const user = users.find((u) => u.id === userId);
    return {
      id: userId,
      name: user?.name || "Unknown",
      balance: balance,
      email: user?.email || "N/A"
    };
  });

  return (
    <div className="p-6 bg-white">
      <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
        <Wallet className="mr-3 text-black" /> Expense Summary
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-100 p-5 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="mr-2 text-green-600" /> Total Expenses
          </h3>
          <p className="text-3xl font-bold text-black">
            ₹{summary.total_expenses?.toFixed(2) || "0.00"}
          </p>
        </div>
        
        <div className="bg-gray-100 p-5 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <User className="mr-2 text-blue-600" /> User Balances
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={userBalanceData}>
              <XAxis dataKey="name" tick={{fill: 'black'}} />
              <YAxis tick={{fill: 'black'}} />
              <Tooltip 
                contentStyle={{backgroundColor: 'white', color: 'black', border: '1px solid black'}}
                formatter={(value, name, props) => {
                  const userDetail = userBalanceData.find(u => u.id === props.payload.id);
                  return [
                    `₹${value}`, 
                    `${userDetail.name} (${userDetail.email})`
                  ];
                }}
                cursor={{fill: 'rgba(0,0,0,0.1)'}}
              />
              <Bar dataKey="balance" barSize={40} radius={[4, 4, 0, 0]}>
                {userBalanceData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.balance >= 0 ? '#10B981' : '#EF4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 bg-gray-100 p-5 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-black">User Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userBalanceData.map((user) => (
            <div 
              key={user.id} 
              className={`p-4 rounded-lg ${user.balance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}
            >
              <div className="flex items-center mb-2">
                <User className="mr-2 text-black" />
                <span className="font-semibold text-black">{user.name}</span>
              </div>
              <div className="text-sm text-gray-600">{user.email}</div>
              <div className={`mt-2 font-bold ${user.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                Balance: ₹{user.balance.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SummaryTab;