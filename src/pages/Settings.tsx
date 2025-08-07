import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import FooterBanner from "../components/FooterBanner";
import HeadingWithSvg from "../components/HeadingWithSvg";
import { updateUser, deleteUser, getUserProfile } from "../api/users";
import "../styles/Settings.css";

const settingsIcon = '/assets/shears.svg';

function SettingsPage() {
  const userId = Number(localStorage.getItem("plantpal_user_id"));
  const savedZip = localStorage.getItem("plantpal_zip_code") || "";
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    zip_code: "",
    garden_name: "Your Garden",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!userId) return;

    getUserProfile(userId)
      .then((user) =>
        setFormData({
          name: user.name || "",
          email: user.email || "",
          zip_code: user.zip_code || "",
          garden_name: user.garden_name || "Your Garden",
        })
      )
      .catch((err) => {
        console.error("Error fetching user data:", err);
        setErrorMessage("Failed to load user info.");
      });
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateUser(userId, formData, savedZip);
      if (updated.zip_code) {
        localStorage.setItem("plantpal_zip_code", updated.zip_code);
        // Dispatch storage event so other tabs/components know zip code changed
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'plantpal_zip_code',
          newValue: updated.zip_code,
        }));
      }
      setSuccessMessage("Account updated successfully.");
      setErrorMessage("");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Something went wrong.");
      setSuccessMessage("");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
      return;
    }

    try {
      await deleteUser(userId);
      localStorage.clear();
      navigate("/login");
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Failed to delete account.");
    }
  };

  return (
    <div className="SettingsPage page">
      <Header />
      <main>
        <HeadingWithSvg text="Account Settings" />
        <form onSubmit={handleSubmit}>
          <div className="fields">
            <label htmlFor="settings-name">Name</label>
            <input id="settings-name" name="name" value={formData.name} onChange={handleChange} />

            <label htmlFor="settings-email">E-mail</label>
            <input
              id="settings-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />

            <label htmlFor="settings-zip">Zip code</label>
            <input
              id="settings-zip"
              name="zip_code"
              value={formData.zip_code}
              onChange={handleChange}
            />
            <small style={{ display: "block", marginTop: "0.5rem", color: "#666" }}>
              Might render outdated data briefly after zip code updates.
            </small>

            <label htmlFor="settings-garden">Garden name</label>
            <input
              id="settings-garden"
              name="garden_name"
              value={formData.garden_name}
              onChange={handleChange}
            />
          </div>

          {errorMessage && <p className="error">{errorMessage}</p>}
          {successMessage && <p className="success">{successMessage}</p>}

          <div className="submit-button">
            <input type="submit" value="Save Changes" />
          </div>
        </form>

        <div className="delete-account">
          <button onClick={handleDelete} className="danger-button">
            Delete My Account
          </button>
        </div>
        <img src={settingsIcon} alt="Settings Icon" className="settings-icon" />
      </main>
      <FooterBanner />
    </div>
  );
}

export default SettingsPage;
