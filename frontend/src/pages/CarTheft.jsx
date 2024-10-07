import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const CarTheft = () => {
  const { user } = useContext(AuthContext); // Get user info to determine rank
  const [stolenCars, setStolenCars] = useState(
    JSON.parse(localStorage.getItem('stolenCars')) || []
  );
  const [money, setMoney] = useState(
    parseInt(localStorage.getItem('money')) || 0
  );
  const [inJail, setInJail] = useState(
    localStorage.getItem('inJail') === 'true'
  );
  const [jailTime, setJailTime] = useState(
    parseInt(localStorage.getItem('jailTime')) || 30
  );
  const [successMessage, setSuccessMessage] = useState('');
  const [failureMessage, setFailureMessage] = useState('');
  const [attemptedBreakout, setAttemptedBreakout] = useState(false);
  const [showGarage, setShowGarage] = useState(false);

  // Dynamic steal chance adjustment based on rank
  const rank = user && user.rank ? user.rank : 1;

  // Adjusting steal chances and values for each venue
  const venues = {
    'Rich Potato Neighborhood': {
      cars: [
        { name: 'Luxury Spud Sedan', price: 120000, baseChance: 5, image: '/assets/luxury-spud-sedan.png' },
        { name: 'Sporty Tater Coupe', price: 40000, baseChance: 8, image: '/assets/sporty-tater-coupe.png' },
        { name: 'Potato Convertible', price: 30000, baseChance: 10, image: '/assets/potato-convertible.png' },
        { name: 'SUV Spud', price: 2000, baseChance: 20, image: '/assets/suv-spud.png' }
      ],
      image: '/assets/rich.png', // Neighbourhood image
      baseStealChance: 5 // Base chance for the rich neighbourhood
    },
    'Spudville Downtown': {
      cars: [
        { name: 'Hatchback Tuber', price: 1500, baseChance: 20, image: '/assets/hatchback-tuber.png' },
        { name: 'Sedan Yam', price: 20000, baseChance: 10, image: '/assets/sedan-yam.png' },
        { name: 'SUV Tater', price: 25000, baseChance: 8, image: '/assets/suv-tater.png' },
        { name: 'Spudnik Sports', price: 90000, baseChance: 4, image: '/assets/spudnik-sports.png' }
      ],
      image: '/assets/downtown.png', // Neighbourhood image
      baseStealChance: 10
    },
    'Fries End Suburbs': {
      cars: [
        { name: 'Compact Fry', price: 10000, baseChance: 25, image: '/assets/compact-fry.png' },
        { name: 'Curly Coupe', price: 15000, baseChance: 20, image: '/assets/curly-coupe.png' },
        { name: 'Wedge Wagon', price: 20000, baseChance: 15, image: '/assets/wedge-wagon.png' },
        { name: 'Crispy Convertible', price: 110000, baseChance: 5, image: '/assets/crispy-convertible.png' }
      ],
      image: '/assets/fries.png', // Neighbourhood image
      baseStealChance: 15
    },
    'Mashy Meadows': {
      cars: [
        { name: 'Mashed Mini', price: 500, baseChance: 30, image: '/assets/mashed-mini.png' },
        { name: 'Buttery Buggy', price: 8000, baseChance: 20, image: '/assets/buttery-buggy.png' },
        { name: 'Gravy Sedan', price: 12000, baseChance: 15, image: '/assets/gravy-sedan.png' },
        { name: 'Peeler Pickup', price: 18000, baseChance: 5, image: '/assets/peeler-pickup.png' }
      ],
      image: '/assets/mashy.png', // Neighbourhood image
      baseStealChance: 20
    },
    'Tuber Town': {
      cars: [
        { name: 'Root Roadster', price: 7000, baseChance: 30, image: '/assets/root-roadster.png' },
        { name: 'Bulb Buggy', price: 10000, baseChance: 25, image: '/assets/bulb-buggy.png' },
        { name: 'Starch Sedan', price: 15000, baseChance: 15, image: '/assets/starch-sedan.png' },
        { name: 'Tuber Truck', price: 60000, baseChance: 5, image: '/assets/tuber-truck.png' }
      ],
      image: '/assets/tuber.png', // Neighbourhood image
      baseStealChance: 25
    }
  };

  useEffect(() => {
    // Save to localStorage when state updates
    localStorage.setItem('stolenCars', JSON.stringify(stolenCars));
    localStorage.setItem('money', money.toString());
    localStorage.setItem('inJail', inJail.toString());
    localStorage.setItem('jailTime', jailTime.toString());
  }, [stolenCars, money, inJail, jailTime]);

  const calculateStealChance = (baseChance) => {
    // Make sure the steal chance is capped at 90% max to keep the game balanced
    const adjustedChance = baseChance + rank * 2;
    return Math.min(adjustedChance, 90);
  };

  const stealCar = (venueName) => {
    if (inJail) {
      setFailureMessage('You cannot steal cars while in jail!');
      return;
    }
  
    const venue = venues[venueName];
  
    // Make sure baseStealChance is valid
    if (!venue || typeof venue.baseStealChance !== 'number') {
      console.error(`Invalid base steal chance for ${venueName}`);
      setFailureMessage('Invalid venue data.');
      return;
    }
  
    const stealChance = calculateStealChance(venue.baseStealChance); // Calculate based on rank
    const carRoll = Math.floor(Math.random() * 100) + 1;
  
    console.log(`Steal attempt at ${venueName} with a steal chance of ${stealChance}%`);
    console.log(`Random roll: ${carRoll}`);
  
    if (carRoll <= stealChance) {
      const car = getRandomCar(venue.cars);
      setStolenCars((prevCars) => [...prevCars, car]);
      setSuccessMessage(`You successfully stole a ${car.name}!`);
      setFailureMessage('');
    } else {
      const failureRoll = Math.random() * 100;
      if (failureRoll <= 30) {
        setFailureMessage(getCarTheftFailureScenario());
      } else {
        setFailureMessage('You got caught and sent to jail!');
        sendToJail();
      }
      setSuccessMessage('');
    }
  };

  const getRandomCar = (cars) => {
    let totalChance = cars.reduce((sum, car) => sum + car.baseChance, 0); // Sum all car chances
    let randomNum = Math.random() * totalChance; // Get a random number within that total range
  
    for (let car of cars) {
      if (randomNum < car.baseChance) {
        return car; // Return the car that matches the random number
      }
      randomNum -= car.baseChance; // Subtract car's chance from random number
    }
  
    return cars[cars.length - 1]; // Fallback to last car (though this should not happen)
  };

  // **Add this function**: Generates random car theft failure scenarios
  const getCarTheftFailureScenario = () => {
    const scenarios = [
      "Your tools broke during the theft.",
      "A security guard appeared, forcing you to flee.",
      "The car alarm went off, attracting attention.",
      "You were spotted by a passerby and had to abandon the attempt."
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

  const toggleGarage = () => setShowGarage(!showGarage);

  const cheat = () => {
    console.log('Cheat activated: Free from jail, extra money!');
    setInJail(false);
    setMoney((prevMoney) => prevMoney + 50000);
  };

  const sellCar = (index) => {
    const car = stolenCars[index];
    setMoney((prevMoney) => prevMoney + car.price);
    setStolenCars(stolenCars.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Car Theft</h2>

      {/* Venue section */}
      <div className="grid grid-cols-3 gap-4">
        {Object.keys(venues).map((venueName, index) => {
          const venue = venues[venueName];
          return (
            <div key={index} className="p-4 bg-gray-100 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">{venueName}</h3>
              <img
                src={venue.image}
                alt={venueName}
                className="w-full h-auto my-2"
              />
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
                onClick={() => stealCar(venueName)}
              >
                Steal Car
              </button>
            </div>
          );
        })}
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

      {/* Garage section */}
      <div className="mt-4">
        <button
          className="bg-gray-600 text-white px-4 py-2 rounded-md"
          onClick={toggleGarage}
        >
          {showGarage ? 'Hide Garage' : 'Show Garage'}
        </button>
        {showGarage && (
          <ul className="mt-4">
            {stolenCars.length > 0 ? (
              stolenCars.map((car, index) => (
                <li key={index} className="flex items-center">
                  <img
                    src={car.image}
                    alt={car.name}
                    style={{ width: '100px', marginRight: '10px' }}
                  />
                  <span>{car.name} - ${car.price}</span>
                  <button
                    className="bg-green-500 text-white px-4 py-2 ml-4 rounded-md"
                    onClick={() => sellCar(index)}
                  >
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

export default CarTheft;
