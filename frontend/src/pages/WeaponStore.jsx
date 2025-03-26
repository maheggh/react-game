// WeaponStore.jsx

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const WeaponStore = () => {
  const { user } = useContext(AuthContext);
  const [money, setMoney] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [weapons, setWeapons] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch available weapons and user data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch available weapons
        const weaponsResponse = await fetch('/api/weapons');
        const weaponsData = await weaponsResponse.json();
        if (weaponsResponse.ok && weaponsData.success) {
          setWeapons(weaponsData.items);
        } else {
          setErrorMessage(weaponsData.message || 'Failed to fetch weapons.');
        }

        // Fetch user inventory and money
        const userResponse = await fetch('/api/users/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const userData = await userResponse.json();
        if (userResponse.ok && userData.success) {
          setMoney(userData.userData.money);
          setInventory(userData.userData.inventory || []);
        } else {
          setErrorMessage(userData.message || 'Failed to fetch user data.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMessage('Server error occurred.');
      }
    };

    fetchData();
  }, []);

  // Function to handle buying a weapon
  const handleBuyWeapon = async (weaponId) => {
    try {
      const response = await fetch('/api/weapons/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ weaponId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMoney(data.money);
        setInventory(data.inventory);
        setErrorMessage('');
      } else {
        setErrorMessage(data.message || 'Failed to buy weapon.');
      }
    } catch (error) {
      setErrorMessage('Server error occurred.');
      console.error('Error buying weapon:', error);
    }
  };

  // Function to sell a weapon
  const handleSellWeapon = async (weaponName) => {
    try {
      const response = await fetch('/api/weapons/sell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ weaponName }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMoney(data.money);
        setInventory(data.inventory);
        setErrorMessage('');
      } else {
        setErrorMessage(data.message || 'Failed to sell weapon.');
      }
    } catch (error) {
      setErrorMessage('Server error occurred.');
      console.error('Error selling weapon:', error);
    }
  };

  // Helper function to check if the user already owns a weapon
  const userOwnsWeapon = (weaponName) => {
    return inventory.some((item) => item.name === weaponName);
  };

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gray-900 text-white pb-40 pt-20 min-w-full">
      <h1 className="text-4xl font-bold mb-6 text-center text-yellow-400">Potato Weapon Store</h1>

      {/* Display Error Message if Any */}
      {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}

      {/* Weapon List */}
      {weapons.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {weapons.map((weapon) => (
            <div
              key={weapon.id}
              className="bg-gray-800 shadow-md rounded-lg p-4 text-center"
            >
              <img
                src={`/assets/${weapon.image}`}
                alt={weapon.name}
                className="w-20 h-20 mb-2 mx-auto object-contain"
              />
              <h2 className="text-lg font-semibold mb-1 text-yellow-300">{weapon.name}</h2>
              <p className="text-gray-400 mb-1">Price: ${weapon.price}</p>
              <p className="text-gray-400 mb-2">Accuracy: {weapon.accuracy}%</p>
              {userOwnsWeapon(weapon.name) ? (
                <button
                  disabled
                  className="bg-gray-500 text-white py-1 px-10 rounded-lg cursor-not-allowed"
                >
                  Owned
                </button>
              ) : (
                <button
                  onClick={() => handleBuyWeapon(weapon.id)}
                  className="bg-red-600 hover:bg-red-700 text-white py-1 px-10 rounded-lg transition duration-300"
                >
                  Buy
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-center text-gray-400">No weapons available.</p>
      )}

      {/* Inventory List */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-left mb-4">Your Inventory</h2>
        {inventory.length > 0 ? (
          <ul className="space-y-4 text-gray-300">
            {inventory.map((invItem, index) => (
              <li key={index} className="flex justify-between items-center text-xl">
                <span>
                  {invItem.name}
                </span>
                {invItem.attributes?.accuracy && (
                  <button
                    onClick={() => handleSellWeapon(invItem.name)}
                    className="bg-blue-600 hover:bg-blue-800 text-white py-1 px-20 rounded-lg transition duration-300"
                  >
                    Sell for 50%
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-400">No items in your inventory.</p>
        )}
      </div>

      {/* Money Display */}
      <div className="mt-8 text-xl text-left">
        <p>
          Money: <span className="font-bold text-green-400">${money}</span>
        </p>
      </div>
    </div>
  );
};

export default WeaponStore;
