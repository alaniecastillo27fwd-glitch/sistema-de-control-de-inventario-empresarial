import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

/**
 * Componente Temporizador Regresivo (Countdown Timer)
 * Calcula y actualiza en tiempo real los días, horas, minutos y segundos restantes.
 * @param {Object} props
 * @param {string} props.targetDate - Fecha final de la oferta (ISO String)
 * @param {Function} [props.onExpire] - Callback opcional al vencer
 */
export function CountdownTimer({ targetDate, onExpire }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    isUrgent: false, // Menos de 48 horas
  });

  useEffect(() => {
    if (!targetDate) return;

    const calculateTime = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          isUrgent: false,
        });
        if (onExpire) onExpire();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const totalHours = diff / (1000 * 60 * 60);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
        isUrgent: totalHours <= 48,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  if (timeLeft.isExpired) {
    return (
      <div className="countdown-box-wrapper" style={{ opacity: 0.7 }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--accent-rose)', fontWeight: 700 }}>
          Oferta Finalizada
        </span>
      </div>
    );
  }

  return (
    <div className={`countdown-box-wrapper ${timeLeft.isUrgent ? 'expiring-soon' : ''}`}>
      <div className="countdown-label">
        <Clock size={13} color={timeLeft.isUrgent ? 'var(--color-gold-600)' : 'var(--text-secondary)'} />
        <span>{timeLeft.isUrgent ? '¡Termina pronto!' : 'Termina en:'}</span>
      </div>

      <div className="countdown-digits">
        {timeLeft.days > 0 && (
          <div className="countdown-unit">
            <span className="countdown-num">{timeLeft.days}</span>
            <span className="countdown-txt">Días</span>
          </div>
        )}
        <div className="countdown-unit">
          <span className="countdown-num">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="countdown-txt">Hs</span>
        </div>
        <div className="countdown-unit">
          <span className="countdown-num">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="countdown-txt">Min</span>
        </div>
        <div className="countdown-unit">
          <span className="countdown-num" style={{ color: timeLeft.isUrgent ? 'var(--color-gold-600)' : 'inherit' }}>
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="countdown-txt">Seg</span>
        </div>
      </div>
    </div>
  );
}

export default CountdownTimer;
