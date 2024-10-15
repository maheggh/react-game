// WeaponStore.jsx

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Potato Weapon Store</h1>

      {/* Display Error Message if Any */}
      {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}

      {/* Weapon List */}
      {weapons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weapons.map((weapon) => (
            <div
              key={weapon.id}
              className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center"
            >
              <img
                src={`/assets/${weapon.image}`}
                alt={weapon.name}
                className="w-24 h-24 mb-4"
              />
              <h2 className="text-xl font-semibold mb-2">{weapon.name}</h2>
              <p className="text-gray-700">Price: ${weapon.price}</p>
              <p className="text-gray-700">Accuracy: {weapon.accuracy}%</p>
              <button
                onClick={() => handleBuyWeapon(weapon.id)}
                className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Buy {weapon.name}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4">No weapons available.</p>
      )}

      {/* Inventory List */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold">Your Inventory</h2>
        {inventory.length > 0 ? (
          <ul className="list-disc list-inside">
            {inventory.map((invItem, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>
                  {invItem.name} - Quantity: {invItem.quantity}
                  {/* Display attributes if needed */}
                </span>
                <button
                  onClick={() => handleSellWeapon(invItem.name)}
                  className="ml-4 m-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                >
                  Sell for 50%
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No items in your inventory.</p>
        )}
      </div>

      {/* Money Display */}
      <div className="mt-8 text-xl mb-40">
        <p>
          Money: <span className="font-bold text-green-600 p-4">${money}</span>
        </p>
      </div>
    </div>
  );
};

export default WeaponStore;
