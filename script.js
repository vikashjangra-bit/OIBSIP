(function() {
    "use strict";

    // DOM elements
    const inputField = document.getElementById('temperatureInput');
    const convertBtn = document.getElementById('convertBtn');
    const celsiusResult = document.getElementById('celsiusResult');
    const fahrenheitResult = document.getElementById('fahrenheitResult');
    const kelvinResult = document.getElementById('kelvinResult');
    const errorMsg = document.getElementById('errorMsg');
    const errorText = document.getElementById('errorText');
    const inputUnitBadge = document.getElementById('inputUnitBadge');
    const radioButtons = document.querySelectorAll('input[name="scale"]');

    // Get selected scale
    function getSelectedScale() {
        for (const radio of radioButtons) {
            if (radio.checked) return radio.value;
        }
        return 'C';
    }

    // Update unit badge
    function updateUnitBadge(scale) {
        const symbolMap = { 'C': '°C', 'F': '°F', 'K': 'K' };
        inputUnitBadge.textContent = symbolMap[scale] || '°C';
    }

    // Radio change handlers
    for (const radio of radioButtons) {
        radio.addEventListener('change', function() {
            if (this.checked) {
                updateUnitBadge(this.value);
                hideError();
            }
        });
    }

    // Error handling
    function showError(message) {
        errorText.textContent = message || 'Please enter a valid number';
        errorMsg.classList.add('show');
    }

    function hideError() {
        errorMsg.classList.remove('show');
    }

    // Format number
    function formatNumber(num) {
        if (!isFinite(num)) return '∞';
        const rounded = Math.round(num * 100) / 100;
        if (Number.isInteger(rounded)) return rounded.toString();
        return rounded.toFixed(2);
    }

    // Main conversion
    function handleConvert() {
        hideError();

        const raw = inputField.value.trim();
        if (raw === '') {
            showError('Please enter a temperature value');
            return;
        }

        const numberPattern = /^-?\d+(\.\d+)?$/;
        if (!numberPattern.test(raw)) {
            showError('Enter a valid number (e.g., 25.5 or -10)');
            return;
        }

        const numericValue = parseFloat(raw);
        if (isNaN(numericValue) || !isFinite(numericValue)) {
            showError('Invalid number');
            return;
        }

        const fromScale = getSelectedScale();
        let celsius, fahrenheit, kelvin;

        // Convert to all scales
        if (fromScale === 'C') {
            celsius = numericValue;
            fahrenheit = (numericValue * 9 / 5) + 32;
            kelvin = numericValue + 273.15;
        } else if (fromScale === 'F') {
            celsius = (numericValue - 32) * 5 / 9;
            fahrenheit = numericValue;
            kelvin = (numericValue - 32) * 5 / 9 + 273.15;
        } else if (fromScale === 'K') {
            celsius = numericValue - 273.15;
            fahrenheit = (numericValue - 273.15) * 9 / 5 + 32;
            kelvin = numericValue;
        }

        // Display results
        celsiusResult.textContent = formatNumber(celsius);
        fahrenheitResult.textContent = formatNumber(fahrenheit);
        kelvinResult.textContent = formatNumber(kelvin);

        // Check for invalid results
        if (!isFinite(celsius) || !isFinite(fahrenheit) || !isFinite(kelvin)) {
            showError('Conversion resulted in invalid value');
            celsiusResult.textContent = '—';
            fahrenheitResult.textContent = '—';
            kelvinResult.textContent = '—';
        }
    }

    // Event listeners
    convertBtn.addEventListener('click', handleConvert);

    inputField.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleConvert();
        }
    });

    inputField.addEventListener('input', hideError);

    // Auto-convert on load
    updateUnitBadge(getSelectedScale());
    window.addEventListener('load', function() {
        if (inputField.value.trim() !== '') {
            handleConvert();
        }
    });

})();