const MainContainer = document.querySelector(".main-container");
const Input = document.querySelector(".search_input");
const Button = document.querySelector(".search_btn");
const headerText = document.querySelector(".header_text");
const headerDate = document.querySelector(".header_Date");
const CurrentTemp = document.querySelector(".current-temperature");
const MainImg = document.querySelector(".main_image");
const CurrentStats = document.querySelector(".current-stats");
const WeatherByHr = document.querySelector(".weather-by-hour");
const NextFive = document.querySelector(".next-5-days");
const InitialText = document.querySelector(".initial_text");
const currentTempValue = document.querySelector(".current-temperature__value");
const dailyValueMax = document.querySelector(".daily_value_max");
const dailyValueMin = document.querySelector(".daily_value_min");
const currentWind = document.querySelector(".current_wind_speed");
const currentRain = document.querySelector(".current_rain_stat");
const sunriseTime = document.querySelector(".sunrise_time");
const sunsetTime = document.querySelector(".sunset_time");
const weatherByHrContainer = document.querySelector(
  ".weather-by-hour__container"
);
const hourlyTemp = document.querySelectorAll(".weather-by-hour__hour");
const hourlyImg = document.querySelectorAll(".hourly_img");
const hourlyTimeStr = document.querySelectorAll(".hourly_time_str");
const fiveDayContainer = document.querySelector(".next-5-days__container");
const currentLocationBtn = document.querySelector(".Current_location");
const Loader = document.querySelector(".loader");
const DropDownContainer = document.querySelector(".dropdown-content");
const dropdownElem = document.querySelector(".dropbtn");

headerText.style.display = "none";
headerDate.style.display = "none";
CurrentTemp.style.display = "none";
CurrentStats.style.display = "none";
WeatherByHr.style.display = "none";
NextFive.style.display = "none";

let RecentItem;
let isRecent = "false";
let IsCurrent = "false";
let isError = false;
let recentItems = {};
const handleErr = (err) => {
  InitialText.textContent = err;
};

const success = async (position) => {
  const req = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&current=temperature_2m,is_day,rain,wind_speed_10m&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,rain_sum,wind_speed_10m_max`
  );

  const resData = await req.json();

  RenderScrn(resData);
};
const error = (error) => {
  console.log(error);
};

currentLocationBtn.addEventListener("click", () => {
  InitialText.style.display = "none";
  Loader.style.display = "block";
  IsCurrent = "true";
  navigator.geolocation.getCurrentPosition(success, error);
  Loader.style.display = "none";
});

const data = async () => {
  Button.addEventListener("click", async () => {
    try {
      const geoReq = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${Input.value}&count=10&language=en&format=json`
      );

      const getLatLong = await geoReq.json();

      InitialText.style.display = "none";
      Loader.style.display = "block";
      IsCurrent = "false";
      const req = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${getLatLong.results[0].latitude}&longitude=${getLatLong.results[0].longitude}&current=temperature_2m,is_day,rain,wind_speed_10m&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,rain_sum,wind_speed_10m_max`
      );

      const resData = await req.json();

      RenderScrn(resData);

      addRecentSearch(`${Input.value}`);

      Loader.style.display = "none";
    } catch (error) {
      handleErr("Please Provide Correct Info!");
      Loader.style.display = "none";
      InitialText.style.display = "block";
    }
  });
};

data();

const timeStr = (timeString) => {
  return new Date("1970-01-01T" + timeString + "Z").toLocaleTimeString(
    "en-US",
    {
      timeZone: "UTC",
      hour12: true,
      hour: "numeric",
      minute: "numeric",
    }
  );
};

const RenderScrn = (res) => {
  const imgSelector =
    res.current.rain !== 0
      ? `<img src="../icons/mostly-sunny.svg" />`
      : `<img src="../icons/sunny.svg" />`;

  if (IsCurrent === "true") {
    headerText.textContent = "Your Location";
  } else if (isRecent === "true") {
    headerText.textContent = RecentItem;
  } else {
    headerText.textContent = Input.value;
  }

  headerText.style.display = "block";
  headerDate.style.display = "block";

  CurrentTemp.style.display = "block";
  CurrentStats.style.display = "flex";
  WeatherByHr.style.display = "block";
  NextFive.style.display = "block";

  let options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  var today = new Date(res.current.time);
  const DateData = today.toLocaleDateString("en-US", options);

  const dateArr = DateData.split(" ");

  headerDate.innerHTML = `<div class="header_Date">${dateArr[0]} ${dateArr[2]}  ${dateArr[3]}</div>`;
  currentTempValue.textContent = `${res.current.temperature_2m}${res.current_units.temperature_2m}`;

  dailyValueMax.textContent = `${res.daily.temperature_2m_max[0]}${res.current_units.temperature_2m}`;
  dailyValueMin.textContent = `${res.daily.temperature_2m_min[6]}${res.current_units.temperature_2m}`;
  currentWind.textContent = `${res.current.wind_speed_10m}${res.current_units.wind_speed_10m}`;
  currentRain.textContent = `${res.current.rain}${res.current_units.rain}`;

  const timeSunrise = `${res.daily.sunrise[0].slice(-5)}`;
  const timeSunset = `${res.daily.sunset[0].slice(-5)}`;
  sunriseTime.textContent = timeStr(timeSunrise);
  sunsetTime.textContent = timeStr(timeSunset);

  const hourlyArr = res.hourly.temperature_2m.slice(-7);
  const hourlyTime = res.hourly.time.slice(-7);

  hourlyArr.forEach((elem, i) => {
    hourlyTemp[i].textContent = `${elem}${res.hourly_units.temperature_2m.slice(
      0,
      1
    )}`;
    hourlyImg.src = imgSelector;
    hourlyTimeStr[i].textContent = `${timeStr(hourlyTime[i].slice(-5))}`;
  });

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  res.daily.time.forEach((elem, i) => {
    const dateFiveDays = new Date(elem);
    const getFiveDays = days[dateFiveDays.getDay()];

    const fiveDaysList = document.createElement("div");
    fiveDaysList.classList.add("next-5-days__row");
    fiveDayContainer.appendChild(fiveDaysList);

    fiveDaysList.innerHTML = `<div class="next-5-days__date">
      ${getFiveDays}
      <div class="next-5-days__label">${elem}</div>
    </div>

    <div class="next-5-days__low">
      ${res.daily.temperature_2m_min[i]}${res.daily_units.temperature_2m_max}
      <div class="next-5-days__label">Temperature</div>
    </div>

    <div class="next-5-days__icon">
 ${imgSelector}
   </div>

    <div class="next-5-days__rain">
      ${res.daily.rain_sum[i]}${res.daily_units.rain_sum}
      <div class="next-5-days__label">Rain</div>
    </div>

    <div class="next-5-days__wind">
      ${res.daily.wind_speed_10m_max[i]}${res.daily_units.wind_speed_10m_max}
      <div class="next-5-days__label">Wind</div>
    </div>`;
  });
};

const addRecentSearch = (searchTerm) => {
  let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];

  if (!recentSearches.includes(searchTerm)) {
    recentSearches.unshift(searchTerm);

    if (recentSearches.length > 10) {
      recentSearches.pop();
    }

    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
  }
};

const getRecentSearches = () => {
  return JSON.parse(localStorage.getItem("recentSearches")) || [];
};

const SearchList = getRecentSearches();

if (SearchList.length !== 0) {
  SearchList.forEach((elem, i) => {
    const Links = document.createElement("a");
    Links.style.cursor = "pointer";
    DropDownContainer.appendChild(Links);
    Links.textContent = elem;
    Links.addEventListener("click", async () => {
      const geoReq = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${elem}&count=10&language=en&format=json`
      );

      const getLatLong = await geoReq.json();

      InitialText.style.display = "none";
      Loader.style.display = "block";
      isRecent = "true";
      RecentItem = elem;

      const req = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${getLatLong.results[0].latitude}&longitude=${getLatLong.results[0].longitude}&current=temperature_2m,is_day,rain,wind_speed_10m&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,rain_sum,wind_speed_10m_max`
      );

      const resData = await req.json();
      RenderScrn(resData);
      Loader.style.display = "none";
    });
  });
} else {
  dropdownElem.style.display = "none";
}
