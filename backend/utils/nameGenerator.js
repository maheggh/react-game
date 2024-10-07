// utils/nameGenerator.js
const adjectives = ['Scarface', 'Big', 'Fat', 'Lucky', 'Fast', 'Mad', 'Crazy', 'Smokey', 'Sneaky', 'Bulletproof', 'One-Eyed'];
const firstNames = ['Tony', 'Vito', 'Sonny', 'Johnny', 'Paulie', 'Al', 'Vinny', 'Frankie', 'Mikey', 'Joey'];
const lastNames = ['Montana', 'Corleone', 'Capone', 'Gambino', 'Luciano', 'Gotti', 'Lombardi', 'Moretti', 'Falcone', 'Santini'];

// Function to generate random gangster name
const generateRandomGangsterName = () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const randomNumber = Math.floor(Math.random() * 10000); // Add randomness to ensure uniqueness
  return `${adjective} ${firstName} ${lastName} ${randomNumber}`;
};

function generateRandomPassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < 9; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

module.exports = { generateRandomGangsterName, generateRandomPassword };
