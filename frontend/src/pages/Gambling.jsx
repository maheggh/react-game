import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import styles from './Gambling.module.css';

const sectors = [
  { color: '#C71585', label: '300' },
  { color: '#FFB6C1', label: '50' },
  { color: '#FF69B4', label: '100' },
  { color: '#8B008B', label: '400' },
  { color: '#FF1493', label: '200' },
  { color: '#4B0082', label: '500' },
  { color: '#FFD1DC', label: '10' }
];

const friction = 0.991;
const TAU = 2 * Math.PI;
const arc = TAU / sectors.length;

const GamblingPage = () => {
  const { money, updateUserData } = useContext(AuthContext);
  const canvasRef = useRef(null);
  const resultTextRef = useRef(null);
  const [currentMoney, setCurrentMoney] = useState(money);
  const [angVel, setAngVel] = useState(0);
  const [ang, setAng] = useState(0);
  const [resultHandled, setResultHandled] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const intervalRef = useRef(null);

  const spinWheel = () => {
    if (spinning || currentMoney < 250) {
      resultTextRef.current.textContent = currentMoney < 250 ? 'Not enough money to spin.' : '';
      return;
    }

    const updatedMoney = currentMoney - 250;
    setCurrentMoney(updatedMoney);
    updateUserData({ money: updatedMoney });

    setAngVel(Math.random() * 0.3 + 0.3);
    setResultHandled(false);
    setSpinning(true);
    resultTextRef.current.textContent = '';
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rad = canvas.width / 2;

    const drawSector = (sector, i) => {
      const angle = arc * i;
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = sector.color;
      ctx.moveTo(rad, rad);
      ctx.arc(rad, rad, rad, angle, angle + arc);
      ctx.lineTo(rad, rad);
      ctx.fill();
      ctx.translate(rad, rad);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(sector.label, rad - 10, 10);
      ctx.restore();
    };

    sectors.forEach(drawSector);

    const rotateWheel = () => {
      canvas.style.transform = `rotate(${ang - Math.PI / 2}rad)`;
    };

    const getIndex = () => {
      return Math.floor(sectors.length - (ang / TAU) * sectors.length) % sectors.length;
    };

    const updateWheel = () => {
      setAngVel(prev => {
        const newAngVel = prev * friction;
        if (newAngVel < 0.002 && !resultHandled && spinning) {
          const sector = sectors[getIndex()];
          handleResult(sector);
          setResultHandled(true);
          setSpinning(false);
          return 0;
        }
        return newAngVel;
      });
      setAng(prev => (prev + angVel) % TAU);
      rotateWheel();
    };

    intervalRef.current = setInterval(updateWheel, 1000 / 60);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [ang, angVel, spinning, resultHandled]);

  const handleResult = (sector) => {
    const winningAmount = parseInt(sector.label);
    const updatedMoney = currentMoney + winningAmount;
    setCurrentMoney(updatedMoney);
    updateUserData({ money: updatedMoney });
    resultTextRef.current.textContent = `🎉 Congratulations! You won $${winningAmount}!`;
  };

  return (
    <div className={styles.gamblingContainer}>
      <h2 className={styles.casinoTitle}>🎰 Wheel of Fortune 🎰</h2>
      <p className={styles.balance}>Your Balance: <span className={styles.money}>${currentMoney}</span></p>
      <p className={styles.ticketCost}>Ticket cost: <span className={styles.cost}>$250</span></p>
      <div className={styles.wheelPointer}></div>
      <div className={styles.wheelContainer}>
        <canvas ref={canvasRef} width="400" height="400"></canvas>
      </div>
      <button className={styles.spinButton} onClick={spinWheel} disabled={spinning}>
        Spin the Wheel! yolo
      </button>
      <p className={styles.resultText} ref={resultTextRef}></p>
    </div>
  );
};

export default GamblingPage;
