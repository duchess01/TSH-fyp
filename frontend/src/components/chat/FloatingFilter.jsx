import React, { useCallback } from "react";

export default ({ model, onModelChange, filterParams }) => {
  const valueChanged = useCallback((p) => {
    const newValue = p.target.value;
    onModelChange(newValue === "" ? null : newValue);
  });

  return (
    <div
      className="MyFloatingFilter"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <select
        className="MyFloatingFilterSelect"
        value={model || "All Machines"}
        onChange={valueChanged}
        style={{
          margin: "auto",
          borderRadius: "3px",
          border: "solid 1px #68686e",
          paddingTop: "2px",
          paddingBottom: "2px",
          backgroundColor: "#181d1f",
        }}
      >
        <option value="All Machines">All Machines</option>
        <option value="Machine A">Machine A</option>
        <option value="Machine B">Machine B</option>
        <option value="Machine C">Machine C</option>
        {filterParams.colDef.filterParams.machines.map((machine) => (
          <option key={machine} value={machine}>
            {machine}
          </option>
        ))}
      </select>
    </div>
  );
};
