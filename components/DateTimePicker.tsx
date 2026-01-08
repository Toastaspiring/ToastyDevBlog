import React, { useMemo } from "react";
import { getDaysInMonth, setMonth, setYear, setDate, setHours, setMinutes } from "date-fns";
import { WheelPicker } from "./WheelPicker";
import styles from "./DateTimePicker.module.css";

interface DateTimePickerProps {
    date?: Date;
    onChange: (date: Date) => void;
    disabled?: boolean;
}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const AMPM = ["AM", "PM"];

export function DateTimePicker({ date, onChange, disabled }: DateTimePickerProps) {
    // Normalize date: if undefined, treat UI as if it's "now", but don't call onChange until selection?
    // User said "defaults to system date".
    // So for the WHEELS, we use 'date || new Date()'.

    const safeDate = date || new Date();

    // Deconstruct
    const year = safeDate.getFullYear();
    const month = safeDate.getMonth(); // 0-11
    const day = safeDate.getDate(); // 1-31
    const hour24 = safeDate.getHours();
    const minute = safeDate.getMinutes();

    const isPM = hour24 >= 12;
    const hour12 = hour24 % 12 || 12; // 0 -> 12

    // Option Generators
    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear - 5; i <= currentYear + 20; i++) {
            years.push({ label: i.toString(), value: i });
        }
        return years;
    }, []);

    const monthOptions = useMemo(() => MONTHS.map((m, i) => ({ label: m, value: i })), []);

    const dayOptions = useMemo(() => {
        const daysInMonth = getDaysInMonth(safeDate);
        return Array.from({ length: daysInMonth }, (_, i) => ({
            label: (i + 1).toString(), // "1st", "2nd" logic could vary but "1" is safe
            value: i + 1
        }));
    }, [safeDate.getFullYear(), safeDate.getMonth()]); // Only recompute when month/year changes

    const hourOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
        label: (i + 1).toString(),
        value: i + 1
    })), []);

    const minuteOptions = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
        label: i.toString().padStart(2, '0'),
        value: i
    })), []);

    const ampmOptions = useMemo(() => AMPM.map(v => ({ label: v, value: v })), []);


    // Handlers
    const handleYearChange = (newYear: number) => {
        const newDate = setYear(safeDate, newYear);
        onChange(newDate);
    };

    const handleMonthChange = (newMonthIndex: number) => {
        // Handling day overflow automatically? date-fns setMonth might clamp?
        // JS Date overflow behaves like: Jan 31 -> Set Month Feb -> Mar 3 (or Feb 28/29).
        // Use date-fns setMonth: it clamps to last day of month usually? 
        // Wait, date-fns `setMonth` behaviors: "If the new month has fewer days than the current month, the date is set to the last day of the new month." -> Correct.
        const newDate = setMonth(safeDate, newMonthIndex);
        onChange(newDate);
    };

    const handleDayChange = (newDay: number) => {
        const newDate = setDate(safeDate, newDay);
        onChange(newDate);
    };

    const handleHourChange = (newHour12: number) => {
        // Current isPM?
        // If was PM, and we pick 3, it becomes 15 (3 PM).
        // If was AM, and we pick 3, it becomes 3 (3 AM).
        // Special case: 12. 
        // 12 AM is 0. 12 PM is 12.

        let newHour24 = newHour12;

        if (newHour12 === 12) {
            newHour24 = isPM ? 12 : 0;
        } else {
            newHour24 = isPM ? newHour12 + 12 : newHour12;
        }

        const newDate = setHours(safeDate, newHour24);
        onChange(newDate);
    };

    const handleMinuteChange = (newMinute: number) => {
        const newDate = setMinutes(safeDate, newMinute);
        onChange(newDate);
    };

    const handleAMPMChange = (newVal: string) => {
        if (newVal === "AM" && isPM) {
            // Switch to AM
            // 13 -> 1. 12 -> 0.
            const newDate = setHours(safeDate, hour24 - 12);
            onChange(newDate);
        } else if (newVal === "PM" && !isPM) {
            // Switch to PM
            // 1 -> 13. 0 -> 12.
            const newDate = setHours(safeDate, hour24 + 12);
            onChange(newDate);
        }
    };

    return (
        <div className={styles.datePickerContainer}>
            <div className={styles.wheelsWrapper}>
                <div className={styles.selectionHighlight} />

                {/* Month */}
                <WheelPicker
                    options={monthOptions}
                    value={month}
                    onChange={handleMonthChange}
                    style={{ flex: '2.5 1 0%' }}
                    loop
                />
                {/* Day */}
                <WheelPicker
                    options={dayOptions}
                    value={day}
                    onChange={handleDayChange}
                    style={{ flex: '1 1 0%' }}
                    loop
                />
                {/* Year */}
                <WheelPicker
                    options={yearOptions}
                    value={year}
                    onChange={handleYearChange}
                    style={{ flex: '1.2 1 0%' }}
                />
                {/* Hour */}
                <WheelPicker
                    options={hourOptions}
                    value={hour12}
                    onChange={handleHourChange}
                    style={{ flex: '0.7 1 0%' }}
                    loop
                />
                {/* Minute */}
                <WheelPicker
                    options={minuteOptions}
                    value={minute}
                    onChange={handleMinuteChange}
                    style={{ flex: '0.7 1 0%' }}
                    loop
                />
                {/* AM/PM */}
                <WheelPicker
                    options={ampmOptions}
                    value={isPM ? "PM" : "AM"}
                    onChange={handleAMPMChange}
                    style={{ flex: '0.7 1 0%' }}
                />
            </div>
        </div>
    );
}
