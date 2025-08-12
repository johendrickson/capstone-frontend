import logo from '../assets/logo.svg';
import NavBar from '../components/NavBar';
import HeadingWithSvg from '../components/HeadingWithSvg';
import FooterBanner from '../components/FooterBanner';
import Header from '../components/Header';
import '../styles/HomePage.css';

export default function HomePage() {
  const backgroundUrl = '/assets/sunlit-branch.jpg';

  return (
    <div
      style={{ backgroundImage: `url(${backgroundUrl})` }}
      className='home-page'
    >
      <div
        className="page"
      >
        <Header displaysPlantPalIcon={false} />

        <main className="home-content">
          <div></div>
          <div className='text'>
            <HeadingWithSvg text="Plant Pal" />
            <p>
              A way to track and care for your plants, no matter where you've planted them.
            </p>
          </div>
        </main>

        <FooterBanner />

      </div>
    </div>
  );
}
