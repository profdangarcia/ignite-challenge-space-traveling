import { FaSearch } from 'react-icons/fa';
import Header from '../components/Header';
import commonStyles from '../styles/common.module.scss';
import styles from './notfound.module.scss';

export default function NotFound(): JSX.Element {
  return (
    <>
      <Header />
      <div className={`${commonStyles.content} ${styles.notfound}`}>
        <FaSearch />
        <div className="info">
          <h2>Desculpe...a página que está procurando não existe!</h2>
          <p>
            {`Verifique a URL que tentou acessar e tente novamente `}
            <span role="img" aria-label="blink emoji">
              &#x1F609;
            </span>
          </p>
        </div>
      </div>
    </>
  );
}
