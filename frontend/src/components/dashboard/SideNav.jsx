import React from "react";
import Settings from "../common/Settings";
import { BiSolidUserCircle } from "react-icons/bi";

const Profile = () => {
  return (
    <div className="rounded-full text-center grid content-center mt-10 cursor-pointer">
      <BiSolidUserCircle size={"56px"} color={"#cbd5e1"} />
    </div>
  );
};

const SideNavBar = () => {
  return (
    <div className="bg-white rounded-r-lg flex flex-col justify-end items-center h-screen py-10">
      <Settings />
      <Profile />
    </div>
  );
};

export default SideNavBar;
