
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  onSearch: (term: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  return (
    <div className="relative my-3">
      <div className="flex items-center bg-gray-100 rounded-full p-2 border-2 border-[#FF5E01] shadow-md">
        <Search className="text-[#FF5E01] h-5 w-5 ml-1" />
        <input
          type="text"
          placeholder="Search products"
          className="w-full bg-transparent border-none outline-none pl-2 text-gray-700"
          value={searchTerm}
          onChange={handleSearch}
        />
        <button className="bg-white p-1.5 rounded-full mr-1">
          <SlidersHorizontal className="h-4 w-4 text-[#FF5E01]" />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
