window.addEventListener("load", () => {
    document.querySelector(".container").classList.add("show")
})

const API_KEY = "17edb9bb3cde218a1e4a4b7c12cfb408"

const form = document.getElementById("weather-form")
const input = document.getElementById("city-input")

const locationEl = document.getElementById("location")
const tempEl = document.getElementById("temperature")
const descEl = document.getElementById("description")
const humidityEl = document.getElementById("humidity")
const windEl = document.getElementById("wind")
const feelsEl = document.getElementById("feels")

const errorEl = document.getElementById("error-message")

const savedCity = localStorage.getItem("city") || "London"

getWeather(savedCity)
getForecast(savedCity)

form.addEventListener("submit", (e) => {
    e.preventDefault()

    const city = input.value.trim()

    if (!city) return

    getWeather(city)
    getForecast(city)

    localStorage.setItem("city", city)
    input.value = ""
})

function getWeather(city) {
    errorEl.textContent = ""
    locationEl.textContent = "Loading..."
    tempEl.textContent = "--"
    descEl.textContent = "--"
    humidityEl.textContent = "--"
    windEl.textContent = "--"
    feelsEl.textContent = "--"

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`)
        .then((res) => res.json())
        .then((data) => {

            if (data.cod !== 200) {
                errorEl.textContent = "City not found"
                return
            }

            locationEl.textContent = data.name
            tempEl.textContent = Math.round(data.main.temp) + "°C"
            descEl.textContent = data.weather[0].description
            humidityEl.textContent = data.main.humidity + "%"
            windEl.textContent = data.wind.speed + " m/s"
            feelsEl.textContent = Math.round(data.main.feels_like) + "°C"

            setIcon(data.weather[0].main)

            const isNight = data.weather[0].icon.includes("n")
            document.body.classList.toggle("night", isNight)
        })
        .catch(() => {
            errorEl.textContent = "Something went wrong. Please try again."
        })
}

function getForecast(city) {
    const forecastEl = document.getElementById("forecast")
    forecastEl.innerHTML = "Loading..."

    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`)
        .then((res) => res.json())
        .then((data) => {

            if (data.cod !== "200") {
                errorEl.textContent = "City not found"
                return
            }

            forecastEl.innerHTML = ""

            const daily = data.list.filter((item) =>
                item.dt_txt.includes("12:00:00")
            )

            daily.slice(0, 5).forEach((day, index) => {
                const date = new Date(day.dt_txt)
                const dayName = date.toLocaleDateString("en-US", {
                    weekday: "short"
                })

                const temp = Math.round(day.main.temp)
                const icon = getIconFile(day.weather[0].main)

                const card = document.createElement("div")
                card.classList.add("day-card")

                card.innerHTML = `
                    <div class="day">${dayName}</div>
                    <img src="icons/${icon}" alt="Weather forecast icon" />
                    <div class="day-temp">${temp}°</div>
                `

                forecastEl.appendChild(card)

                // stagger animation delay
                setTimeout(() => {
                    card.classList.add("show")
                }, index * 100)
            })
        })
        .catch(() => {
            alert("Something went wrong. Please try again.")
        })
}

function setIcon(condition) {
    document.getElementById("icon").src = `icons/${getIconFile(condition)}`
}

function getIconFile(condition) {
    const map = {
        Clear: "sun.svg",
        Clouds: "cloud.svg",
        Rain: "cloud-showers-heavy.svg",
        Drizzle: "cloud-rain.svg",
        Thunderstorm: "bolt.svg",
        Snow: "snowflake.svg",
        Mist: "smog.svg",
        Fog: "smog.svg"
    }

    return map[condition] || "cloud.svg"
}