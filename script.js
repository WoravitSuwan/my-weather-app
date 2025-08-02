    const apiKey = 'e1a6c05373adf8b0a9f8b334cc0bd645';
    const form = document.getElementById('search-form');
    const cityInput = document.getElementById('city-input');
    const weatherContainer = document.getElementById('weather-info-container');
    const forecastContainer = document.getElementById('forecast-container');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const city = cityInput.value.trim();
      if (!city) return alert('กรุณาป้อนชื่อเมือง');

      weatherContainer.innerHTML = `<p>⏳ กำลังโหลดข้อมูล...</p>`;
      forecastContainer.innerHTML = '';

      try {
        const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`);
        const geoData = await geoRes.json();
        if (!geoData.length) throw new Error('ไม่พบชื่อเมืองนี้');

        const { lat, lon, name } = geoData[0];

        const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=th`);
        const currentData = await currentRes.json();

        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=th`);
        const forecastData = await forecastRes.json();

        displayCurrent(name, currentData);
        displayForecast(forecastData.list);
      } catch (err) {
        weatherContainer.innerHTML = `<p class="error">❌ ${err.message}</p>`;
      }
    });

    function displayCurrent(city, data) {
      const { temp, humidity } = data.main;
      const { description, icon } = data.weather[0];

      weatherContainer.innerHTML = `
        <h2>${city}</h2>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
        <p class="temp">${temp.toFixed(1)}°C</p>
        <p>${description}</p>
        <p>💧 ความชื้น: ${humidity}%</p>
      `;
    }

    function displayForecast(list) {
      const dailyMap = new Map();

      list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyMap.has(date) && item.dt_txt.includes('12:00:00')) {
          dailyMap.set(date, item);
        }
      });

      let html = '';
      Array.from(dailyMap.entries()).slice(0, 5).forEach(([date, item]) => {
        const day = new Date(date).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'numeric' });
        html += `
          <div class="forecast-card">
            <h3>${day}</h3>
            <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].description}">
            <p class="temp">${item.main.temp.toFixed(1)}°C</p>
            <p>${item.weather[0].description}</p>
          </div>
        `;
      });

      forecastContainer.innerHTML = html;
    }
