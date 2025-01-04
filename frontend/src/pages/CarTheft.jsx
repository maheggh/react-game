import React, { useState, useEffect } from 'react';

function CarTheft() {
  const [venues, setVenues] = useState([]);
  const [cars, setCars] = useState([]);
  const [inJail, setInJail] = useState(false);
  const [jailTime, setJailTime] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchVenues();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/users/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setCars(data.userData.cars || []);
        if (data.userData.inJail) {
          setInJail(true);
          const left = new Date(data.userData.jailTimeEnd).getTime() - Date.now();
          setJailTime(Math.ceil(Math.max(0, left) / 1000));
        }
      }
    } catch {}
  };

  const fetchVenues = async () => {
    try {
      const res = await fetch('/api/cartheft/venues', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setVenues(data.venues || []);
      }
    } catch {}
  };

  const attemptSteal = async (venueName) => {
    setMessage('');
    try {
      const res = await fetch('/api/cartheft/steal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ venueName })
      });
      const data = await res.json();
      if (res.ok) {
        setCars((prev) => [...prev, data.car]);
        setMessage(data.message);
      } else {
        if (data.inJail) {
          setInJail(true);
          setJailTime(data.jailTime);
        }
        setMessage(data.message);
      }
    } catch {
      setMessage('Error communicating with server.');
    }
  };

  const sellCar = async (index) => {
    setMessage('');
    try {
      const res = await fetch('/api/cartheft/sell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ carIndex: index })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setCars((prev) => {
          const updated = [...prev];
          updated.splice(index, 1);
          return updated;
        });
      } else {
        setMessage(data.message);
      }
    } catch {
      setMessage('Error communicating with server.');
    }
  };

  useEffect(() => {
    if (inJail && jailTime > 0) {
      const timer = setInterval(() => {
        setJailTime((t) => {
          if (t <= 1) {
            clearInterval(timer);
            setInJail(false);
            setMessage('You are free from jail!');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [inJail, jailTime]);

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Car Theft</h1>
      {message && <p>{message}</p>}
      {inJail ? (
        <div>
          <p>You are in jail!</p>
          <p>Jail time left: {jailTime} seconds</p>
        </div>
      ) : (
        <div>
          <h2>Venues</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {venues.map((v, i) => (
              <div key={i} style={{ border: '1px solid #ccc', padding: '1rem' }}>
                <h3>{v.venueName}</h3>
                <img src={v.image} alt="" width="100" />
                <button onClick={() => attemptSteal(v.venueName)} style={{ display: 'block', marginTop: '0.5rem' }}>
                  Steal Car
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <h2 style={{ marginTop: '2rem' }}>Your Cars</h2>
      {cars.length === 0 ? (
        <p>No cars in your garage.</p>
      ) : (
        cars.map((car, index) => (
          <div key={index} style={{ border: '1px solid #ccc', margin: '0.5rem 0', padding: '0.5rem' }}>
            <p>{car.name} - ${car.price}</p>
            <img src={car.image} alt={car.name} width="100" />
            <button onClick={() => sellCar(index)} style={{ marginLeft: '1rem' }}>
              Sell
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default CarTheft;
