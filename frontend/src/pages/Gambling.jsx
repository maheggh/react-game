import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function GamblingPage() {
  const { money, updateUserData } = useContext(AuthContext);
  const [currentMoney, setCurrentMoney] = useState(money);
  const [message, setMessage] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [animationAngle, setAnimationAngle] = useState(0);

  useEffect(() => {
    setCurrentMoney(money);
  }, [money]);

  const spinWheel = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setMessage('');
    try {
      const res = await fetch('/api/spin', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setIsSpinning(false);
      if (res.ok) {
        // data.newBalance is now the money AFTER awarding
        updateUserData({ money: data.newBalance });
        setMessage(data.message);
      } else {
        setMessage(data.message || 'Error spinning the wheel.');
      }
    } catch {
      setMessage('Server error.');
      setIsSpinning(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '1rem' }}>
      <h2>Wheel of Fortune</h2>
      <p>Balance: ${currentMoney}</p>
      <p>Ticket cost: $250</p>
      <div
        style={{
          margin: '1rem auto',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: '#ccc',
          position: 'relative',
          transform: `rotate(${animationAngle}deg)`,
          transition: 'transform 0.1s linear'
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderBottom: '20px solid red',
            position: 'absolute',
            top: '-20px',
            left: 'calc(50% - 10px)'
          }}
        />
        <p style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          Spinning...
        </p>
      </div>
      <button onClick={spinWheel} disabled={isSpinning}>
        {isSpinning ? 'Spinning...' : 'Spin'}
      </button>
      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </div>
  );
}

export default GamblingPage;
