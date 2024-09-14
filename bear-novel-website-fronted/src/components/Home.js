import React, { useEffect } from "react";
import AdBanner from "./AdBanner";
import NovelList from "./NovelList";
import { useDispatch } from "react-redux";

import { sortNovels } from "../redux/slices/novelSlice";

// 主頁組件
const Home = () => {
  const novelType = -1;
  const sortOrder = "latest";
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(sortNovels({ novelType, sortOrder }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  return (
    <div>
      <AdBanner />
      <NovelList />
    </div>
  );
};

export default Home;
