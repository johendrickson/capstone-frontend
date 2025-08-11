import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserPlants, deleteUserPlant } from "../api/plants";
import type { UserPlant } from "./types";
import FooterBanner from "../components/FooterBanner";
import Header from "../components/Header";
import "../styles/Dashboard.css";
import HeadingWithSvg from "../components/HeadingWithSvg";
import { getUserProfile } from "../api/users";
import { defaultPlantIcon } from "../constants/images";
import { API_BASE_URL } from "../constants/api";

const weatherIcon = '/assets/weather.svg';
const gardenIcon = '/assets/garden.svg';
const addPlantIcon = '/assets/add-plant-icon.svg';

type Tag = {
  id: number;
  name: string;
};

function Dashboard() {
  const userId = localStorage.getItem("plantpal_user_id");
  const navigate = useNavigate();

  const scrollRef = useRef(null);
  const [isWaterTodayLeftScrollAvail, setIsWaterTodayLeftScrollAvail] = useState(false);
  const [isWaterTodayRightScrollAvail, setIsWaterTodayRightScrollAvail] = useState(false);

  const handleScroll = () => {
    if (scrollRef.current) {
      // console.log(scrollRef)
      const { scrollLeft, scrollLeftMax, scrollWidth, clientWidth, clientLeft, offsetLeft, offsetWidth } = scrollRef.current;
      // console.log({
      //   scrollLeft,
      //   scrollLeftMax,
      //   scrollWidth,
      //   clientWidth,
      //   clientLeft,
      //   offsetLeft,
      //   offsetWidth,
      // });

      const isLeftScrollAvailable = scrollLeft !== 0;
      const isRightScrollAvailableStable = scrollLeft !== scrollLeftMax;
      const isRightScrollAvailable = scrollLeft + clientWidth !== scrollWidth;

      if (isLeftScrollAvailable !== isWaterTodayLeftScrollAvail) {
        setIsWaterTodayLeftScrollAvail(isLeftScrollAvailable);
      }

      if (isRightScrollAvailable !== isWaterTodayRightScrollAvail) {
        setIsWaterTodayRightScrollAvail(isRightScrollAvailable);
      }
    }
  };

  const [plants, setPlants] = useState<UserPlant[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<UserPlant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(localStorage.getItem("plantpal_user_name"));
  const [gardenName, setGardenName] = useState<string | null>(localStorage.getItem("plantpal_garden_name"));

  const [weather, setWeather] = useState<string | null>(null);
  const [zipCode, setZipCode] = useState<string | null>(localStorage.getItem("plantpal_zip_code"));

  // 🔍 Search inputs
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");

  // 🏷️ All available tags
  const [allTags, setAllTags] = useState<Tag[]>([]);

  useEffect(() => {
    if (userId) {
      setLoading(true);
      getUserPlants(parseInt(userId))
        .then((data) => {
          setPlants(data);
          setFilteredPlants(data);
          setError(null);
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load plants.");
        })
        .finally(() => setLoading(false));
    }
  }, [userId]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/tags`);
        const data = await res.json();
        setAllTags(data.tags || []);
      } catch (err) {
        console.error("Failed to fetch tags", err);
      }
    };

    fetchTags();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (userId && (!localStorage.getItem("plantpal_user_name") || !localStorage.getItem("plantpal_garden_name"))) {
          const user = await getUserProfile(parseInt(userId));
          if (user.name) {
            localStorage.setItem("plantpal_user_name", user.name);
            setName(user.name);
          }
          if (user.garden_name) {
            localStorage.setItem("plantpal_garden_name", user.garden_name);
            setGardenName(user.garden_name);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    };

    fetchUserData();
  }, [userId]);

  useEffect(() => {
    const fetchWeather = async (zip: string) => {
      try {
        const res = await fetch(`${API_BASE_URL}/weather?zip=${zip}`);
        const contentType = res.headers.get("content-type");

        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Non-JSON response:", text);
          throw new Error("Invalid JSON response from weather API");
        }

        const data = await res.json();
        setWeather(`${data.temp}°F and ${data.description} in ${data.zip_code}`);
      } catch (err) {
        console.error("Failed to fetch weather:", err);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "plantpal_zip_code" && e.newValue) {
        setZipCode(e.newValue);
        fetchWeather(e.newValue);
      }
    };

    const currentZip = localStorage.getItem("plantpal_zip_code");
    if (currentZip) {
      setZipCode(currentZip);
      fetchWeather(currentZip);
    }

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // 🔍 Handle search filtering
  useEffect(() => {
    let filtered = plants;

    if (searchTerm.trim()) {
      filtered = filtered.filter((p) =>
        (p.plant?.common_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.plant?.scientific_name || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTag) {
      filtered = filtered.filter((p) =>
        p.tags?.some((tag: Tag) => tag.name === selectedTag)
      );
    }

    setFilteredPlants(filtered);
  }, [searchTerm, selectedTag, plants]);

  const plantsThatNeedWaterToday = plants.filter((userPlant) => {
    const wateringSchedule = userPlant.watering_schedule;

    if (!wateringSchedule) return false;
    if (!wateringSchedule.last_watered) return true;

    const lastWateredDate = new Date(wateringSchedule.last_watered);
    const nextWateredDay: number = lastWateredDate.getDay() + wateringSchedule.frequency_days;
    const todayDay: number = new Date().getDay();

    return (
      nextWateredDay === todayDay
      || lastWateredDate.getDay() === todayDay
    );
  });

  const handleDelete = async (plantId: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this plant?");
    if (confirmed) {
      try {
        await deleteUserPlant(plantId);
        setPlants((prev) => prev.filter((p) => p.id !== plantId));
      } catch (err) {
        console.error(err);
        setError("Failed to delete plant.");
      }
    }
  };

  return (
    <div className="Dashboard page">
      <Header />
      <main className="Dashboard-content">
        <HeadingWithSvg text={gardenName || "Dashboard"} />
        <p>
          Welcome to your plant dashboard, {name || "Gardener"}! Manage your plants, explore care options, and help them thrive.
        </p>

        {
          error && (
            <div>
              <p>{error}</p>
            </div>
          )
        }

        {weather && (
          <div className="weather-section">
            <p className="weather-display">{weather}</p>
            <img src={weatherIcon} alt="Weather icon" className="weather-icon" />
          </div>
        )}

        {userId && (
          <>
            <h2>Water Today</h2>
            {/* Future list of plants to water can go here */}
            {
              loading && plants.length === 0 && (
                <div>
                  <p>Loading...</p>
                </div>
              )
            }
            {
              plantsThatNeedWaterToday.length > 0 && (
                <ul
                  className={`water-today ${isWaterTodayLeftScrollAvail && isWaterTodayRightScrollAvail ? 'both-available' : (isWaterTodayLeftScrollAvail ? 'left-available' : (isWaterTodayRightScrollAvail ? 'right-available' : ''))}`}
                  onScroll={(e) => {
                    console.log(e)
                    handleScroll()
                  }}
                  ref={scrollRef}
                >
                  {
                    plantsThatNeedWaterToday.map(userPlant => (
                      <li>
                        <img
                          src={userPlant.plant?.image_url || defaultPlantIcon}
                          alt=''
                        />
                        {userPlant.plant?.common_name || userPlant.plant?.scientific_name || "Plant"}
                      </li>
                    ))
                  }
                </ul>
              )
            }
            {
              !loading && plantsThatNeedWaterToday.length === 0 && (
                <div>
                  <p>No plants to water. The only one you must keep hydrated today is yourself. 😎</p>
                </div>
              )
            }


            <h2>Plants</h2>
            <img src={gardenIcon} alt="Garden icon" className="garden-icon" />

            {/* 🔍 Search UI */}
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="tag-select"
              >
                <option value="">All tags</option>
                {allTags.map((tag) => (
                  <option key={tag.id} value={tag.name}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>

            <ul className="plant-gallery">
              <li
                className="plant-card add-plant-card"
                onClick={() => navigate("/plants/add")}
                style={{ cursor: "pointer" }}
              >
                <img src={addPlantIcon} alt="Add Plant" className="plant-image" />
                <div className="plant-details">
                  <strong>Add Plant</strong>
                </div>
              </li>
              {filteredPlants.map((plant) => (
                <li
                  key={plant.id}
                  className="plant-card"
                  onClick={() => navigate(`/plants/${plant.id}/edit`)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={plant.plant?.image_url || defaultPlantIcon}
                    alt={plant.plant?.common_name || plant.plant?.scientific_name || "Plant"}
                    className="plant-image"
                  />
                  <div className="plant-details">
                    <strong>{plant.plant?.common_name || plant.plant?.scientific_name || "Unnamed Plant"}</strong>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
      <FooterBanner />
    </div>
  );
}

export default Dashboard;
