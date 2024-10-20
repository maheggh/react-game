// CarTheft.js

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const CarTheft = () => {
  const { user, xp, rank, money, updateUserData } = useContext(AuthContext);
  const [stolenCars, setStolenCars] = useState([]);
  const [inJail, setInJail] = useState(false);
  const [jailTime, setJailTime] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [failureMessage, setFailureMessage] = useState('');
  const [showGarage, setShowGarage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const venues = {
    'Rich Potato Neighborhood': {
      cars: [
        { name: 'Luxury Spud Sedan', price: 120000, baseChance: 5, image: '/assets/luxury-spud-sedan.png' },
        { name: 'Sporty Tater Coupe', price: 40000, baseChance: 8, image: '/assets/sporty-tater-coupe.png' },
        { name: 'Potato Convertible', price: 30000, baseChance: 10, image: '/assets/potato-convertible.png' },
        { name: 'SUV Spud', price: 2000, baseChance: 20, image: '/assets/suv-spud.png' },
      ],
      image: '/assets/rich.png',
    },
    'Spudville Downtown': {
      cars: [
        { name: 'Hatchback Tuber', price: 1500, baseChance: 20, image: '/assets/hatchback-tuber.png' },
        { name: 'Sedan Yam', price: 20000, baseChance: 10, image: '/assets/sedan-yam.png' },
        { name: 'SUV Tater', price: 25000, baseChance: 8, image: '/assets/suv-tater.png' },
        { name: 'Spudnik Sports', price: 90000, baseChance: 4, image: '/assets/spudnik-sports.png' },
      ],
      image: '/assets/downtown.png',
    },
    'Fries End Suburbs': {
      cars: [
        { name: 'Compact Fry', price: 10000, baseChance: 25, image: '/assets/compact-fry.png' },
        { name: 'Curly Coupe', price: 15000, baseChance: 20, image: '/assets/curly-coupe.png' },
        { name: 'Wedge Wagon', price: 20000, baseChance: 15, image: '/assets/wedge-wagon.png' },
        { name: 'Crispy Convertible', price: 110000, baseChance: 5, image: '/assets/crispy-convertible.png' },
      ],
      image: '/assets/fries.png',
    },
    'Mashy Meadows': {
      cars: [
        { name: 'Mashed Mini', price: 500, baseChance: 30, image: '/assets/mashed-mini.png' },
        { name: 'Buttery Buggy', price: 8000, baseChance: 20, image: '/assets/buttery-buggy.png' },
        { name: 'Gravy Sedan', price: 12000, baseChance: 15, image: '/assets/gravy-sedan.png' },
        { name: 'Peeler Pickup', price: 18000, baseChance: 5, image: '/assets/peeler-pickup.png' },
      ],
      image: '/assets/mashy.png',
    },
    'Tuber Town': {
      cars: [
        { name: 'Root Roadster', price: 7000, baseChance: 30, image: '/assets/root-roadster.png' },
        { name: 'Bulb Buggy', price: 10000, baseChance: 25, image: '/assets/bulb-buggy.png' },
        { name: 'Starch Sedan', price: 15000, baseChance: 15, image: '/assets/starch-sedan.png' },
        { name: 'Tuber Truck', price: 60000, baseChance: 5, image: '/assets/tuber-truck.png' },
      ],
      image: '/assets/tuber.png',
    },
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setStolenCars(data.userData.cars || []);
          updateUserData({
            money: data.userData.money,
            xp: data.userData.xp,
            rank: data.userData.rank,
            inJail: data.userData.inJail,
            jailTimeEnd: data.userData.jailTimeEnd,
          });
          if (data.userData.inJail) {
            const jailTimeLeft = Math.max(0, new Date(data.userData.jailTimeEnd) - Date.now());
            setInJail(true);
            setJailTime(Math.ceil(jailTimeLeft / 1000));
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [updateUserData]);

  useEffect(() => {
    if (inJail && jailTime > 0) {
      const jailTimer = setInterval(() => {
        setJailTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(jailTimer);
            setInJail(false);
            setSuccessMessage('You are free from jail!');
            updateUserData({ inJail: false, jailTimeEnd: null });
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(jailTimer);
    }
  }, [inJail, jailTime, updateUserData]);

  const stealCar = async (venueName) => {
    if (inJail || isLoading) return;

    setSuccessMessage('');
    setFailureMessage('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cartheft/steal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ venueName }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage(data.message);
        setStolenCars([...stolenCars, data.car]);
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

  const sellCar = async (index) => {
    if (isLoading) return;

    setSuccessMessage('');
    setFailureMessage('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cartheft/sell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ carIndex: index }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage(data.message);
        const updatedCars = [...stolenCars];
        updatedCars.splice(index, 1);
        setStolenCars(updatedCars);
        updateUserData({ money: data.money });
      } else {
        setFailureMessage(data.message);
      }
    } catch (error) {
      setFailureMessage('An error occurred while selling the car.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGarage = () => setShowGarage(!showGarage);

// In CarTheft.jsx

const handleCheat = async () => {
  const token = localStorage.getItem('token');
  const updatedMoney = money + 5000000;

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
    <div className="container mx-auto p-4 mb-40">
      <h2 className="text-2xl font-bold mb-4">Car Theft</h2>

      <div className="grid grid-cols-3 gap-4">
        {Object.keys(venues).map((venueName, index) => {
          const venue = venues[venueName];
          return (
            <div key={index} className="p-4 bg-gray-100 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">{venueName}</h3>
              <img src={venue.image} alt={venueName} className="w-full h-auto my-2" />
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
                onClick={() => stealCar(venueName)}
                disabled={inJail || isLoading}
              >
                {isLoading ? 'Stealing...' : 'Steal Car'}
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
          <div className="w-full h-auto my-2">
            <img src="/assets/jailpic.jpg" alt="jailpic" />
          </div>
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
                <li key={index} className="flex items-center my-2">
                  <img src={car.image} alt={car.name} style={{ width: '100px', marginRight: '10px' }} />
                  <span>{car.name} - ${car.price}</span>
                  <button
                    className="bg-green-500 text-white px-4 py-2 ml-4 rounded-md"
                    onClick={() => sellCar(index)}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Sell'}
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

      <div className="mt-4">
        <button className="bg-red-500 text-white px-4 py-2 rounded-md" onClick={handleCheat}>
          Cheat
        </button>
      </div>
    </div>
  );
};

export default CarTheft;
