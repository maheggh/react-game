import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Theft = () => {
  const { user } = useContext(AuthContext);
  const [stolenItems, setStolenItems] = useState([]);
  const [money, setMoney] = useState(0);
  const [inJail, setInJail] = useState(false);
  const [jailTime, setJailTime] = useState(30);
  const [successMessage, setSuccessMessage] = useState('');
  const [failureMessage, setFailureMessage] = useState('');
  const [hasAttemptedBreakout, setHasAttemptedBreakout] = useState(false);
  const [maxSecurity, setMaxSecurity] = useState(false);
  const [showPocket, setShowPocket] = useState(false);

  // Dynamic steal chance adjustment based on rank
  const rank = user && user.rank ? user.rank : 1;

  // Theft items
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
          setStolenItems(data.userData.stolenItems);
          setMoney(data.userData.money);
          setInJail(data.userData.inJail);
          setJailTime(data.userData.jailTime);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Jail Timer - Automatically release from jail when timer reaches 0
  useEffect(() => {
    if (inJail && jailTime > 0) {
      const jailTimer = setInterval(() => {
        setJailTime(prevTime => prevTime - 1);
      }, 1000);

      return () => clearInterval(jailTimer); // Clear interval on unmount
    } else if (jailTime === 0 && inJail) {
      setInJail(false);
      setSuccessMessage('You are free from jail!');
      updateUserData({ inJail: false, jailTime: 0 });
    }
  }, [inJail, jailTime]);

  const calculateStealChance = (baseChance) => {
    const adjustedChance = baseChance + rank * 5;
    return Math.min(adjustedChance, 90);
  };

  const stealItem = async (category) => {
    if (inJail) {
      setFailureMessage('You cannot steal while in jail!');
      return;
    }

    setSuccessMessage('');
    setFailureMessage('');

    const itemCategory = items[category];
    const item = getRandomItem(itemCategory); // Randomly select an item
    const stealChance = calculateStealChance(item.baseChance);
    const randomRoll = Math.floor(Math.random() * 100) + 1;

    if (randomRoll <= stealChance) {
      const updatedItems = [...stolenItems, item];
      setStolenItems(updatedItems);
      await updateUserData({ stolenItems: updatedItems });
      setSuccessMessage(`You successfully stole a ${item.name}!`);
    } else {
      setFailureMessage('You got caught and sent to jail!');
      sendToJail();
    }
  };

  const getRandomItem = (items) => {
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
  };

  const sendToJail = () => {
    setInJail(true);
    setJailTime(30);
    updateUserData({ inJail: true, jailTime: 30 });
  };

  const attemptBreakout = async () => {
    if (inJail && !hasAttemptedBreakout && !maxSecurity) {
      const chanceOfEscape = 5;
      const roll = Math.floor(Math.random() * 100) + 1;

      if (roll <= chanceOfEscape) {
        setInJail(false);
        setJailTime(0);
        await updateUserData({ inJail: false, jailTime: 0 });
        setSuccessMessage('You successfully broke out of jail!');
      } else {
        setJailTime((prevTime) => prevTime + 30);
        setFailureMessage('Failed breakout attempt! You have been sent to maximum security prison.');
        setMaxSecurity(true);
      }

      setHasAttemptedBreakout(true);
    } else if (maxSecurity) {
      setFailureMessage('You are in maximum security prison. No more breakout attempts allowed.');
    } else if (hasAttemptedBreakout) {
      setFailureMessage('You have already attempted to break out.');
    }
  };

  const togglePocket = () => setShowPocket(!showPocket);

  const sellItem = async (index) => {
    const item = stolenItems[index];
    const updatedItems = stolenItems.filter((_, i) => i !== index);
    const updatedMoney = money + item.price;

    setStolenItems(updatedItems);
    setMoney(updatedMoney);

    await updateUserData({ stolenItems: updatedItems, money: updatedMoney });
  };

  const updateUserData = async (updatedData) => {
    try {
      await fetch('/api/users/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedData),
      });
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Theft</h2>

      <div className="grid grid-cols-4 gap-4">
        {Object.keys(items).map((category, index) => (
          <div key={index} className="p-4 bg-gray-100 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold">{category}</h3>
            <img
              src={categoryImages[category]} // Show category image
              alt={category}
              className="w-full h-auto my-2"
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
              onClick={() => stealItem(category)}
            >
              Attempt Theft
            </button>
          </div>
        ))}
      </div>

      {successMessage && <div className="text-green-500 mt-4">{successMessage}</div>}
      {failureMessage && <div className="text-red-500 mt-4">{failureMessage}</div>}

      {inJail && (
        <div className="mt-4">
          <p className="text-red-500">
            You are in jail! Jail time left: {jailTime} seconds.
          </p>
          <button className="bg-yellow-500 text-white px-4 py-2 rounded-md" onClick={attemptBreakout}>
            Attempt Breakout
          </button>
        </div>
      )}

      <div className="mt-4">
        <button className="bg-gray-600 text-white px-4 py-2 rounded-md" onClick={togglePocket}>
          {showPocket ? 'Hide Pocket' : 'Show Pocket'}
        </button>
        {showPocket && (
          <ul className="mt-4">
            {stolenItems.length > 0 ? (
              stolenItems.map((item, index) => (
                <li key={index} className="flex items-center">
                  <img src={item.image} alt={item.name} style={{ width: '100px', marginRight: '10px' }} />
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

      <div className="mt-4">
        <p className="text-xl">Money: ${money}</p>
      </div>

      {/* Cheat button */}
      <div className="mt-4">
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-md"
          onClick={() => {
            const updatedMoney = money + 50000;
            setMoney(updatedMoney);
            setInJail(false); 
            setJailTime(0);
            updateUserData({ money: updatedMoney, inJail: false, jailTime: 0 });
          }}
        >
          Cheat
        </button>
      </div>
    </div>
  );
};

export default Theft;
