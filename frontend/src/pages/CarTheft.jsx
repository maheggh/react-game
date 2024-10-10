import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const CarTheft = () => {
  const { user } = useContext(AuthContext);
  const [stolenCars, setStolenCars] = useState([]);
  const [money, setMoney] = useState(0);
  const [inJail, setInJail] = useState(false);
  const [jailTime, setJailTime] = useState(30);
  const [successMessage, setSuccessMessage] = useState('');
  const [failureMessage, setFailureMessage] = useState('');
  const [attemptedBreakout, setAttemptedBreakout] = useState(false);
  const [showGarage, setShowGarage] = useState(false);

  const rank = user && user.rank ? user.rank : 1;

  const venues = {
    'Rich Potato Neighborhood': {
      cars: [
        { name: 'Luxury Spud Sedan', price: 120000, baseChance: 5, image: '/assets/luxury-spud-sedan.png' },
        { name: 'Sporty Tater Coupe', price: 40000, baseChance: 8, image: '/assets/sporty-tater-coupe.png' },
        { name: 'Potato Convertible', price: 30000, baseChance: 10, image: '/assets/potato-convertible.png' },
        { name: 'SUV Spud', price: 2000, baseChance: 20, image: '/assets/suv-spud.png' }
      ],
      image: '/assets/rich.png',
      baseStealChance: 5
    },
    'Spudville Downtown': {
      cars: [
        { name: 'Hatchback Tuber', price: 1500, baseChance: 20, image: '/assets/hatchback-tuber.png' },
        { name: 'Sedan Yam', price: 20000, baseChance: 10, image: '/assets/sedan-yam.png' },
        { name: 'SUV Tater', price: 25000, baseChance: 8, image: '/assets/suv-tater.png' },
        { name: 'Spudnik Sports', price: 90000, baseChance: 4, image: '/assets/spudnik-sports.png' }
      ],
      image: '/assets/downtown.png',
      baseStealChance: 10
    },
    'Fries End Suburbs': {
      cars: [
        { name: 'Compact Fry', price: 10000, baseChance: 25, image: '/assets/compact-fry.png' },
        { name: 'Curly Coupe', price: 15000, baseChance: 20, image: '/assets/curly-coupe.png' },
        { name: 'Wedge Wagon', price: 20000, baseChance: 15, image: '/assets/wedge-wagon.png' },
        { name: 'Crispy Convertible', price: 110000, baseChance: 5, image: '/assets/crispy-convertible.png' }
      ],
      image: '/assets/fries.png',
      baseStealChance: 15
    },
    'Mashy Meadows': {
      cars: [
        { name: 'Mashed Mini', price: 500, baseChance: 30, image: '/assets/mashed-mini.png' },
        { name: 'Buttery Buggy', price: 8000, baseChance: 20, image: '/assets/buttery-buggy.png' },
        { name: 'Gravy Sedan', price: 12000, baseChance: 15, image: '/assets/gravy-sedan.png' },
        { name: 'Peeler Pickup', price: 18000, baseChance: 5, image: '/assets/peeler-pickup.png' }
      ],
      image: '/assets/mashy.png',
      baseStealChance: 20
    },
    'Tuber Town': {
      cars: [
        { name: 'Root Roadster', price: 7000, baseChance: 30, image: '/assets/root-roadster.png' },
        { name: 'Bulb Buggy', price: 10000, baseChance: 25, image: '/assets/bulb-buggy.png' },
        { name: 'Starch Sedan', price: 15000, baseChance: 15, image: '/assets/starch-sedan.png' },
        { name: 'Tuber Truck', price: 60000, baseChance: 5, image: '/assets/tuber-truck.png' }
      ],
      image: '/assets/tuber.png',
      baseStealChance: 25
    }
  };
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
          setStolenCars(data.userData.cars);
          setMoney(data.userData.money);
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
    }
  }, [inJail, jailTime]);

  const calculateStealChance = (baseChance) => {
    const adjustedChance = baseChance + rank * 2;
    return Math.min(adjustedChance, 90);
  };

  const stealCar = async (venueName) => {
    if (inJail) {
      setFailureMessage('You cannot steal cars while in jail!');
      return;
    }

    const venue = venues[venueName];
    const stealChance = calculateStealChance(venue.baseStealChance);
    const carRoll = Math.floor(Math.random() * 100) + 1;

    if (carRoll <= stealChance) {
      const car = getRandomCar(venue.cars);
      const updatedCars = [...stolenCars, car];

      setStolenCars(updatedCars); // Only add the car to garage; do not add money

      await updateUserData(updatedCars); // Update backend without money

      setSuccessMessage(`You successfully stole a ${car.name}!`);
      setFailureMessage('');
    } else {
      setFailureMessage('You failed to steal the car.');
      const failureRoll = Math.random() * 100;
      if (failureRoll > 30) {
        sendToJail();
      }
    }
  };

  const updateUserData = async (updatedCars) => {
    try {
      await fetch('/api/users/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ cars: updatedCars }),
      });
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const getRandomCar = (cars) => {
    let totalChance = cars.reduce((sum, car) => sum + car.baseChance, 0);
    let randomNum = Math.random() * totalChance;

    for (let car of cars) {
      if (randomNum < car.baseChance) {
        return car;
      }
      randomNum -= car.baseChance;
    }

    return cars[cars.length - 1];
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

  const toggleGarage = () => setShowGarage(!showGarage);

  const sellCar = async (index) => {
    const car = stolenCars[index];
    const updatedCars = stolenCars.filter((_, i) => i !== index);
    const updatedMoney = money + car.price;

    setStolenCars(updatedCars);
    setMoney(updatedMoney);

    await updateUserDataWithMoney(updatedCars, updatedMoney); // Now update with money
  };

  const updateUserDataWithMoney = async (updatedCars, updatedMoney) => {
    try {
      await fetch('/api/users/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ cars: updatedCars, money: updatedMoney }),
      });
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Car Theft</h2>

      <div className="grid grid-cols-3 gap-4">
        {Object.keys(venues).map((venueName, index) => {
          const venue = venues[venueName];
          return (
            <div key={index} className="p-4 bg-gray-100 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">{venueName}</h3>
              <img src={venue.image} alt={venueName} className="w-full h-auto my-2" />
              <button className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2" onClick={() => stealCar(venueName)}>
                Steal Car
              </button>
            </div>
          );
        })}
      </div>

      {successMessage && <div className="text-green-500 mt-4">{successMessage}</div>}
      {failureMessage && <div className="text-red-500 mt-4">{failureMessage}</div>}

      {inJail && (
        <div className="mt-4">
          <p className="text-red-500">You are in jail! Jail time left: {jailTime} seconds.</p>
          <button className="bg-yellow-500 text-white px-4 py-2 rounded-md" onClick={attemptBreakout}>
            Attempt Breakout
          </button>
        </div>
      )}

      <div className="mt-4">
        <button className="bg-gray-600 text-white px-4 py-2 rounded-md" onClick={toggleGarage}>
          {showGarage ? 'Hide Garage' : 'Show Garage'}
        </button>
        {showGarage && (
          <ul className="mt-4">
            {stolenCars.length > 0 ? (
              stolenCars.map((car, index) => (
                <li key={index} className="flex items-center">
                  <img src={car.image} alt={car.name} style={{ width: '100px', marginRight: '10px' }} />
                  <span>{car.name} - ${car.price}</span>
                  <button className="bg-green-500 text-white px-4 py-2 ml-4 rounded-md" onClick={() => sellCar(index)}>
                    Sell
                  </button>
                </li>
              ))
            ) : (
              <li>No cars in your garage.</li>
            )}
          </ul>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xl">Money: ${money}</p>
      </div>

      {/* Cheat button now lets you out of jail */}
      <div className="mt-4">
        <button className="bg-red-500 text-white px-4 py-2 rounded-md" onClick={async () => {
          const updatedMoney = money + 50000;
          setMoney(updatedMoney);
          setInJail(false); // Cheat button now also gets you out of jail
          setJailTime(0); // Reset jail time

          await fetch('/api/users/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ money: updatedMoney }),
          });
        }}>
          Cheat
        </button>
      </div>
    </div>
  );
};

export default CarTheft;
