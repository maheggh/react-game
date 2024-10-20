import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const ScoreScreen = () => {
  const { user } = useContext(AuthContext); // Load user data from context
  const [money, setMoney] = useState(0);
  const [rank, setRank] = useState('Homeless Potato');
  const [inventory, setInventory] = useState([]);
  const [missions, setMissions] = useState(0);
  const [bossItems, setBossItems] = useState([]);

  // Fetch user data once when component mounts
  useEffect(() => {
    if (user) {
      setMoney(user.money || 0);
      setRank(user.rank || 'Homeless Potato');
      setInventory(user.inventory || []);
      setBossItems(user.bossItems || []);
      setMissions(user.missionsCompleted || 0);
    }
  }, [user]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-6 text-yellow-500">Your Score</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Money & Rank */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Money & Rank</h2>
          <div className="flex items-center justify-between mb-4">
            <p className="text-lg">💰 Money:</p>
            <p className="text-2xl font-bold">${money.toLocaleString()}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-lg">🔰 Rank:</p>
            <p className="text-2xl font-bold">{rank}</p>
          </div>
        </div>

        {/* Weapons Inventory Section */}
        <div className="bg-gradient-to-br from-green-600 to-green-800 text-white rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Weapons Inventory</h2>
          <ul className="space-y-2">
            {inventory.length > 0 ? (
              inventory
                .filter((item) => item.type === 'weapon') // Filter out weapons
                .map((item, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{item.name}</span>
                    <span>🎯 {item.accuracy}%</span>
                  </li>
                ))
            ) : (
              <li>No weapons in your inventory.</li>
            )}
          </ul>
        </div>

        {/* Boss Items Section */}
        <div className="bg-gradient-to-br from-red-600 to-red-800 text-white rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Boss Items</h2>
          <ul className="space-y-2">
            {bossItems.length > 0 ? (
              bossItems.map((item, index) => (
                <li key={index} className="flex justify-between">
                  <span>{item.name}</span>
                </li>
              ))
            ) : (
              <li>No boss items collected.</li>
            )}
          </ul>
        </div>

        {/* Missions Completed */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Missions Completed</h2>
          <p className="text-2xl font-bold text-center">{missions}</p>
          <p className="text-center">Assassinations, heists, and more!</p>
        </div>
      </div>
    </div>
  );
};

export default ScoreScreen;
