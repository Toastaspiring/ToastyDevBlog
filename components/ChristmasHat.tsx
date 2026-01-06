import React from 'react';
import styles from './ChristmasHat.module.css';

interface ChristmasHatProps {
  /**
   * Optional additional class names for positioning and sizing.
   */
  className?: string;
}

/**
 * A festive, cartoony Christmas hat component rendered as an image.
 * It's designed to be placed on top of other elements for a seasonal touch.
 */
export const ChristmasHat: React.FC<ChristmasHatProps> = ({ className }) => {
  return (
    <img
      src="https://assets.floot.app/578507bd-acbf-4233-8ad5-78b4a4ebe5fb/de12ba5c-316f-4269-8826-99f9b19f082a.png"
      alt=""
      className={`${styles.hat} ${className ?? ''}`}
      aria-hidden="true" // Decorative element
    />
  );
};