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
