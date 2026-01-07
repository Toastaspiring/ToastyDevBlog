"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon, SunMoon } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "./Tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import { Button } from "./Button";
import {
  ThemeMode,
  switchToDarkMode,
  switchToLightMode,
  switchToAutoMode,
  getCurrentThemeMode,
} from "../helpers/themeMode";
import styles from "./ThemeModeSwitch.module.css";

export interface ThemeModeSwitchProps {
  /**
   * Optional CSS class to apply to the component
   */
  className?: string;
}

// Note: if the current style only supports one mode (light or dark), we will need to
// first update the global style to support 2 modes before using this component.
export const ThemeModeSwitch = ({
  className,
}: ThemeModeSwitchProps) => {
  const [currentMode, setCurrentMode] = useState<ThemeMode>("dark");

  // Initialize theme on component mount
  useEffect(() => {
    const initialMode = getCurrentThemeMode();
    setCurrentMode(initialMode);
  }, []);

  const applyThemeMode = (mode: ThemeMode) => {
    if (mode === "dark") {
      switchToDarkMode();
      setCurrentMode(mode);
    }
  };

  const getThemeIcon = () => {
    return currentMode === "dark" ? <Moon className={styles.icon} /> : <Sun className={styles.icon} />;
  };

  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-md"
            aria-label={`Current theme: ${currentMode}. Click to change theme`}
            className={styles.themeButton}
          >
            {getThemeIcon()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <Tooltip open={isTooltipOpen}>
            <TooltipTrigger asChild>
              <div
                onMouseEnter={() => setIsTooltipOpen(true)}
                onMouseLeave={() => setIsTooltipOpen(false)}
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem
                  className={styles.lightOption}
                  onSelect={(e) => e.preventDefault()}
                >
                  <Sun size={16} className={styles.menuIcon} />
                  Light
                </DropdownMenuItem>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">who likes light mode anyway</TooltipContent>
          </Tooltip>
          <DropdownMenuItem
            className={`${currentMode === "dark" ? styles.activeItem : ""} ${styles.darkOption}`}
            onClick={() => applyThemeMode("dark")}
          >
            <Moon size={16} className={styles.menuIcon} />
            Dark
            {currentMode === "dark" && (
              <span className={styles.checkmark}>✓</span>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};