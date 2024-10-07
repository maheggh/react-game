import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../components/Navbar.module.css"; // Import CSS module

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.navbar}>
        {/* Desktop Menu */}
        <nav className={`${styles.desktopMenu}`}>
          <Link to="/" className={styles.navLink}>
            Home of Potato
          </Link>
          <Link to="/cartheft" className={styles.navLink}>
            Car Theft
          </Link>
          <Link to="/theft" className={styles.navLink}>
            Theft
          </Link>
          <Link to="/carraces" className={styles.navLink}>
            Car Races
          </Link>
          <Link to="/smuggling" className={styles.navLink}>
            Smuggling
          </Link>
          <Link to="/assassination" className={styles.navLink}>
            Assassination
          </Link>
          <Link to="/store" className={styles.navLink}>
            Weapon Store
          </Link>
          <Link to="/score" className={styles.navLink}>
            Score
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button className={styles.menuButton} onClick={toggleMenu}>
          <div className={`${styles.bar} ${isMenuOpen ? styles.bar1Open : ""}`} />
          <div className={`${styles.bar} ${isMenuOpen ? styles.bar2Open : ""}`} />
          <div className={`${styles.bar} ${isMenuOpen ? styles.bar3Open : ""}`} />
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <nav className={styles.mobileMenu}>
          <Link to="/" className={styles.mobileLink} onClick={toggleMenu}>
            Home of Potato
          </Link>
          <Link to="/cartheft" className={styles.mobileLink} onClick={toggleMenu}>
            Car Theft
          </Link>
          <Link to="/theft" className={styles.mobileLink} onClick={toggleMenu}>
            Theft
          </Link>
          <Link to="/carraces" className={styles.mobileLink} onClick={toggleMenu}>
            Car Races
          </Link>
          <Link to="/smuggling" className={styles.mobileLink} onClick={toggleMenu}>
            Smuggling
          </Link>
          <Link to="/assassination" className={styles.mobileLink} onClick={toggleMenu}>
            Assassination
          </Link>
          <Link to="/store" className={styles.mobileLink} onClick={toggleMenu}>
            Weapon Store
          </Link>
          <Link to="/score" className={styles.mobileLink} onClick={toggleMenu}>
            Score
          </Link>
        </nav>
      )}
    </header>
  );
};

export default NavBar;
