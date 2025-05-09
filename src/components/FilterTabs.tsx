
import { useState } from "react";

type FilterTabsProps = {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
};

const FilterTabs = ({ activeFilter, setActiveFilter }: FilterTabsProps) => {
  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Find</h2>
        <span className="text-green-600 flex items-center">5km &gt;</span>
      </div>
      <div className="flex space-x-3 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveFilter("Salads")}
          className={`px-6 py-2 rounded-full text-sm whitespace-nowrap ${
            activeFilter === "Salads"
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Salads
        </button>
        <button
          onClick={() => setActiveFilter("HotSales")}
          className={`px-6 py-2 rounded-full text-sm whitespace-nowrap ${
            activeFilter === "HotSales"
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Hot Sales
        </button>
        <button
          onClick={() => setActiveFilter("Popularity")}
          className={`px-6 py-2 rounded-full text-sm whitespace-nowrap ${
            activeFilter === "Popularity"
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Popularity
        </button>
      </div>
    </div>
  );
};

export default FilterTabs;
