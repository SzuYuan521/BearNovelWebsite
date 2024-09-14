import React from "react";

const sortModes = [
  { label: "最新", value: "latest" },
  { label: "最熱門", value: "popular" },
];

const NovelSortButtons = ({ sortOrder, onSortChange }) => {
  return (
    <div className="novel-sort-button-container">
      {sortModes.map((mode, index) => (
        <button
          key={index}
          className={`novel-sort-button ${
            sortOrder === mode.value ? "active" : ""
          }`}
          onClick={() => onSortChange(mode.value)}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
};

/*
const sortModes = [
  { label: "最新", value: "latest" },
  { label: "最熱門", value: "popular" },
];

const NovelSortButtons = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(sortNovels({sortOrder:sortModes[currentIndex].value, novelType}));
  }, [currentIndex, dispatch]);

  const handleButtonClick = (index) => {
    setCurrentIndex(index);
    dispatch(sortNovels(sortModes[index].value));
  };

  return (
    <div className="novel-sort-button-container">
      {sortModes.map((mode, index) => (
        <button
          key={index}
          className={`novel-sort-button ${
            currentIndex === index ? "active" : ""
          }`}
          onClick={() => handleButtonClick(index)}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
};*/

export default NovelSortButtons;
