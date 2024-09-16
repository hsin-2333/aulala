interface Category {
  label: string;
  value: string | null;
}
export const CategoryOptions: Category[] = [
  { label: "All", value: null },
  { label: "Literature & Fiction", value: "0" },
  { label: "Fan Fiction", value: "1" },
  { label: "Romance", value: "2" },
];
