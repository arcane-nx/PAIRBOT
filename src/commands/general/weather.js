/**
 * Modularized by Antigravity
 */
const originalCommand = /**
   * Created By EmmyHenz
   * Contact Me on wa.me/2349125042727
*/

const axios = require('axios');

async function (sock, chatId, city) {
    try {
        const apiKey = '4902c0f2550f58298ad4146a92b65e10';  // Replace with your OpenWeather API Key
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const weather = response.data;
        const weatherText = `Weather in ${weather.name}: ${weather.weather[0].description}. Temperature: ${weather.main.temp}°C.`;
        await sock.sendMessage(chatId, { text: weatherText });
    } catch (error) {
        console.error('Error fetching weather:', error);
        await sock.sendMessage(chatId, { text: 'Sorry, I could not fetch the weather right now.' });
    }
};


module.exports = {
    name: 'weather',
    async exec(sock, chatId, msg, args) {
        return originalCommand(sock, chatId, msg, args);
    }
};