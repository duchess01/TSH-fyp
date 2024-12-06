import { useGridFilter } from "ag-grid-react";
import React, { useCallback } from "react";

export default ({ model, onModelChange, getValue, colDef, title }) => {
  const valueChanged = useCallback((p) => {
    const newValue = p.target.value;
    onModelChange(newValue == "" ? null : newValue);
  });

  const doesFilterPass = useCallback(({ data, node }) => {
    if (model === "All Machines") {
      return true;
    }
    const value = getValue(node);
    return value == model;
  });

  const getModelAsString = useCallback(() => {
    return model;
  }, [model]);

  useGridFilter({ doesFilterPass });

  return (
    <>
      <div>
        <select
          value={model || ""}
          onChange={(e) => {
            valueChanged(e);
          }}
          style={{ width: "100%" }}
        >
          <option value="All Machines">All Machines</option>
          {colDef.filterParams.machines.map((machine) => (
            <option key={machine} value={machine}>
              {machine}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};
