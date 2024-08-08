import React, { useState } from "react";
import { IoSettingsOutline } from "react-icons/io5";

const Settings = () => {
  const handleClick = () => {};

  return (
    <div
      className="rounded-full w-12 h-12 flex justify-center items-center bg-blue-300 cursor-pointer"
      onClick={handleClick}
    >
      <IoSettingsOutline size={"25px"} />
    </div>
  );
};

export default Settings;
