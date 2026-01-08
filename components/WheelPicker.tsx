import React, { useEffect, useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { EmblaCarouselType } from "embla-carousel";
import styles from "./WheelPicker.module.css";

interface WheelPickerProps<T> {
    options: { label: string; value: T }[];
    value: T;
    onChange: (value: T) => void;
    className?: string;
    style?: React.CSSProperties;
    loop?: boolean;
}

const ITEM_HEIGHT = 32; // Sync with CSS

export function WheelPicker<T>({ options, value, onChange, className, style, loop = false }: WheelPickerProps<T>) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        axis: "y",
        dragFree: true, // Allow fling
        loop,
        skipSnaps: false,
        containScroll: false,
    });

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState("");
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Sync external value to scroll position
    useEffect(() => {
        const index = options.findIndex((o) => o.value === value);
        if (index !== -1 && emblaApi) {
            if (emblaApi.selectedScrollSnap() !== index) {
                emblaApi.scrollTo(index);
            }
            setSelectedIndex(index);
        }
    }, [value, emblaApi, options]);

    // Handle User Scroll (Settling)
    const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
        const index = emblaApi.selectedScrollSnap();
        setSelectedIndex(index);
        const option = options[index];
        if (option) {
            onChange(option.value);
        }
    }, [options, onChange]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);

        emblaApi.reInit();
    }, [emblaApi, onSelect]);

    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();

        if (!emblaApi) return;

        if (Math.abs(e.deltaY) < 10) return;

        if (e.deltaY > 0) {
            emblaApi.scrollNext();
        } else {
            emblaApi.scrollPrev();
        }
    }, [emblaApi]);

    // Attach native listener with passive: false to allow preventDefault
    useEffect(() => {
        if (!emblaApi) return;
        const node = emblaApi.rootNode();
        if (!node) return;

        node.addEventListener('wheel', handleWheel, { passive: false });
        return () => node.removeEventListener('wheel', handleWheel);
    }, [emblaApi, handleWheel]);

    // Handle click on selected item to enable editing
    const handleSelectedClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
        setEditValue(options[selectedIndex]?.label || "");
    };

    // Focus input when editing starts
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    // Handle input submission
    const handleInputSubmit = () => {
        const trimmed = editValue.trim();

        // Find matching option by label
        const matchIndex = options.findIndex(opt =>
            opt.label.toLowerCase() === trimmed.toLowerCase()
        );

        if (matchIndex !== -1) {
            onChange(options[matchIndex].value);
            if (emblaApi) {
                emblaApi.scrollTo(matchIndex);
            }
        }

        setIsEditing(false);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleInputSubmit();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
        }
    };

    return (
        <div
            className={`${styles.embla} ${className || ""}`}
            style={style}
            ref={emblaRef}
        >
            <div className={styles.emblaContainer} style={{ paddingTop: '84px', paddingBottom: '84px' }}>
                {options.map((option, index) => (
                    <div
                        key={index}
                        className={`${styles.emblaSlide} ${index === selectedIndex ? styles.emblaSlideSelected : ""}`}
                        onClick={(e) => {
                            if (index === selectedIndex) {
                                handleSelectedClick(e);
                            } else if (emblaApi) {
                                emblaApi.scrollTo(index);
                            }
                        }}
                    >
                        {index === selectedIndex && isEditing ? (
                            <input
                                ref={inputRef}
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={handleInputSubmit}
                                onKeyDown={handleInputKeyDown}
                                className={styles.editInput}
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            option.label
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
