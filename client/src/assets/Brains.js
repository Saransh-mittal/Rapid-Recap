// SSR image imports
const Mavericks_Brain = '/images/Mavericks_Brain.webp'
const Explorers_Brain = '/images/Explorers_Brain.webp'
const Strivers_Brain = '/images/Strivers_Brain.webp'
const Elites_Brain = '/images/Elites_Brain.webp'
const Titans_Brain = '/images/Titans_Brain.webp'

const Brains = [
  {
    society: 'Explorers',
    image: Explorers_Brain,
    IQ_Lower: 0,
    IQ_Upper: 90,
    boxShadow: null,
    textColor: 'white',
    BrainInfo:
      'Explorers Society represents individuals with a diverse range of cognitive abilities and a spirit of curiosity and adventure. While IQ scores may vary widely within this society, members share a common passion for exploration, learning, and discovery. They thrive in environments that encourage experimentation and intellectual curiosity.',
  },
  {
    society: 'Strivers',
    image: Strivers_Brain,
    IQ_Lower: 90,
    IQ_Upper: 110,
    boxShadow: null,
    textColor: 'cornflowerblue',
    BrainInfo:
      'Strivers Society consists of determined individuals with solid cognitive abilities and a persistent work ethic. With IQs ranging from 90 to 110, members of this society exhibit resilience, resourcefulness, and a strong desire for self-improvement. They excel in overcoming challenges and achieving success through perseverance and dedication.',
  },
  {
    society: 'Elites',
    image: Elites_Brain,
    IQ_Lower: 110,
    IQ_Upper: 130,
    boxShadow: '0 0 10px 5px rgba(0, 255, 100, 0.5)',
    textColor: 'lightgreen',
    BrainInfo:
      'Elites Society encompasses individuals with above-average intelligence and a keen ability to adapt to complex situations. With IQs ranging from 110 to 130, members of this society possess strong analytical skills, strategic thinking, and a drive for continuous improvement. They often occupy leadership positions and excel in navigating competitive environments.',
  },
  {
    society: 'Mavericks',
    image: Mavericks_Brain,
    IQ_Lower: 130,
    IQ_Upper: 150,
    boxShadow: '0 0 10px 5px rgba(255, 100, 0, 0.7)',
    textColor: 'darkorange',
    BrainInfo:
      'Mavericks Society consists of highly intelligent individuals who thrive on independent thinking and unconventional approaches. With IQs ranging from 130 to 150, members of this society are known for their boldness, ingenuity, and willingness to challenge the status quo. They excel in pushing boundaries and pioneering new ideas across diverse domains.',
  },
  {
    society: 'Titans',
    image: Titans_Brain,
    IQ_Lower: 150,
    IQ_Upper: null,
    textColor: 'goldenrod',
    boxShadow: '0 0 10px 5px rgba(255, 215, 0, 0.8)',
    BrainInfo:
      'Titans Society comprises individuals with exceptionally high cognitive abilities, often demonstrating genius-level intellect. Members of this elite group possess unmatched problem-solving skills and exhibit extraordinary creativity. Their minds operate at unparalleled levels of complexity, making them visionary leaders and innovators in various fields.',
  },
]

export default Brains
