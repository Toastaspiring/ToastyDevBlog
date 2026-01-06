import React, { useState, useEffect } from "react";
import { useNextEventQuery } from "../helpers/useNextEventQuery";
import { Skeleton } from "./Skeleton";
import { ChristmasHat } from "./ChristmasHat";
import styles from "./EventCountdown.module.css";
import { Calendar, Clock } from "lucide-react";

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

  if (isFetching) {
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
      {/* <ChristmasHat className={styles.christmasHat} /> */}
      {/* Commented out hat as it fits winter theme, but maybe not stars. User didn't ask to remove it explicitly from the *event* view, but the snow was in the 'no event' view. The hat is in the 'event' view. I will leave the hat alone in the main view for now unless it conflicts. Wait, lines 152 has the hat?
      Actually, the user replaced "snow in the event section". The snow was ONLY in the !nextEvent (no event) section.
      The Hat is in the `nextEvent` (has event) section.
      I'll focus on the `!nextEvent` section first.
      */}
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

const StarrySky = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Array<{ x: number; y: number; radius: number; alpha: number; speed: number }> = [];

    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        initStars();
      }
    };

    const initStars = () => {
      stars = [];
      const numStars = Math.floor((canvas.width * canvas.height) / 4000); // Density
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5,
          alpha: Math.random(),
          speed: Math.random() * 0.05 + 0.01
        });
      }
    };

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(Math.sin(Date.now() * 0.001 * star.speed + star.x)) * 0.8 + 0.2})`;
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
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
};