import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Theft = () => {
  const { user, xp, rank, money, updateUserData } = useContext(AuthContext);
  const [stolenItems, setStolenItems] = useState([]);
  const [inJail, setInJail] = useState(false);
  const [jailTime, setJailTime] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [failureMessage, setFailureMessage] = useState('');
  const [showPocket, setShowPocket] = useState(false);  // Initialize showPocket state
  const [isLoading, setIsLoading] = useState(false);

  // Define items available for theft
  const items = {
    'Purse': [
      { name: 'Slim Purse', price: 50, baseChance: 40, image: '/assets/slim-purse.png' },
      { name: 'Fat Purse', price: 200, baseChance: 25, image: '/assets/fat-purse.png' }
    ],
    'Jewelry': [
      { name: 'Diamond', price: 5000, baseChance: 10, image: '/assets/diamond.png' },
      { name: 'Ruby', price: 3000, baseChance: 15, image: '/assets/ruby.png' }
    ],
    'ATM': [
      { name: 'ATM Money', price: 1000, baseChance: 30, image: '/assets/atm.png' }
    ],
    'Bank': [
      { name: 'Bank Money', price: 50000, baseChance: 5, image: '/assets/bank.png' }
    ]
  };

  const categoryImages = {
    'Purse': '/assets/purse.png',
    'Jewelry': '/assets/jewelry.png',
    'ATM': '/assets/atm.png',
    'Bank': '/assets/bank.png'
  };

  // Jail countdown timer logic
  useEffect(() => {
    if (inJail && jailTime > 0) {
      const jailTimer = setInterval(() => {
        setJailTime(prevTime => prevTime - 1);
      }, 1000);

      return () => clearInterval(jailTimer); // Clean up interval on unmount
    } else if (jailTime === 0 && inJail) {
      setInJail(false);
      setSuccessMessage('You are free from jail!');
      updateUserData({ inJail: false, jailTime: 0 });
    }
  }, [inJail, jailTime, updateUserData]);

  const stealItem = async (category) => {
    if (inJail || isLoading) return; // Prevent stealing while in jail

    setSuccessMessage('');
    setFailureMessage('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/theft/steal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemType: category }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage(data.message);
        setStolenItems([...stolenItems, data.stolenItem]);
        updateUserData({ xp: data.xp, rank: data.rank });
      } else if (response.status === 403 && data.inJail) {
        setFailureMessage(data.message);
        setInJail(true);
        setJailTime(data.jailTime);
      } else {
        setFailureMessage(data.message);
      }
    } catch (error) {
      setFailureMessage('An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const sellItem = async (index) => {
    const item = stolenItems[index];
    const token = localStorage.getItem('token');
    const response = await fetch('/api/theft/sell', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ itemName: item.name })
    });

    const data = await response.json();
    if (response.ok) {
      setSuccessMessage(data.message);
      const updatedItems = [...stolenItems];
      updatedItems.splice(index, 1); // Remove sold item from pocket
      setStolenItems(updatedItems);
      updateUserData({ money: data.money });
    } else {
      setFailureMessage(data.message);
    }
  };

// In CarTheft.jsx

const handleCheat = async () => {
  const token = localStorage.getItem('token');
  const updatedMoney = money + 50000;

  try {
    const response = await fetch('/api/users/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        money: updatedMoney,
        inJail: false,
        jailTimeEnd: null,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setInJail(false);
      setJailTime(0);
      setSuccessMessage('Cheat activated: Money added and released from jail.');
      updateUserData({ money: updatedMoney });
    } else {
      setFailureMessage(data.message || 'Failed to activate cheat.');
    }
  } catch (error) {
    console.error('Error activating cheat:', error);
    setFailureMessage('An error occurred while activating cheat.');
  }
};

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Theft</h2>

      {/* Theft Categories */}
      <div className="grid grid-cols-4 gap-4">
        {Object.keys(items).map((category, index) => (
          <div key={index} className="p-4 bg-gray-100 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold">{category}</h3>
            <img
              src={categoryImages[category]} 
              alt={category}
              className="w-full h-auto my-2"
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
              onClick={() => stealItem(category)}
              disabled={inJail || isLoading} // Disable button if in jail or loading
            >
              {isLoading ? 'Stealing...' : 'Attempt Theft'}
            </button>
          </div>
        ))}
      </div>

      {successMessage && <div className="text-green-500 mt-4">{successMessage}</div>}
      {failureMessage && <div className="text-red-500 mt-4">{failureMessage}</div>}

      {inJail && (
        <div className="mt-4">
          <p className="text-red-500">You are in jail! Jail time left: {jailTime} seconds.</p>
          <div className="w-full h-auto my-2">
          <img src="/assets/jailpic.jpg" alt="jailpic" />
          </div>
        </div>
      )}

      {/* Pocket/Backpack to view and sell stolen items */}
      <div className="mt-4">
        <button
          className="bg-gray-600 text-white px-4 py-2 rounded-md"
          onClick={() => setShowPocket(!showPocket)}  
        >
          {showPocket ? 'Hide Pocket' : 'Show Pocket'}
        </button>
        {showPocket && (
          <ul className="mt-4">
            {stolenItems.length > 0 ? (
              stolenItems.map((item, index) => (
                <li key={index} className="flex items-center">
                  <img src={item.image} alt={item.name} style={{ width: '50px', marginRight: '10px' }} />
                  <span>{item.name} - ${item.price}</span>
                  <button
                    className="bg-green-500 text-white px-4 py-2 ml-4 rounded-md"
                    onClick={() => sellItem(index)}
                  >
                    Sell
                  </button>
                </li>
              ))
            ) : (
              <li>No items in your pocket.</li>
            )}
          </ul>
        )}
      </div>

      {/* Cheat button */}
      <div className="mt-4">
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-md"
          onClick={handleCheat}
        >
          Cheat
        </button>
      </div>

      <div className="mt-4">
        <p className="text-xl">Money: ${money}</p>
      </div>
    </div>
  );
};

export default Theft;
