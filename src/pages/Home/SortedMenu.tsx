import { useState } from "react";
import Icon from "../../components/Icon"; // 確保路徑正確

interface SortedMenuProps {
  onSortOrderChange: (order: string) => void;
}

const SortedMenu = ({ onSortOrderChange }: SortedMenuProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("Descending");
  const [iconColor, setIconColor] = useState("currentColor");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSortOrderChange = (order: string) => {
    setSortOrder(order);
    setIconColor(order === "Descending" ? "currentColor" : "hsl(var(--nextui-primary-500))");
    setIsMenuOpen(false);
    onSortOrderChange(order);
  };

  return (
    <div className="relative w-40 flex justify-end items-center  text-left ">
      <button onClick={toggleMenu} className="flex align-top justify-between ">
        <Icon name="sorted" className="mr-2 h-6 w-6" color={iconColor} />
        <span style={{ color: iconColor }}>{sortOrder}</span>
      </button>
      {isMenuOpen && (
        <div className="z-10 absolute right-0 mt-28 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
          <button
            onClick={() => handleSortOrderChange("Descending")}
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            Newest to Oldest
          </button>
          <button
            onClick={() => handleSortOrderChange("Ascending")}
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            Oldest to Newest
          </button>
        </div>
      )}
    </div>
  );
};

export default SortedMenu;
