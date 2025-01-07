import * as webVitals from 'web-vitals';

export const reportWebVitals = (metric) => {
  console.log(metric); // Log or send the metric to your analytics server

  // Send to your local server
  fetch('http://localhost:5000/log-web-vitals', {
    method: 'POST',
    body: JSON.stringify(metric),
    headers: { 'Content-Type': 'application/json' },
  })
    .then((response) => response.json())
    .then((data) => console.log('Data received:', data))
    .catch((error) => console.error('Error sending data:', error));
};

// Track various web vitals
webVitals.onCLS(reportWebVitals);
webVitals.onFID(reportWebVitals);
webVitals.onLCP(reportWebVitals);
webVitals.onFCP(reportWebVitals);
webVitals.onTTFB(reportWebVitals);
