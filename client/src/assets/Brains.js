import Mavericks_Brain from '/images/Mavericks_Brain.webp'
import Explorers_Brain from '/images/Explorers_Brain.webp'
import Strivers_Brain from '/images/Strivers_Brain.webp'
import Elites_Brain from '/images/Elites_Brain.webp'
import Titans_Brain from '/images/Titans_Brain.webp'

const Brains = t => {
  return [
    {
      society: t('Explorers.society'),
      image: Explorers_Brain,
      IQ_Lower: t('Explorers.IQ_Lower'),
      IQ_Upper: t('Explorers.IQ_Upper'),
      boxShadow: null,
      textColor: 'white',
      BrainInfo: t('Explorers.BrainInfo'),
    },
    {
      society: t('Strivers.society'),
      image: Strivers_Brain,
      IQ_Lower: t('Strivers.IQ_Lower'),
      IQ_Upper: t('Strivers.IQ_Upper'),
      boxShadow: null,
      textColor: 'cornflowerblue',
      BrainInfo: t('Strivers.BrainInfo'),
    },
    {
      society: t('Elites.society'),
      image: Elites_Brain,
      IQ_Lower: t('Elites.IQ_Lower'),
      IQ_Upper: t('Elites.IQ_Upper'),
      boxShadow: '0 0 10px 5px rgba(0, 255, 100, 0.5)',
      textColor: 'lightgreen',
      BrainInfo: t('Elites.BrainInfo'),
    },
    {
      society: t('Mavericks.society'),
      image: Mavericks_Brain,
      IQ_Lower: t('Mavericks.IQ_Lower'),
      IQ_Upper: t('Mavericks.IQ_Upper'),
      boxShadow: '0 0 10px 5px rgba(255, 100, 0, 0.7)',
      textColor: 'darkorange',
      BrainInfo: t('Mavericks.BrainInfo'),
    },
    {
      society: t('Titans.society'),
      image: Titans_Brain,
      IQ_Lower: t('Titans.IQ_Lower'),
      IQ_Upper: t('Titans.IQ_Upper'),
      boxShadow: '0 0 10px 5px rgba(255, 215, 0, 0.8)',
      textColor: 'goldenrod',
      BrainInfo: t('Titans.BrainInfo'),
    },
  ]
}

export default Brains
