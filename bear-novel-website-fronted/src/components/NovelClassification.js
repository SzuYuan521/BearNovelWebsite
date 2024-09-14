import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import NovelList from "./NovelList";
import NovelSortButtons from "./NovelSortButtons";
import NovelTypeButtons from "./NovelTypeButtons";
import { sortNovels } from "../redux/slices/novelSlice";

const NovelClassification = () => {
  const [novelType, setNovelType] = useState(-1);
  const [sortOrder, setSortOrder] = useState("latest");
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(sortNovels({ novelType, sortOrder }));
  }, [novelType, sortOrder, dispatch]);

  const handleTypeChange = (type) => {
    setNovelType(type);
  };

  const handleSortChange = (order) => {
    setSortOrder(order);
  };

  return (
    <div>
      <div className="novel-type-classification d-flex flex-column align-items-start mt-4">
        <div className="mt-3 mb-3">
          <NovelTypeButtons
            novelType={novelType}
            onTypeChange={handleTypeChange}
          />
        </div>
      </div>
      <div className="mt-3 mb-3">
        <NovelSortButtons
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />
      </div>
      <NovelList />
    </div>
  );
};

export default NovelClassification;
