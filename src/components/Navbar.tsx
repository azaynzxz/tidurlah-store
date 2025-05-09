
import { useState } from "react";
import { Menu } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="py-4 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <div className="text-2xl font-bold flex items-center">
          <svg 
            className="h-6 w-6 mr-2" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M21 13v10h-6v-6H9v6H3V13H0L12 1l12 12h-3z" />
          </svg>
          <span>Halaland City</span>
        </div>
      </div>
      <button 
        className="md:hidden" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu size={24} />
      </button>
      
      <div className={`${isOpen ? 'block' : 'hidden'} md:block`}>
        <ul className="md:flex space-x-4">
          <li className="py-2 md:py-0">
            <a href="#" className="hover:text-green-600">Home</a>
          </li>
          <li className="py-2 md:py-0">
            <a href="#" className="hover:text-green-600">Restaurants</a>
          </li>
          <li className="py-2 md:py-0">
            <a href="#" className="hover:text-green-600">About</a>
          </li>
          <li className="py-2 md:py-0">
            <a href="#" className="hover:text-green-600">Contact</a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
