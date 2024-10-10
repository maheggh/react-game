import React, { useState, useEffect, useRef } from 'react';
import styles from './Gambling.module.css'; // Assuming your CSS is here

const GamblingPage = () => {
  const canvasRef = useRef(null); // Reference for the wheel canvas
  const resultTextRef = useRef(null); // Reference for result text
  const [money, setMoney] = useState(parseInt(localStorage.getItem('money')) || 0);
  const [angVel, setAngVel] = useState(0);
  const [ang, setAng] = useState(0); // Angle in radians
  const [resultHandled, setResultHandled] = useState(false);
  const [spinning, setSpinning] = useState(false); // Keep track of whether the wheel is spinning

  const sectors = [
    { color: '#C71585', label: '300' },
    { color: '#FFB6C1', label: '50' },
    { color: '#FF69B4', label: '100' },
    { color: '#8B008B', label: '400' },
    { color: '#FF1493', label: '200' },
    { color: '#4B0082', label: '500' },
    { color: '#FFD1DC', label: '10' }
  ];

  const friction = 0.991; // Reduced friction to make the wheel spin longer
  const TAU = 2 * Math.PI;
  const arc = TAU / sectors.length;

  const spinWheel = () => {
    if (!spinning && angVel === 0) { // Only allow spinning if it's not already spinning
      if (money >= 250) {
        setMoney(prevMoney => {
          const newMoney = prevMoney - 250;
          localStorage.setItem('money', newMoney);
          return newMoney;
        });
        setAngVel(Math.random() * 0.3 + 0.3); // Set a random initial angular velocity
        setResultHandled(false); // Reset result handled
        setSpinning(true); // Mark that the wheel is spinning
        resultTextRef.current.textContent = ''; // Clear the result text
      } else {
        resultTextRef.current.textContent = 'Not enough money to spin.';
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dia = ctx.canvas.width;
    const rad = dia / 2;

    const drawSector = (sector, i) => {
      const ang = arc * i;
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = sector.color;
      ctx.moveTo(rad, rad);
      ctx.arc(rad, rad, rad, ang, ang + arc);
      ctx.lineTo(rad, rad);
      ctx.fill();
      ctx.translate(rad, rad);
      ctx.rotate(ang + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(sector.label, rad - 10, 10);
      ctx.restore();
    };

    const rotateWheel = () => {
      const sector = sectors[getIndex()];
      canvas.style.transform = `rotate(${ang - Math.PI / 2}rad)`;
      if (angVel < 0.002 && !resultHandled) {
        handleResult(sector); 
        setResultHandled(true); 
        setSpinning(false); 
        setAngVel(0); 
      }
    };

    const getIndex = () => {
      return Math.floor(sectors.length - (ang / TAU) * sectors.length) % sectors.length;
    };

    const updateWheel = () => {
      if (angVel) {
        setAngVel(prev => prev * friction); 
        setAng(prev => (prev + angVel) % TAU); 
      }
      rotateWheel();
    };

    sectors.forEach(drawSector); 
    rotateWheel();

    const interval = setInterval(updateWheel, 1000 / 60);
    return () => clearInterval(interval); 
  }, [angVel, ang, resultHandled]); 

  const handleResult = (sector) => {
    let winningAmount = parseInt(sector.label);
    if (!isNaN(winningAmount)) {
      setMoney(prevMoney => {
        const newMoney = prevMoney + winningAmount;
        localStorage.setItem('money', newMoney);
        return newMoney;
      });
      resultTextRef.current.textContent = `Congratulations! You won $${winningAmount}!`;
    } else {
      resultTextRef.current.textContent = 'Spin to win!';
    }
  };

  return (
    <div className={styles.gamblingContainer}>
      <h2>Wheel of Fortune</h2>
      <p>Your Balance: ${money}</p>
      <p>Ticket cost: $250</p>

      <div className={styles.wheelContainer}>
        <canvas ref={canvasRef} width="400" height="400"></canvas> 
        <button id="spin" className={styles.spinButton} onClick={spinWheel} disabled={spinning}>
          Spin the Wheel
        </button>
      </div>

      <p id="resultText" ref={resultTextRef}></p>
    </div>
  );
};

export default GamblingPage;
