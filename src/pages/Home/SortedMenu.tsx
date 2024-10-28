import { useEffect, useRef, useState } from "react";
import Icon from "../../components/Common/Icon";

interface SortedMenuProps {
  onSortOrderChange: (order: string) => void;
}

const SortedMenu = ({ onSortOrderChange }: SortedMenuProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("Descending");
  const [iconColor, setIconColor] = useState("currentColor");
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSortOrderChange = (order: string) => {
    setSortOrder(order);
    setIconColor(
      order === "Descending"
        ? "currentColor"
        : "hsl(var(--nextui-primary-500))",
    );
    setIsMenuOpen(false);
    onSortOrderChange(order);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isMenuOpen) {
      console.log("add event listener");
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div
      ref={menuRef}
      className="relative flex w-40 items-center justify-end text-left"
    >
      <button onClick={toggleMenu} className="flex justify-between align-top">
        <Icon name="sorted" className="mr-2 h-6 w-6" color={iconColor} />
        <span style={{ color: iconColor }}>{sortOrder}</span>
      </button>
      {isMenuOpen && (
        <div className="absolute right-0 z-10 mt-28 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
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
