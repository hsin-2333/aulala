interface Category {
  label: string;
  value: string | null;
  icon: React.ComponentType<IconBaseProps> | null;
}
import { LuFolderHeart, LuBookOpen, LuHeart } from "react-icons/lu";
import { IconBaseProps } from "react-icons";

export const CategoryOptions: Category[] = [
  { label: "All", value: null, icon: null },
  { label: "Literature & Fiction", value: "0", icon: LuBookOpen },
  { label: "Fan Fiction", value: "1", icon: LuFolderHeart },
  { label: "Romance", value: "2", icon: LuHeart },
];
