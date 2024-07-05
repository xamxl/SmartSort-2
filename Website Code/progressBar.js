function setProgress(percent) {
    const circle = document.querySelector('.progress-ring__circle');
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = `${circumference}`;

    const increment = 0.01;
    const delay = 1;
    let currentPercent = 0;

    const interval = setInterval(() => {
        currentPercent += increment;
        const offset = circumference - (currentPercent / 100) * circumference;
        circle.style.strokeDashoffset = offset;

        if (currentPercent >= percent) {
            clearInterval(interval);
        }
    }, delay);
}

// Example: Set the progress to 100%
setProgress(100);

const message = document.getElementsByClassName('message')[0];
const baseText = 'Sorting, please<br>wait'; // Base text including the line break
let dotCount = 0;
let pauseCount = 0; // Counter to handle pause at three dots

setInterval(() => {
  if (pauseCount > 0) {
    pauseCount--;
    if (pauseCount === 0) dotCount = 0; // Reset after pause
  } else {
    dotCount = (dotCount + 1) % 4;
    pauseCount = (dotCount === 3) ? 3 : 0; // Set pause count on reaching three dots
  }

  let dots = '.'.repeat(dotCount)
  message.innerHTML = baseText + ' ' + dots; // Update HTML with dots
}, 500); // Change interval as needed