import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Theft = () => {
  const {
    user,
    xp,
    setXp,       // If you manage xp in context
    rank,
    setRank,     // If you manage rank in context
    money,
    setMoney,    // If you manage money in context
    stolenItems,
    setStolenItems,
    inJail,
    setInJail,
    jailTime,
    setJailTime,
    loading
  } = useContext(AuthContext);

  const [successMessage, setSuccessMessage] = useState('');
  const [failureMessage, setFailureMessage] = useState('');
  const [showPocket, setShowPocket] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Categories for theft
  const categories = ['Purse', 'Jewelry', 'ATM', 'Bank'];

  // Category → Image mapping
  const categoryImageMapping = {
    Purse: '/assets/purse.png',
    Jewelry: '/assets/jewelry.png',
    ATM: '/assets/atm.png',
    Bank: '/assets/bank.png'
  };

  // Item → Image mapping
  const itemImageMapping = {
    'Slim Purse': '/assets/slim-purse.png',
    'Fat Purse': '/assets/fat-purse.png',
    Diamond: '/assets/diamond.png',
    Ruby: '/assets/ruby.png',
    'ATM Money': '/assets/atm.png',
    'Bank Money': '/assets/bank.png'
  };

  // Get category image
  const getCategoryImagePath = (category) => {
    return categoryImageMapping[category] || '/assets/default-category.png';
  };

  // Get item image
  const getItemImagePath = (itemName) => {
    return itemImageMapping[itemName] || '/assets/default-item.png';
  };

  // Initial fetch for stolen items, jail status, etc.
  useEffect(() => {
    const fetchStolenItems = async () => {
      try {
        setIsFetching(true);
        const response = await fetch('/api/theft/stolen-items', {
          method: 'GET',
          credentials: 'include'
        });
        const data = await response.json();

        if (response.ok) {
          setStolenItems(data.stolenItems || []);
          setInJail(data.inJail || false);
          setJailTime(data.jailTime || 0);
        } else {
          setFailureMessage(data.message || 'Failed to fetch stolen items.');
        }
      } catch (error) {
        console.error('Error fetching stolen items:', error);
        setFailureMessage('Error fetching stolen items.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchStolenItems();
  }, [setStolenItems, setInJail, setJailTime]);

  // Jail timer countdown
  useEffect(() => {
    let jailTimer;
    if (inJail && jailTime > 0) {
      jailTimer = setInterval(() => {
        setJailTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(jailTimer);
            setInJail(false);
            setSuccessMessage('You are free from jail!');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(jailTimer);
  }, [inJail, jailTime, setInJail, setJailTime]);

  // Attempt to steal
  const stealItem = async (category) => {
    if (inJail || isLoading) return;
    setSuccessMessage('');
    setFailureMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/theft/steal', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category })
      });
      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message);
        if (data.stolenItem) {
          setStolenItems((prev) => [...prev, data.stolenItem]);
        }
        if (data.xp !== undefined) setXp(data.xp);
        if (data.rank !== undefined) setRank(data.rank);
      } else {
        // If user got jailed or theft failed
        if (response.status === 403 && data.inJail) {
          setFailureMessage(data.message);
          setInJail(true);
          setJailTime(data.jailTime || 0);
        } else {
          setFailureMessage(data.message);
        }
      }
    } catch (error) {
      console.error('Error stealing item:', error);
      setFailureMessage('Error stealing item.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sell an item from stolenItems
  const sellItem = async (index) => {
    const item = stolenItems[index];
    if (!item) return;
    setSuccessMessage('');
    setFailureMessage('');

    try {
      const response = await fetch('/api/theft/sell', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemName: item.name })
      });
      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message);
        setStolenItems((prev) => prev.filter((_, i) => i !== index));
        if (data.money !== undefined) setMoney(data.money);
      } else {
        setFailureMessage(data.message);
      }
    } catch (error) {
      console.error('Error selling item:', error);
      setFailureMessage('Error selling item.');
    }
  };

  // Auto-hide success/failure messages
  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  useEffect(() => {
    if (failureMessage) {
      const t = setTimeout(() => setFailureMessage(''), 3000);
      return () => clearTimeout(t);
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
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Theft Simulator</h1>
        <p className="text-gray-500 mt-2 p-4 text-lg">
          Why not steal as well, you do all the other sketchy activities anyway.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div
            key={cat}
            className="bg-gray-100 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center p-4"
          >
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">{cat}</h3>
            <img
              src={getCategoryImagePath(cat)}
              alt={cat}
              className="w-50 h-50 object-contain mb-4"
              onError={(e) => { e.target.src = '/assets/default-category.png'; }}
            />
            <button
              className={`w-full py-2 px-4 rounded-md text-white ${
                inJail || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors duration-200`}
              onClick={() => stealItem(cat)}
              disabled={inJail || isLoading}
            >
              {isLoading ? 'Stealing...' : `Steal from ${cat}`}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6">
        {successMessage && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}
        {failureMessage && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{failureMessage}</span>
          </div>
        )}
      </div>

      {inJail && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center">
          <svg
            className="w-6 h-6 mr-4 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M12 20.01c5.523 0 10-4.477 10-10S17.523 0.01 12 0.01 2 4.487 2 10s4.477 9.99 10 9.99z"
            />
          </svg>
          <div>
            <p className="font-semibold">You are in jail!</p>
            <p>
              Jail time left: <span className="font-bold">{jailTime} seconds</span>
            </p>
          </div>
          <img
            src="./assets/jailpic.JPG"
            alt="Jail"
            className="w-40 h-40 object-cover ml-auto rounded-full border-2 border-red-500"
            onError={(e) => { e.target.src = '/assets/default-category.png'; }}
          />
        </div>
      )}

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
                  <li
                    key={index}
                    className="flex items-center justify-between bg-white p-4 rounded-lg shadow"
                  >
                    <div className="flex items-center">
                      <img
                        src={getItemImagePath(item.name)}
                        alt={item.name}
                        className="w-16 h-16 object-contain rounded-md mr-4"
                        onError={(e) => { e.target.src = '/assets/default-item.png'; }}
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

      {/* Example cheat button if you want it */}
      {/* <div className="mt-8 flex justify-center">
        <button
          className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200"
          onClick={handleCheat}
        >
          Cheat
        </button>
      </div> */}

      <div className="mt-8 flex justify-center">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-lg shadow-md">
          <p className="text-xl font-semibold">Money: <span className="text-2xl">${money}</span></p>
        </div>
      </div>
    </div>
  );
};

export default Theft;
