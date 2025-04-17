import styles from './ExamCard.module.css';
import { NEETIcon, JEEIcon, Class10Icon } from './icons';

const ExamCard = ({ type, title, description, isSelected, onClick }) => {
  const getIcon = () => {
    switch (type) {
      case 'neet':
        return <NEETIcon />;
      case 'jee':
        return <JEEIcon />;
      case 'class10':
        return <Class10Icon />;
      default:
        return null;
    }
  };

  return (
    <div 
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <div className={styles.iconContainer}>
        {getIcon()}
      </div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      {isSelected && (
        <div className={styles.selectedIndicator}>
          <div className={styles.pulse} />
        </div>
      )}
    </div>
  );
};

export default ExamCard; 