import LeafIcon from '../assets/leaf.svg';
import LeafSvg from './leafSvg';
import '../styles/HeadingWithSvg.css';

const fullHeightOnRightSideChars = [
  'd', 'f', 'l', 't',
]

export default function HeadingWithSvg({
  text
}: { text: string }) {
  const isLastLetterHalfHeightOnRightSide: boolean = (
    text.length === 0
    || fullHeightOnRightSideChars.includes(text[text.length - 1])
  );

  return (
    <div className="heading-with-icon">
      <h1>
        <span>{text}</span>
        <div className='icon-offset-point'>
          {/* <img
            src={LeafIcon}
            className="App-logo"
            alt="main logo"
            style={{
              top: (
                isLastLetterHalfHeightOnRightSide
                ? '-1.8ch'
                : '-1.5ch'
              ),
              left: '-0.1ch'
            }}
          /> */}
          <LeafSvg />
        </div>
      </h1>
    </div>
  );
}
