import React from "react";
import Carousel from "../Components/Home/Carousel";
import SectionInformation from "../Components/Home/SectionInformation";
import SectionOurRoom from "../Components/Home/HotAndTrending";

const HomePage: React.FC = () => {
  return (
    <>
      <Carousel />
      <SectionInformation />
      <SectionOurRoom />
    </>
  );
};

export default HomePage;
