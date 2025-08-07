import FooterBanner from "../components/FooterBanner";
import Header from "../components/Header";
import '../styles/GettingStarted.css';
import HeadingWithSvg from "../components/HeadingWithSvg";

function GettingStarted() {
  const backgroundUrl = '/assets/nature_glow.jpg'; // Ensure this image is in your public/assets folder

  return (
    <div
      className="GettingStarted page"
      style={{ backgroundImage: `url(${backgroundUrl})` }}
    >
      <Header />

      <div className="split-pane">
        <div className="reading-pane">
          <HeadingWithSvg text="Getting Started" />

          <ol>
            <li>
              <strong>Create an Account</strong><br />
              Click “Login” in the top navigation, then select “Create an account.” Use a valid email address — this is where you’ll receive your plant care reminders and weather alerts. <br />
              <em>Make sure it’s one you check regularly, so you never miss a watering day or important update!</em>
            </li>

            <li>
              <strong>Add Your First Plant</strong><br />
              Once logged in, click “Add Plant” from your dashboard. Start typing the scientific name of your plant — Plant Pal will suggest matches to help autofill details like watering needs and light preferences.<br />
              <em>Pro tip: Using the scientific name gives you the most accurate care info, but don’t worry, we’ll guide you through it!</em>
            </li>

            <li>
              <strong>Set Up Alerts</strong><br />
              Create personalized watering schedules based on AI-generated care data, and get email notifications about weather conditions like frost or dry heat that could affect your plants.
            </li>

            <li>
              <strong>Build Your Collection</strong><br />
              Add as many plants as you want! Manage them easily from your dashboard — update details, remove plants, or view them by category.
            </li>

            <li>
              <strong>Stay In the Loop</strong><br />
              All your reminders and alerts will come straight to your inbox.
            </li>

            <li>
              <strong>Grow with Confidence</strong><br />
              Whether you’re just starting out or already a plant enthusiast, Plant Pal supports you in growing a healthy indoor garden.
            </li>
          </ol>

          <p>Ready to get growing? Let’s get started!</p>
        </div>
      </div>

      <FooterBanner />
    </div>
  );
}

export default GettingStarted;
