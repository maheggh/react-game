import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Theft = () => {
  const { user } = useContext(AuthContext);
  const [stolenItems, setStolenItems] = useState(
    JSON.parse(localStorage.getItem('stolenItems')) || []
  );
  const [money, setMoney] = useState(
    parseInt(localStorage.getItem('money')) || 0
  );
  const [inJail, setInJail] = useState(localStorage.getItem('inJail') === 'true');
  const [jailTime, setJailTime] = useState(
    parseInt(localStorage.getItem('jailTime')) || 30
  );
  const [successMessage, setSuccessMessage] = useState('');
  const [failureMessage, setFailureMessage] = useState('');
  const [attemptedBreakout, setAttemptedBreakout] = useState(false);
  const [showPocket, setShowPocket] = useState(false);

  // Adjusting theft chances and values for items
  const items = [
    {
      name: 'Purse',
      types: [
        { name: 'Fat Purse', price: 200, baseChance: 30, image: '/assets/fat-purse.png' },
        { name: 'Regular Purse', price: 100, baseChance: 40, image: '/assets/regular-purse.png' },
        { name: 'Slim Purse', price: 50, baseChance: 50, image: '/assets/slim-purse.png' },
        { name: 'Empty Purse', price: 0, baseChance: 60, image: '/assets/empty-purse.png' },
      ],
    },
    {
      name: 'Jewelry Store',
      types: [
        { name: 'Diamond', price: 5000, baseChance: 10, image: '/assets/diamond.png' },
        { name: 'Ruby', price: 3000, baseChance: 15, image: '/assets/ruby.png' },
        { name: 'Emerald', price: 2000, baseChance: 20, image: '/assets/emerald.png' },
        { name: 'Sapphire', price: 1000, baseChance: 25, image: '/assets/sapphire.png' },
      ],
    },
    {
      name: 'ATM',
      types: [{ name: 'ATM Money', price: 1000, baseChance: 30, image: '/assets/atm.png' }],
    },
    {
      name: 'Bank',
      types: [{ name: 'Bank Money', price: 50000, baseChance: 5, image: '/assets/bank.png' }],
    },
  ];

  useEffect(() => {
    // Save to localStorage when state updates
    localStorage.setItem('stolenItems', JSON.stringify(stolenItems));
    localStorage.setItem('money', money.toString());
    localStorage.setItem('inJail', inJail.toString());
    localStorage.setItem('jailTime', jailTime.toString());
  }, [stolenItems, money, inJail, jailTime]);

  const calculateStealChance = (baseChance) => {
    return Math.min(baseChance + user.rank * 2, 90); // Adjust chance based on rank
  };

  const stealItem = (itemName) => {
    if (inJail) {
      setFailureMessage('You cannot steal while in jail!');
      return;
    }

    const item = items.find((i) => i.name === itemName);
    const randomType = getRandomType(item.types);
    const stealChance = calculateStealChance(randomType.baseChance);
    const roll = Math.floor(Math.random() * 100) + 1;

    console.log(`Attempt to steal ${randomType.name} with chance of ${stealChance}%`);
    console.log(`Roll: ${roll}`);

    if (roll <= stealChance) {
      setStolenItems((prevItems) => [...prevItems, randomType]);
      setSuccessMessage(`You successfully stole a ${randomType.name}!`);
      setFailureMessage('');
    } else {
      const failureRoll = Math.random() * 100;
      if (failureRoll <= 30) {
        setFailureMessage(getTheftFailureScenario());
      } else {
        setFailureMessage('You got caught and sent to jail!');
        sendToJail();
      }
      setSuccessMessage('');
    }
  };

  const getRandomType = (types) => {
    let totalChance = types.reduce((sum, type) => sum + type.baseChance, 0);
    let randomNum = Math.random() * totalChance;
    for (let type of types) {
      if (randomNum < type.baseChance) {
        return type;
      }
      randomNum -= type.baseChance;
    }
    return types[types.length - 1]; // Fallback if needed
  };

  const getTheftFailureScenario = () => {
    const scenarios = [
      "You dropped the loot while fleeing!",
      "Security camera spotted you!",
      "You were chased off by security guards!",
    ];
    return scenarios[Math.floor(Math.random() * scenarios.length)];
  };

  const sendToJail = () => {
    setInJail(true);
    setJailTime(30);
  };

  const attemptBreakout = () => {
    if (inJail && !attemptedBreakout) {
      const chanceOfEscape = 5;
      const roll = Math.floor(Math.random() * 100) + 1;
      if (roll <= chanceOfEscape) {
        setInJail(false);
        setJailTime(0);
        setSuccessMessage('You successfully broke out of jail!');
      } else {
        setJailTime((prevTime) => prevTime + 30);
        setFailureMessage('Failed breakout attempt. Jail time increased.');
      }
      setAttemptedBreakout(true);
    } else if (attemptedBreakout) {
      setFailureMessage('You can only attempt to break out once.');
    }
  };

  const togglePocket = () => setShowPocket(!showPocket);

  const cheat = () => {
    console.log('Cheat activated: Free from jail, extra money!');
    setInJail(false);
    setMoney((prevMoney) => prevMoney + 5000);
  };

  const sellItem = (index) => {
    const item = stolenItems[index];
    setMoney((prevMoney) => prevMoney + item.price);
    setStolenItems(stolenItems.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Theft</h2>

      {/* Items section */}
      <div className="grid grid-cols-2 gap-4">
        {items.map((item, index) => (
          <div key={index} className="p-4 bg-gray-100 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold">{item.name}</h3>
            <img
              src={item.types[0].image}
              alt={item.name}
              className="w-full h-auto my-2"
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
              onClick={() => stealItem(item.name)}
            >
              Steal from {item.name}
            </button>
          </div>
        ))}
      </div>

      {/* Result messages */}
      {successMessage && (
        <div className="text-green-500 mt-4">{successMessage}</div>
      )}
      {failureMessage && (
        <div className="text-red-500 mt-4">{failureMessage}</div>
      )}

      {/* Jail breakout */}
      {inJail && (
        <div className="mt-4">
          <p className="text-red-500">
            You are in jail! Jail time left: {jailTime} seconds.
          </p>
          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded-md"
            onClick={attemptBreakout}
          >
            Attempt Breakout
          </button>
        </div>
      )}

      {/* Pocket section */}
      <div className="mt-4">
        <button
          className="bg-gray-600 text-white px-4 py-2 rounded-md"
          onClick={togglePocket}
        >
          {showPocket ? 'Hide Pocket' : 'Show Pocket'}
        </button>
        {showPocket && (
          <ul className="mt-4">
            {stolenItems.length > 0 ? (
              stolenItems.map((item, index) => (
                <li key={index} className="flex items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: '100px', marginRight: '10px' }}
                  />
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

      {/* Money display */}
      <div className="mt-4">
        <p className="text-xl">Money: ${money}</p>
      </div>

      {/* Cheat button */}
      <div className="mt-4">
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-md"
          onClick={cheat}
        >
          Cheat
        </button>
      </div>
    </div>
  );
};

export default Theft;
