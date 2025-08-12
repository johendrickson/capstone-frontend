import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import HeadingWithSvg from '../components/HeadingWithSvg';
import FooterBanner from '../components/FooterBanner';
import '../styles/WateringReminders.css';
import { getUserProfile } from '../api/users';
import { defaultPlantIcon } from '../constants/images';
import { API_BASE_URL } from '../constants/api';

const wateringCanIcon = '/assets/watering-can.svg';

interface HandleWateringScheduleAdjustmentParams {
  days: number;
  wateringScheduleId: string;
  userPlantIdStr: string;
}

type WateringScheduleFromApi = {
  frequency_days: number;
  id: number;
  last_watered: string;
}

type PlantFromApi = {
  common_name: string;
  edible_parts: string;
  id: number;
  image_url: string;
  is_pet_safe: boolean;
  preferred_soil_conditions: string;
  propagation_methods: string;
  scientific_name: string;
  species: string;
}

type UserPlantFromApi = {
  id: number;
  is_outdoor: boolean;
  plant: PlantFromApi;
  plant_id: number;
  planted_date: number;
  tags: string[];
  watering_records: Date[];
  watering_schedule: WateringScheduleFromApi;
}

type WateringScheduleId = string;

type UserPlantWateringFrequency = {
  id: number;
  days: number;
  lastWatered: Date;
  isLoading: boolean;
  error: null|string;
};

type UserPlantIdToWateringFrequenciesDict = Record<WateringScheduleId, UserPlantWateringFrequency>;

export default function WateringReminders() {
  const [isInitiallyLoadingSchedules, setIsInitiallyLoadingSchedules] = useState<boolean>(true);

  const [isNewReminderSubmissionLoading, setIsNewReminderSubmissionLoading] = useState<boolean>(false);
  const [newReminderFrequency, setNewReminderFrequency] = useState<number>(7);
  const [newReminderUserPlantId, setNewReminderUserPlantId] = useState<number>(0);
  const [newReminderErrorMsg, setNewReminderErrorMsg] = useState<null|string>(null);

  const userIdLocal = Number(localStorage.getItem("plantpal_user_id"));
  const [remindersActive, setRemindersActive] = useState(true);
  const [wateringFrequencies, setWateringFrequencies] = useState<UserPlantIdToWateringFrequenciesDict>({});
  const [userPlants, setUserPlants] = useState<UserPlantFromApi[]>([]);
  const [userId, setUserId] = useState<null|number>(null); // You might be getting this from context/auth
  const [errorMsg, setErrorMsg] = useState<null|string>(null);
  const [lastPullAttempt, setLastPullAttempt] = useState<Date>(new Date());

  useEffect(() => {
    if (!userIdLocal) return;

    getUserProfile(userIdLocal)
      .then((userData) => {
        setRemindersActive(userData.watering_reminders_enabled || true);
        setUserId(userData.id);
      })

      .catch((err) => {
        console.error("Error fetching user data:", err);
        setErrorMsg(err.message);
      });
  }, [userIdLocal]);

  // Get user plants + watering schedule
  useEffect(() => {
    if (!userId) return;
    axios.get(`${API_BASE_URL}/user_plants/all/${userId}`)
      .then((res) => {
        console.log(res)
        setUserPlants(res.data.user_plants);
        console.log('reduce');
        const wateringFrequenciesFromApi: UserPlantIdToWateringFrequenciesDict = res.data.user_plants.reduce(
          (
            acc: UserPlantIdToWateringFrequenciesDict,
            cur: UserPlantFromApi,
          ) => {
            console.log(cur);
            if (cur.watering_schedule) {
              acc[`${cur.id}`] = {
                id: cur.watering_schedule.id,
                days: cur.watering_schedule.frequency_days,
                lastWatered: new Date(cur.watering_schedule.last_watered),
                isLoading: false,
                error: null,
              };
            }

            return acc;
          }, {});

        console.log('reduced');
        console.log(wateringFrequenciesFromApi);
        setWateringFrequencies(wateringFrequenciesFromApi);
        setIsInitiallyLoadingSchedules(false);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [userId, lastPullAttempt]);

  // Toggle watering reminders on/off
  const handleToggle = async () => {
    const newValue = !remindersActive;
    setRemindersActive(newValue);

    await axios.patch(`${API_BASE_URL}/users/${userId}`, {
      watering_reminders_enabled: newValue,
    });
  };

  // Save watering schedule for all user plants
  const handleSetFrequency = async ({
    userPlantIdStr,
    wateringScheduleId,
    days,
  }: HandleWateringScheduleAdjustmentParams) => {
    setWateringFrequencies({
      ...wateringFrequencies,
      [userPlantIdStr]: {
        ...wateringFrequencies[userPlantIdStr],
        isLoading: true,
      },
    });

    await axios.patch(`${API_BASE_URL}/watering_schedules/${wateringScheduleId}`, {
      frequency_days: days,
    })
    .then((data) => {
      setWateringFrequencies({
        ...wateringFrequencies,
        [userPlantIdStr]: {
          ...wateringFrequencies[userPlantIdStr],
          isLoading: false,
          days,
        },
      });
    })
    .catch((err) => {
      setErrorMsg(err.message)
    });
  };

  const userPlantsWithNoReminders = userPlants.filter((plant) => !plant.watering_schedule);

  const onNewReminderSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setNewReminderErrorMsg(null);
    setIsNewReminderSubmissionLoading(true);

    const formData = {
      frequency_days: newReminderFrequency,
      user_plant_id: newReminderUserPlantId,
    };

    let errors = '';

    if (!formData.user_plant_id) {
      errors += 'Plant must be selected. ';
    }

    if (formData.user_plant_id < 0) {
      errors += 'Plant selection is invalid. ';
    }

    if (!formData.frequency_days) {
      errors += 'Watering frequency must be chosen. ';
    }

    if (formData.frequency_days < 1) {
      errors += 'Selected watering frequency invalid. ';
    }

    if (formData.frequency_days > 7) {
      errors += 'Only watering frequencies up to 7 days is supported at this time. ';
    }

    if (errors.length > 0) {
      setNewReminderErrorMsg(errors);
      setIsNewReminderSubmissionLoading(false);
    } else {
      axios.post(`${API_BASE_URL}/watering_schedules`, formData)
        .then((data) => {
          setLastPullAttempt(new Date())
        })
        .catch((err) => {
          setNewReminderErrorMsg(err.message);
        }).finally(() => {
          setIsNewReminderSubmissionLoading(false);
        });
    }
  };

  console.log(userPlantsWithNoReminders);
  return (
    <div className="watering-reminders-page page">
      <Header displaysPlantPalIcon={true} />
      <main>
        <HeadingWithSvg text="Watering Schedule" />
        <p className='hydration'>
          Set up reminders to keep your plants hydrated and healthy.
        </p>
        <img src={wateringCanIcon} alt="Watering Can Icon" className="watering-can-icon" />

        {/* Toggle */}
        <div className='center-toggle'>
          <div className="toggle-container">
            <label className="switch">
              <input type="checkbox" checked={remindersActive} onChange={handleToggle} />
              <span className="slider"></span>
            </label>
            <span className="toggle-status">{remindersActive ? 'Active' : 'Inactive'}</span>
          </div>
        </div>

        {
          errorMsg && (
            <div className='error-msg'>
              {errorMsg}
            </div>
          )
        }

        {
          isInitiallyLoadingSchedules && (
            <div className='loading-text'>
              Loading watering schedules...
            </div>
          )
        }

        {/* Frequency Selection */}

        {
          remindersActive && !isInitiallyLoadingSchedules && userPlantsWithNoReminders.length === 0 && (
            <div>
              Yay, all your plants have watering reminders!
            </div>
          )
        }

        {
          remindersActive && !isInitiallyLoadingSchedules && userPlantsWithNoReminders.length > 0 && (
            <div className='new-watering-reminder'>
              <form onSubmit={(e) => onNewReminderSubmit(e)}>
                <h2>Add a new watering reminder</h2>

                <select
                  name="user_plant_id"
                  id=""
                  onChange={(e) => {
                    setNewReminderUserPlantId(parseInt(e.target.value))
                  }}
                >
                  <option value="">Choose a plant</option>
                  {
                    userPlantsWithNoReminders.map(userPlant => {

                      return (
                        <option value={userPlant.id} key={`new-reminder-opt-${userPlant.id}`}>
                          {userPlant.plant.scientific_name}
                        </option>
                      );
                    })
                  }
                </select>

                <div className={`reminder-tile ${isNewReminderSubmissionLoading ? 'loading' : ''}`}>
                  <div className="reminder-label">Remind me...</div>
                  <div className="reminder-columns">
                    <div className="column">Every</div>
                    <div className="column number-column">
                      {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                        <button
                          key={num}
                          className={`number-option ${newReminderFrequency === num ? 'selected' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            setNewReminderFrequency(num);
                          }}
                          disabled={isNewReminderSubmissionLoading}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <div className="column">day(s)</div>
                  </div>
                </div>
                <div className='actions-and-feedback'>
                  <div>
                    <input
                      type='submit'
                      value={'Create reminder'}
                      disabled={isNewReminderSubmissionLoading}
                    />
                  </div>
                  {
                    newReminderErrorMsg && (
                      <p className='error-msg'>
                        {newReminderErrorMsg}
                      </p>
                    )
                  }
                </div>
              </form>
            </div>
          )
        }
        {
          remindersActive
          && (
            Object.entries(wateringFrequencies).map(([stringId, wateringFreqDict]) => {
              const userPlant = userPlants.find((up) => up.id === parseInt(stringId));
              if (!userPlant) return null;

              return (
                <div
                  key={`water-freq-${stringId}`}
                  className='user-plant-schedules'
                >
                  <ul>
                    <li>
                      <div className='user-plant-desc'>
                        <div>
                          <div className='plant-name'>{userPlant.plant.scientific_name}</div>
                          <img
                            src={userPlant.plant.image_url || defaultPlantIcon}
                            alt=''
                          />
                          <div>
                            <button
                              disabled={wateringFrequencies[stringId].isLoading}
                              onClick={() => {
                                setWateringFrequencies({
                                  ...wateringFrequencies,
                                  [stringId]: {
                                    ...wateringFrequencies[stringId],
                                    isLoading: true,
                                  },
                                });

                                axios.delete(`${API_BASE_URL}/watering_schedules/${wateringFreqDict.id}`)
                                  .then(() => {
                                    // refresh the page info
                                    setLastPullAttempt(new Date());
                                  })
                                  .catch((err) => {
                                    setWateringFrequencies({
                                      ...wateringFrequencies,
                                      [stringId]: {
                                        ...wateringFrequencies[stringId],
                                        isLoading: false,
                                        error: err.message,
                                      },
                                    });
                                  });

                              }}
                            >
                              Remove reminder
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className='plant-water-freq-display'>
                        <div className={`reminder-tile ${wateringFreqDict.isLoading ? 'loading' : ''}`}>
                          <div className="reminder-label">Remind me...</div>
                          <div className="reminder-columns">
                            <div className="column">Every</div>
                            <div className="column number-column">
                              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                                <button
                                  key={num}
                                  className={`number-option ${wateringFreqDict.days === num ? 'selected' : ''}`}
                                  onClick={() => handleSetFrequency({
                                    days: num,
                                    wateringScheduleId:  `${wateringFreqDict.id}`,
                                    userPlantIdStr: stringId,
                                  })}
                                  disabled={wateringFreqDict.isLoading}
                                >
                                  {num}
                                </button>
                              ))}
                            </div>
                            <div className="column">day(s)</div>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              )
            })
          )
        }
        <div className="watering-tip">
          Tip: Expect to water more often in brighter light and less often in lower light
        </div>
      </main>
      <FooterBanner />
    </div>
  );
}
