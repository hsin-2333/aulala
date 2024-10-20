export interface Category {
  label: string;
  value: string | null;
  icon: React.ComponentType<IconBaseProps> | null;
}
import { IconBaseProps } from "react-icons";
import { LuBookOpen, LuFolderHeart, LuHeart } from "react-icons/lu";

export const CategoryOptions: Category[] = [
  { label: "All", value: null, icon: null },
  { label: "Literature & Fiction", value: "0", icon: LuBookOpen },
  { label: "Fan Fiction", value: "1", icon: LuFolderHeart },
  { label: "Romance", value: "2", icon: LuHeart },
];
