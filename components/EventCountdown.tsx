import React, { useState, useEffect } from "react";
import { useNextEventQuery } from "../helpers/useNextEventQuery";
import { Skeleton } from "./Skeleton";
import { ChristmasHat } from "./ChristmasHat";
import styles from "./EventCountdown.module.css";
import { Calendar, Clock } from "lucide-react";
import { useGlobalLoading } from "../helpers/GlobalLoadingContext";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const calculateTimeLeft = (targetDate: Date): TimeLeft | null => {
  const difference = +targetDate - +new Date();
  if (difference <= 0) {
    return null;
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

const CountdownTimer: React.FC<{ eventDate: Date }> = ({ eventDate }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() =>
    calculateTimeLeft(eventDate)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(eventDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [eventDate]);

  if (!timeLeft) {
    return <div className={styles.eventStarted}>Event has started!</div>;
  }

  return (
    <div className={styles.timer}>
      <div className={styles.timerSegment}>
        <span className={styles.timerValue}>{timeLeft.days}</span>
        <span className={styles.timerLabel}>Days</span>
      </div>
      <div className={styles.timerSeparator}>:</div>
      <div className={styles.timerSegment}>
        <span className={styles.timerValue}>
          {String(timeLeft.hours).padStart(2, "0")}
        </span>
        <span className={styles.timerLabel}>Hours</span>
      </div>
      <div className={styles.timerSeparator}>:</div>
      <div className={styles.timerSegment}>
        <span className={styles.timerValue}>
          {String(timeLeft.minutes).padStart(2, "0")}
        </span>
        <span className={styles.timerLabel}>Minutes</span>
      </div>
      <div className={styles.timerSeparator}>:</div>
      <div className={styles.timerSegment}>
        <span className={styles.timerValue}>
          {String(timeLeft.seconds).padStart(2, "0")}
        </span>
        <span className={styles.timerLabel}>Seconds</span>
      </div>
    </div>
  );
};

export const EventCountdown: React.FC<{ className?: string }> = ({
  className,
}) => {
  const { data: nextEvent, isFetching, error } = useNextEventQuery();
  const { isGlobalLoading } = useGlobalLoading();

  // Show loading skeleton only on initial load (when no data exists yet)
  if (isGlobalLoading || (isFetching && !nextEvent)) {
    return (
      <div className={`${styles.container} ${className || ""}`}>
        <Skeleton style={{ height: "2.5rem", width: "60%", marginBottom: 'var(--spacing-4)' }} />
        <Skeleton style={{ height: "1.25rem", width: "80%", marginBottom: 'var(--spacing-8)' }} />
        <div className={styles.timer}>
          <Skeleton style={{ height: "4rem", width: "5rem" }} />
          <Skeleton style={{ height: "4rem", width: "5rem" }} />
          <Skeleton style={{ height: "4rem", width: "5rem" }} />
          <Skeleton style={{ height: "4rem", width: "5rem" }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.container} ${styles.infoState} ${className || ""}`}>
        <p>Could not load event information.</p>
      </div>
    );
  }

  if (!nextEvent) {
    return (
      <div className={`${styles.container} ${className || ""}`}>
        <div className={styles.winterScene}>
          <StarrySky />
          <div className={styles.ground} />
          <h3>No Upcoming Events</h3>
          <p>Winter is here! Stay warm and tuned for updates.</p>
        </div>
      </div>
    );
  }


  const eventDate = new Date(nextEvent.eventDate);
  const formattedDate = eventDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <StarrySky />
      <div className={styles.ground} />
      <h2 className={styles.title}>{nextEvent.title}</h2>
      {nextEvent.description && (
        <p className={styles.description}>{nextEvent.description}</p>
      )}
      <div className={styles.eventMeta}>
        <div className={styles.metaItem}>
          <Calendar size={16} />
          <span>{formattedDate}</span>
        </div>
        <div className={styles.metaItem}>
          <Clock size={16} />
          <span>{formattedTime}</span>
        </div>
      </div>
      <CountdownTimer eventDate={eventDate} />
    </div>
  );
};

// Optimized StarrySky component
const StarrySky = React.memo(() => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency in basic buffer if possible, though we use rgba
    if (!ctx) return;

    let animationFrameId: number;
    // Pre-allocate stars array size if consistent, or just simple array is fine
    let stars: Array<{ x: number; y: number; radius: number; speed: number; offset: number }> = [];

    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        initStars();
      }
    };

    const initStars = () => {
      stars = [];
      const numStars = Math.floor((canvas.width * canvas.height) / 4000);
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5,
          speed: Math.random() * 0.05 + 0.01,
          offset: Math.random() * Math.PI * 2 // Random starting phase for twinkling
        });
      }
    };

    const draw = () => {
      if (!ctx || !canvas) return;

      // Clear with solid color is faster than clearRect + background, but we need transparent overlay?
      // Actually we just clear rect.
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const now = Date.now();

      ctx.fillStyle = '#FFFFFF'; // Set color once

      // Batch drawing? 
      // Individual path calls are expensive in JS loop but unavoidable for circles with different opacities.
      // Optimization: Group stars by opacity? Too complex for this.
      // Just use globalAlpha.

      stars.forEach(star => {
        ctx.beginPath();
        const alpha = Math.abs(Math.sin(now * 0.001 * star.speed + star.offset)) * 0.8 + 0.2;
        ctx.globalAlpha = alpha; // Much faster than parsing rgba string
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []); // Empty dependency array means it runs once on mount. React.memo prevents re-renders from parent updates.

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
});