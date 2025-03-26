// frontend/src/components/Theft.jsx

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Theft = () => {
  const {
    user,
    xp,
    rank,
    money,
    stolenItems,
    setStolenItems,
    inJail,
    jailTime,
    setInJail,
    setJailTime,
    updateUserData,
    loading,
  } = useContext(AuthContext);

  const [successMessage, setSuccessMessage] = useState('');
  const [failureMessage, setFailureMessage] = useState('');
  const [showPocket, setShowPocket] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true); // To manage loading state

  // Define items available for theft (no image paths)
  const items = {
    Purse: [
      { name: 'Slim Purse', price: 50, baseChance: 40 },
      { name: 'Fat Purse', price: 200, baseChance: 25 },
    ],
    Jewelry: [
      { name: 'Diamond', price: 5000, baseChance: 10 },
      { name: 'Ruby', price: 3000, baseChance: 15 },
    ],
    ATM: [
      { name: 'ATM Money', price: 1000, baseChance: 30 },
    ],
    Bank: [
      { name: 'Bank Money', price: 50000, baseChance: 5 },
    ],
  };

  // Mapping of category names to images
  const categoryImageMapping = {
    Purse: '/assets/purse.png',
    Jewelry: '/assets/jewelry.png',
    ATM: '/assets/atm.png',
    Bank: '/assets/bank.png',
  };

  // Mapping of item names to images
  const itemImageMapping = {
    'Slim Purse': '/assets/slim-purse.png',
    'Fat Purse': '/assets/fat-purse.png',
    Diamond: '/assets/diamond.png',
    Ruby: '/assets/ruby.png',
    'ATM Money': '/assets/atm.png',
    'Bank Money': '/assets/bank.png',
    // Add more mappings as needed
  };

  // Function to get category image path
  const getCategoryImagePath = (categoryName) => {
    return categoryImageMapping[categoryName] || '/assets/default-category.png'; // Ensure default-category.png exists
  };

  // Function to get item image path
  const getItemImagePath = (itemName) => {
    return itemImageMapping[itemName] || '/assets/default-item.png'; // Ensure default-item.png exists
  };

  // Fetch stolen items when component mounts (Optional if AuthContext already fetches on mount)
  useEffect(() => {
    const fetchStolenItems = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          setIsFetching(false);
          return;
        }

        const response = await fetch('/api/theft/stolen-items', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setStolenItems(data.stolenItems);
          setInJail(data.inJail);
          setJailTime(data.jailTime);
          console.log('Fetched stolen items:', data.stolenItems);
        } else {
          console.error('Failed to fetch stolen items:', data.message);
        }
      } catch (error) {
        console.error('Error fetching stolen items:', error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchStolenItems();
  }, [setStolenItems, setInJail, setJailTime]);

  // Jail countdown timer logic
  useEffect(() => {
    let jailTimer;
    if (inJail && jailTime > 0) {
      jailTimer = setInterval(() => {
        setJailTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(jailTimer);
            setInJail(false);
            setSuccessMessage('You are free from jail!');
            updateUserData({ inJail: false, jailTime: 0 });
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => clearInterval(jailTimer); // Clean up interval on unmount
  }, [inJail, jailTime, setJailTime, setInJail, updateUserData]);

  const stealItem = async (category) => {
    if (inJail || isLoading) return; // Prevent stealing while in jail or loading

    setSuccessMessage('');
    setFailureMessage('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setFailureMessage('Authentication token missing.');
        setIsLoading(false);
        return;
      }

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
        setStolenItems((prevItems) => [...prevItems, data.stolenItem]);
        updateUserData({ xp: data.xp, rank: data.rank });
      } else if (response.status === 403 && data.inJail) {
        setFailureMessage(data.message);
        setInJail(true);
        setJailTime(data.jailTime);
      } else {
        setFailureMessage(data.message);
      }
    } catch (error) {
      console.error('Steal action error:', error);
      setFailureMessage('An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const sellItem = async (index) => {
    const item = stolenItems[index];
    if (!item) {
      setFailureMessage('Item does not exist.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setFailureMessage('Authentication token missing.');
      return;
    }

    try {
      const response = await fetch('/api/theft/sell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemName: item.name }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage(data.message);
        setStolenItems((prevItems) => prevItems.filter((_, i) => i !== index));
        updateUserData({ money: data.money });
      } else {
        setFailureMessage(data.message);
      }
    } catch (error) {
      console.error('Sell action error:', error);
      setFailureMessage('An error occurred while selling the item.');
    }
  };

  // Cheat handler (if still needed)
  const handleCheat = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setFailureMessage('Authentication token missing.');
      return;
    }

    const updatedMoney = money + 50000000;

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
      console.error('Cheat handler error:', error);
      setFailureMessage('An error occurred while activating cheat.');
    }
  };

  // Auto-dismiss Success Message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000); // 3000ms = 3 seconds

      return () => clearTimeout(timer); // Cleanup if component unmounts or message changes
    }
  }, [successMessage]);

  // Auto-dismiss Failure Message after 3 seconds
  useEffect(() => {
    if (failureMessage) {
      const timer = setTimeout(() => {
        setFailureMessage('');
      }, 3000); 

      return () => clearTimeout(timer); 
    }
  }, [failureMessage]);

  if (loading || isFetching) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Loading...</div>
      </div>
    ); 
  }

  return (
    <div className="container mx-auto p-6 pb-40 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Theft Simulator</h1>
        <p className="text-gray-500 mt-2 p-4 text-lg">
          Why not steal as well, I mean, you do all the other sketchy activities already.
        </p>
      </div>

      {/* Theft Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {Object.keys(items).map((category, index) => (
          <div
            key={index}
            className="bg-gray-100 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center p-4"
          >
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">{category}</h3>
            <img
              src={getCategoryImagePath(category)}
              alt={category}
              className="w-50 h-50 object-contain mb-4"
              onError={(e) => {
                e.target.src = '/assets/default-category.png';
              }} // Fallback
            />
            <button
              className={`w-full py-2 px-4 rounded-md text-white ${
                inJail || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors duration-200`}
              onClick={() => stealItem(category)}
              disabled={inJail || isLoading} // Disable button if in jail or loading
            >
              {isLoading ? 'Stealing...' : 'Attempt Theft'}
            </button>
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="mt-6">
        {successMessage && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 transition-opacity duration-500 ease-in-out"
            role="alert"
          >
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}
        {failureMessage && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 transition-opacity duration-500 ease-in-out"
            role="alert"
          >
            <span className="block sm:inline">{failureMessage}</span>
          </div>
        )}
      </div>

      {/* Jail Status */}
      {inJail && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center">
          <svg
            className="w-6 h-6 mr-4 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20.01c5.523 0 10-4.477 10-10S17.523 0.01 12 0.01 2 4.487 2 10s4.477 9.99 10 9.99z" />
          </svg>
          <div>
            <p className="font-semibold">You are in jail!</p>
            <p>
              Jail time left: <span className="font-bold">{jailTime} seconds</span>
            </p>
          </div>
          <img
            src="/assets/jailpic.JPG"
            alt="Jail"
            className="w-40 h-40 object-cover ml-auto rounded-full border-2 border-red-500"
            onError={(e) => {
              e.target.src = '/assets/default-category.png';
            }} // Fallback
          />
        </div>
      )}

      {/* Pocket/Backpack to view and sell stolen items */}
      <div className="mt-8">
        <button
          className="bg-gray-700 text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-800 transition-colors duration-200"
          onClick={() => setShowPocket(!showPocket)}
          disabled={isFetching}
        >
          {showPocket ? 'Hide Pocket' : 'Show Pocket'}
        </button>
        {showPocket && (
          <div className="mt-4 bg-gray-50 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Pocket</h2>
            {stolenItems.length > 0 ? (
              <ul className="space-y-4">
                {stolenItems.map((item, index) => (
                  <li key={index} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                      <img
                        src={getItemImagePath(item.name)}
                        alt={item.name}
                        className="w-16 h-16 object-contain rounded-md mr-4"
                        onError={(e) => {
                          e.target.src = '/assets/default-item.png';
                        }} // Fallback
                      />
                      <div>
                        <h3 className="text-xl font-medium text-gray-700">{item.name}</h3>
                        <p className="text-gray-500">Price: ${item.price}</p>
                      </div>
                    </div>
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-200"
                      onClick={() => sellItem(index)}
                    >
                      Sell
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No items in your pocket.</p>
            )}
          </div>
        )}
      </div>

      {/* Cheat button (optional) */}
      <div className="mt-8 flex justify-center">
        <button
          className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200"
          onClick={handleCheat}
        >
          Cheat
        </button>
      </div>

      {/* Display Money */}
      <div className="mt-8 flex justify-center">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-lg shadow-md">
          <p className="text-xl font-semibold">Money: <span className="text-2xl">${money}</span></p>
        </div>
      </div>
    </div>
  );
};

export default Theft;
