async function fetchCoinPrices() {
    try {
        const response = await fetch('http://localhost:3000/coins/getBTC');
        const data = await response.json();
        
        // Display the data
        const container = document.getElementById('coin-prices');
        container.innerHTML = `
            <div class="coin">
                <h2>Bitcoin</h2>
       
            </div>
        `;
    } catch (error) {
        console.error('Error fetching prices:', error);
        document.getElementById('coin-prices').innerHTML = '<p>Error loading prices</p>';
    }
}

// Fetch prices when page loads
fetchCoinPrices();

// Refresh every 30 seconds
setInterval(fetchCoinPrices, 30000);