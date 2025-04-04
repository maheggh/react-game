import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ScorePage = () => {
  const { user } = useContext(AuthContext);
  const [players, setPlayers] = useState([]);
  const [sortField, setSortField] = useState('crimesPerformed'); // Default sorting by kills (using crimesPerformed as placeholder)
  const [sortOrder, setSortOrder] = useState('desc');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch player data on mount
  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const response = await fetch('/api/players');
        const data = await response.json();
        if (data.success) {
          setPlayers(data.players);
        } else {
          setErrorMessage(data.message || 'Failed to fetch player data.');
        }
      } catch (error) {
        console.error('Error fetching player data:', error);
        setErrorMessage('Server error occurred.');
      }
    };
    fetchPlayerData();
  }, []);

  // Handle sorting
  const handleSort = (field) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);
  };

  // Sort players based on the field and order
  const sortedPlayers = [...players].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a[sortField] > b[sortField] ? 1 : -1;
    } else {
      return a[sortField] < b[sortField] ? 1 : -1;
    }
  });

  return (
    <div className="container mx-auto p-6 text-white min-h-screen mb-40">
      <h1 className="text-4xl font-bold mb-8 text-center text-green-500">Leaderboard</h1>

      {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto bg-gray-800 rounded-lg text-pink-400">
          <thead>
            <tr>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('username')}>
                Username {sortField === 'username' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('crimesPerformed')}>
                Kills {sortField === 'crimesPerformed' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="px-4 py-2 cursor-pointer color-" onClick={() => handleSort('rank')}>
                Rank {sortField === 'rank' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('money')}>
                Money {sortField === 'money' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('inventory')}>
                Boss Items {sortField === 'inventory' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('isAlive')}>
                Status {sortField === 'isAlive' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player) => (
              <tr key={player._id} className="bg-gray-700 hover:bg-gray-800">
                <td className="border px-4 py-2">{player.username}</td>
                <td className="border px-4 py-2">{player.crimesPerformed}</td>
                <td className="border px-4 py-2">{player.rank}</td>
                <td className="border px-4 py-2">${player.money.toLocaleString()}</td>
                <td className="border px-4 py-2">
                  {player.inventory.filter(item => item.name.includes('Boss')).length}
                </td>
                <td className={`border px-4 py-2 ${player.isAlive ? 'text-green-500' : 'text-red-500'}`}>
                  {player.isAlive ? 'Alive' : 'Dead'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScorePage;
