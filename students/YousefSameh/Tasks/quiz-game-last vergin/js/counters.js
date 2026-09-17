function animateCounters() {
    const counters = document.querySelectorAll(".stat-num");
    const duration = 1400; 
    counters.forEach((counter) => {
        const target = parseInt(counter.getAttribute("data-target"), 10);
        const startTime = performance.now();
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = Math.floor(eased * target);

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                counter.textContent = target;
            }
        }
        requestAnimationFrame(update);
    });
}
document.addEventListener("DOMContentLoaded", animateCounters);
