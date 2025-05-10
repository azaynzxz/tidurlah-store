
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
    <div className="relative my-6">
      <div className="flex items-center bg-gray-100 rounded-full p-3">
        <Search className="text-gray-500 h-5 w-5 ml-2" />
        <input
          type="text"
          placeholder="Search products"
          className="w-full bg-transparent border-none outline-none pl-2 text-gray-700"
          value={searchTerm}
          onChange={handleSearch}
        />
        <button className="bg-white p-2 rounded-full mr-2">
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
