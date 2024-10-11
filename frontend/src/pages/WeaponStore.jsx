import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const WeaponStore = () => {
  const { user } = useContext(AuthContext);  // Fetch user data from context (money, etc.)
  const [money, setMoney] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Updated weapon prices and accuracy
  const weapons = [
    { name: 'Spud Gun', price: 500, accuracy: 0.5, image: 'spud-gun.png' },
    { name: 'Potato Peeler Pistol', price: 1000, accuracy: 1.0, image: 'potato-peeler-pistol.png' },
    { name: 'Fryer Firearm', price: 5000, accuracy: 2.0, image: 'fryer-firearm.png' },
    { name: 'Masher Machine Gun', price: 10000, accuracy: 3.0, image: 'masher-machinegun.png' },
    { name: 'Hashbrown Handgun', price: 100, accuracy: 0.1, image: 'hashbrown-handgun.png' },
    { name: 'Latke Launcher', price: 20000, accuracy: 3.5, image: 'latke-launcher.png' },
    { name: 'Gnocchi Grenade', price: 30000, accuracy: 4.0, image: 'gnocchi-granade.png' },
    { name: 'Chips Cannon', price: 100000, accuracy: 6.5, image: 'chips-cannon.png' },
    { name: 'Potato Bazooka', price: 500000, accuracy: 8.0, image: 'potato-bazooka.png' },
    { name: 'Tater Tornado', price: 1000000, accuracy: 9.5, image: 'tater-tornado.png' },
  ];

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/users/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setMoney(data.userData.money);  // Set the fetched money
          setInventory(data.userData.inventory || []);  // Set the fetched inventory
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Function to handle buying a weapon
  const handleBuyWeapon = async (weapon) => {
    if (money >= weapon.price) {
      setErrorMessage('');  // Clear any previous error message
      const updatedMoney = money - weapon.price;
      const updatedInventory = [...inventory, { ...weapon, type: 'weapon' }];

      // Update the local state
      setMoney(updatedMoney);
      setInventory(updatedInventory);

      // Make an API call to update the user's money and inventory in the backend
      await updateUserData(updatedMoney, updatedInventory);
    } else {
      setErrorMessage('You are too broke, mate!');  // Show error if not enough money
    }
  };

  // Function to sell a weapon for 50% of its price
  const handleSellWeapon = async (weaponIndex) => {
    const weaponToSell = inventory[weaponIndex];
    const updatedMoney = money + weaponToSell.price * 0.5;  // Sell for 50% of the price
    const updatedInventory = inventory.filter((_, i) => i !== weaponIndex);

    // Update local state
    setMoney(updatedMoney);
    setInventory(updatedInventory);

    // Make an API call to update the user's money and inventory in the backend
    await updateUserData(updatedMoney, updatedInventory);
  };

  // Function to update user data in the backend
  const updateUserData = async (updatedMoney, updatedInventory) => {
    try {
      const response = await fetch('/api/users/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          money: updatedMoney,
          inventory: updatedInventory,
        }),
      });
      if (!response.ok) {
        setErrorMessage('Failed to update user data on the server.');
      }
    } catch (error) {
      setErrorMessage('Server error occurred.');
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Potato Weapon Store</h1>

      {/* Weapon List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {weapons.map((weapon, index) => (
          <div key={index} className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center">
            <img src={`/assets/${weapon.image}`} alt={weapon.name} className="w-24 h-24 mb-4" />
            <h2 className="text-xl font-semibold mb-2">{weapon.name}</h2>
            <p className="text-gray-700">Price: ${weapon.price}</p>
            <p className="text-gray-700">Accuracy: {weapon.accuracy}%</p>
            <button
              onClick={() => handleBuyWeapon(weapon)}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Buy {weapon.name}
            </button>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}

      {/* Inventory List */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Inventory</h2>
        <ul className="list-disc list-inside">
          {inventory.length > 0 ? (
            inventory.map((item, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{item.name} - Accuracy: {item.accuracy}% - Price: ${item.price}</span>
                <button
                  onClick={() => handleSellWeapon(index)}
                  className="ml-4 m-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                >
                  Sell for 50%
                </button>
              </li>
            ))
          ) : (
            <p>No weapons in your inventory.</p>
          )}
        </ul>
      </div>

      {/* Money Display */}
      <div className="mt-8 text-xl">
        <p>Money: <span className="font-bold text-green-600 p-4">${money}</span></p>
      </div>
    </div>
  );
};

export default WeaponStore;
