import confetti from 'canvas-confetti';

/**
 * Trigger a quick, powerful burst of golden and brand-colored confetti.
 * Perfect for completing a single unit, task, or submitting a quiz successfully.
 */
export function triggerSuccessConfetti() {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 999999 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    
    // Gold, orange, and white colors matching our Bitcoin platform theme
    const colors = ['#fdb813', '#ffffff', '#e28743', '#f2a900'];

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors
    });
  }, 250);
}

/**
 * Trigger a majestic side-to-side continuous firework and school pride celebration.
 * Perfect for completing an entire course or unlocking a verifiable NFT Certificate!
 */
export function triggerMilestoneConfetti() {
  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;
  const colors = ['#fdb813', '#ffffff', '#22c55e', '#3b82f6', '#ec4899'];

  (function frame() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) return;

    // Launch from left edge
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors,
      zIndex: 999999
    });
    
    // Launch from right edge
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors,
      zIndex: 999999
    });

    requestAnimationFrame(frame);
  }());
}
