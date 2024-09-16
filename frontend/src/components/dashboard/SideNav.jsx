import React from "react";
import Settings from "../common/Settings";
import { BiSolidUserCircle } from "react-icons/bi";

const Profile = () => {
  return (
    <div className="rounded-full w-20 h-20 text-center grid content-center mt-10 cursor-pointer justify-center items-center">
      <BiSolidUserCircle size={"56px"} color={"#cbd5e1"} />
    </div>
  );
};

const SideNavBar = () => {
  return (
    <div
      className="bg-white rounded-r-lg flex flex-col justify-end items-center h-screen py-10"
      style={{
        position: "-webkit - sticky" /* Safari */,
        position: "sticky",
        top: 0,
      }}
    >
      <Settings />
      <Profile />
    </div>
  );
};

export default SideNavBar;
