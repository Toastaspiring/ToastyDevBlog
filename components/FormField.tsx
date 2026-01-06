import React from "react";
import styles from "./FormField.module.css";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  error,
  description,
  children,
  className,
}) => {
  return (
    <div className={`${styles.container} ${className || ""}`}>
      <div className={styles.labelContainer}>
        <label htmlFor={htmlFor} className={styles.label}>
          {label}
        </label>
        {error && <p className={styles.error}>{error}</p>}
      </div>
      {children}
      {description && !error && (
        <p className={styles.description}>{description}</p>
      )}
    </div>
  );
};