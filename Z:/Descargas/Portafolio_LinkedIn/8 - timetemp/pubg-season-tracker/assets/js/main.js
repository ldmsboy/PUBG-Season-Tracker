/**
 * PUBG Season Tracker
 * Main JavaScript file
 * 
 * This file handles the season timer countdown and advertisement management system.
 * For production, use the minified version (main.min.js) generated with Terser.
 */

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// Global state
let seasonData = null;
let countdownInterval = null;

/**
 * Initialize the application
 */
function initApp() {
    initAdState();
    loadSeasonData();
}

/**
 * Advertisement Management System
 * Uses a master switch approach with body.ads-hidden
 */
function initAdState() {
    const toggleButton = document.getElementById('toggle-ads-btn');
    const isVisible = localStorage.getItem('pubgAdsVisible') !== 'false';
    
    setAdState(isVisible);
    toggleButton.addEventListener('click', toggleAds);
    updateToggleButton(isVisible);
}

/**
 * Sets the advertisement visibility state
 * @param {boolean} isVisible - Whether ads should be visible
 */
function setAdState(isVisible) {
    // Use the body class as a master switch
    if (isVisible) {
        document.body.classList.remove('ads-hidden');
    } else {
        document.body.classList.add('ads-hidden');
    }
    
    updateToggleButton(isVisible);
    localStorage.setItem('pubgAdsVisible', isVisible);
}

/**
 * Updates the toggle button appearance based on ad visibility
 * @param {boolean} isVisible - Current visibility state of ads
 */
function updateToggleButton(isVisible) {
    const toggleButton = document.getElementById('toggle-ads-btn');
    toggleButton.textContent = isVisible ? 'Hide Ads' : 'Show Ads';
    
    // Toggle button gradient colors
    if (isVisible) {
        toggleButton.classList.remove('from-blue-600', 'to-purple-600');
        toggleButton.classList.add('from-red-600', 'to-pink-600');
    } else {
        toggleButton.classList.remove('from-red-600', 'to-pink-600');
        toggleButton.classList.add('from-blue-600', 'to-purple-600');
    }
}

/**
 * Toggles the advertisement visibility state
 */
function toggleAds() {
    const currentState = localStorage.getItem('pubgAdsVisible') !== 'false';
    setAdState(!currentState);
}

/**
 * Season Data Management
 */
async function loadSeasonData() {
    try {
        const response = await fetch('season.json');
        if (!response.ok) throw new Error('Failed to load season data');
        
        seasonData = await response.json();
        
        // Convert string dates to Date objects
        seasonData.startDate = new Date(seasonData.startDate);
        seasonData.endDate = new Date(seasonData.endDate);
        
        initializePage();
        
        // Start countdown if season hasn't ended
        if (new Date() < seasonData.endDate) {
            countdownInterval = setInterval(updateCountdown, 1000);
        } else {
            showSeasonEnded();
        }
    } catch (error) {
        console.error('Error loading season data:', error);
        document.getElementById('season-title').textContent = 'Error loading season data';
    }
}

/**
 * Page Initialization
 */
function initializePage() {
    document.getElementById('season-title').textContent = seasonData.seasonName;
    
    const dateOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    };
    
    const startDateStr = seasonData.startDate.toLocaleDateString(undefined, dateOptions);
    const endDateStr = seasonData.endDate.toLocaleDateString(undefined, dateOptions);
    
    document.getElementById('date-info').innerHTML = `
        Start: ${startDateStr}<br>
        End: ${endDateStr}
    `;
}

/**
 * Countdown Management
 */
function updateCountdown() {
    const now = new Date();
    const timeRemaining = seasonData.endDate - now;
    
    if (timeRemaining <= 0) {
        showSeasonEnded();
        return;
    }
    
    // Calculate time units
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    
    // Update timer display
    document.getElementById('timer').textContent = 
        `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update subtitle
    document.getElementById('timer-subtitle').textContent = 
        `${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds remaining`;
    
    // Update progress bar
    updateProgressBar(now);
}

function updateProgressBar(currentDate) {
    const totalDuration = seasonData.endDate - seasonData.startDate;
    const elapsed = currentDate - seasonData.startDate;
    const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
    
    document.getElementById('progress-bar').style.width = `${progress}%`;
    document.getElementById('progress-percent').textContent = `${Math.round(progress)}%`;
}

function showSeasonEnded() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    document.getElementById('timer').textContent = '00:00:00:00';
    document.getElementById('timer-subtitle').textContent = 'Â¡Season Ended!';
    document.getElementById('progress-bar').style.width = '100%';
    document.getElementById('progress-percent').textContent = '100%';
}