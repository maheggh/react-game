// frontend/src/components/CarTheft.js

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

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
    <div className="container mx-auto p-6 mb-40 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Car Theft</h2>
      <p className="text-gray-500 mt-2 p-4 text-lg">
          Why steal a car when you can't even drive ? <br/>
          The rich have some nice cars, but also very good alarmsystems
        </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.keys(venues).map((venueName, index) => {
          const venue = venues[venueName];
          return (
            <div key={index} className="p-4 bg-gray-100 rounded-lg shadow-md flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-2 text-gray-700">{venueName}</h3>
              <img
                src={venue.image}
                alt={venueName}
                className="w-full h-40 object-cover rounded-md mb-4"
              />
              <button
                className={`w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200 ${
                  inJail || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => stealCar(venueName)}
                disabled={inJail || isLoading}
              >
                {isLoading ? 'Stealing...' : 'Steal Car'}
              </button>
            </div>
          );
        })}
      </div>

      {successMessage && (
        <div className="mt-6 p-4 bg-green-200 text-green-800 rounded-md text-center">
          {successMessage}
        </div>
      )}
      {failureMessage && (
        <div className="mt-6 p-4 bg-red-200 text-red-800 rounded-md text-center">
          {failureMessage}
        </div>
      )}

      {inJail && (
        <div className="mt-6 p-6 bg-yellow-100 text-yellow-800 rounded-lg flex flex-col items-center">
          <p className="text-lg font-semibold">You are in jail!</p>
          <p className="text-md mt-2">Jail time left: {jailTime} seconds.</p>
          <img
            src="/assets/jailpic.jpg"
            alt="Jail"
            className="w-64 h-64 object-cover mt-4 rounded-md"
          />
        </div>
      )}

      <div className="mt-6 text-center">
        <button
          className="bg-gray-700 text-white px-6 py-3 rounded-full hover:bg-gray-800 transition duration-200"
          onClick={toggleGarage}
        >
          {showGarage ? 'Hide Garage' : 'Show Garage'}
        </button>
        {showGarage && (
          <div className="mt-6 bg-gray-50 p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Your Garage</h3>
            {stolenCars.length > 0 ? (
              <ul className="space-y-4">
                {stolenCars.map((car, index) => (
                  <li key={index} className="flex items-center justify-between bg-white p-4 rounded-md shadow">
                    <div className="flex items-center">
                      <img
                        src={car.image}
                        alt={car.name}
                        className="w-20 h-20 object-cover rounded-md mr-4"
                      />
                      <div>
                        <p className="text-xl font-medium text-gray-700">{car.name}</p>
                        <p className="text-gray-500">${car.price}</p>
                      </div>
                    </div>
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200"
                      onClick={() => sellCar(index)}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : 'Sell'}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No cars in your garage.</p>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-xl text-gray-800">
          Money: <span className="font-bold">${money}</span>
        </p>
      </div>

      <div className="mt-6 text-center">
        <button
          className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition duration-200"
          onClick={handleCheat}
        >
          Cheat
        </button>
      </div>
    </div>
  );
};

export default CarTheft;
