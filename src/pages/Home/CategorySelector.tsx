import { Button } from "@nextui-org/react";
import { CategoryOptions } from "../../constants/categoryOptions";

interface CategorySelectorProps {
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
}

export const CategorySelector = ({
  selectedCategory,
  setSelectedCategory,
}: CategorySelectorProps) => {
  return (
    <div className="custom-scrollbar mt-2 flex w-full justify-start gap-4 overflow-x-auto">
      {CategoryOptions.map((category) => {
        const IconComponent = category.icon;
        return (
          <Button
            key={category.value}
            radius="full"
            className={`h-7 flex-shrink-0 border sm:h-8 ${
              selectedCategory === category.value
                ? "border-blue-100 bg-blue-50"
                : "border-default-200 bg-white"
            }`}
            onClick={() => setSelectedCategory(category.value)}
            startContent={
              IconComponent && (
                <IconComponent
                  color={
                    selectedCategory === category.value
                      ? "hsl(var(--nextui-primary-500))"
                      : ""
                  }
                  fill={
                    selectedCategory === category.value
                      ? "hsl(var(--nextui-primary-200))"
                      : "none"
                  }
                  size={16}
                />
              )
            }
          >
            <div className="flex flex-shrink-0 flex-row justify-start sm:gap-2">
              <p
                className={`text-sm sm:text-medium ${
                  selectedCategory === category.value
                    ? "text-primary-800"
                    : "text-default-900"
                }`}
              >
                {category.label}
              </p>
            </div>
          </Button>
        );
      })}
    </div>
  );
};
