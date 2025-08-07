import FooterBanner from "../components/FooterBanner";
import Header from "../components/Header";
import '../styles/About.css'; // You can keep using this file unless you want to rename it
import HeadingWithSvg from "../components/HeadingWithSvg";

function About() {
  const backgroundUrl = '/assets/nature_glow.jpg'; // Ensure this image is in your public/assets folder

  return (
    <div
      className="About page"
      style={{ backgroundImage: `url(${backgroundUrl})` }}
    >
      <Header />

      {/* Single background image applied here */}
      <div className="split-pane">
        {/* Left side with blur overlay */}
        <div className="reading-pane">
          <div className="left-content">
            <HeadingWithSvg text="About" />
            <p>
              <strong>Plant Pal</strong> is your smart, simple companion for indoor plant care.
              It was built with love (and lots of debugging) as my capstone project for
              Ada Developers Academy, Cohort 23.
            </p>
            <p>
              Whether you're a brand-new plant parent or a seasoned collector, Plant Pal helps
              you track, care for, and learn about your indoor plants using personalized AI
              features and weather-aware reminders.
            </p>

            <h2>What Plant Pal Does</h2>
            <ul>
              <li><strong>Track your plants:</strong> Add your houseplants by name and let Plant Pal autofill care info using AI.</li>
              <li><strong>Get personalized alerts:</strong> Receive reminders when your plant needs watering — and warnings if the weather might harm them (like dry heat or a sudden frost).</li>
              <li><strong>Learn as you grow:</strong> Explore plant care tips tailored to your specific collection.</li>
              <li><strong>Use AI assistance:</strong> When you input a scientific name, Plant Pal fetches care information for you. (No guessing required.)</li>
            </ul>

            <h2>Why I Built It</h2>
            <p>
              I’ve killed a lot of plants — more than I’d like to admit.
              I built Plant Pal because I believe plant care should be fun and approachable, not intimidating.
              My goal was to create a tool that helps people feel confident, curious, and connected to the little living things in their space.
            </p>
          </div>
        </div>
      </div>

      <FooterBanner />
    </div>
  );
}

export default About;
