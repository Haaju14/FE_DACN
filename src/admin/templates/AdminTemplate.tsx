//tsrafce
import React from "react";
import { Outlet } from "react-router-dom";
import HeaderHomeAdmin from "../componentsAdmin/HeaderHomeAdmin";
import FooterHomeAdmin from "../componentsAdmin/FooterHomeAdmin";
import SideBarAdmin from "../componentsAdmin/SideBarAdmin";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import useRoute from "../../hook/useRoute";

const AdminTemplate: React.FC = () => {
  const { navigate } = useRoute();

  const { userLogin } = useSelector((state: RootState) => state.userReducer);

  if (userLogin?.user.Role !== "admin" && userLogin?.user.Role !== "giangvien") {
    console.log(
      'userLogin?.user.Role !== "admin" && userLogin?.user.Role !== "giangvien": ',
      userLogin?.user.Role
    );
    navigate("/");
  }
  

  return (
    <div className="wrapper">
      <SideBarAdmin />
      <div className="main-panel">
        <HeaderHomeAdmin />
        <Outlet />
        <FooterHomeAdmin />
      </div>
    </div>
  );
};

export default AdminTemplate;
