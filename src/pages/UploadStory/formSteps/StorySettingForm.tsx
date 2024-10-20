import { Button, Chip, Input, Select, SelectItem } from "@nextui-org/react";
import { useContext, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { CategoryOptions } from "../../../constants/categoryOptions";
import { AuthContext } from "../../../context/AuthContext";
import { useToast } from "../../../hooks/useToast";
import dbApi from "../../../utils/firebaseService";

const StorySettingForm = ({
  onNext,
  onPrev,
}: {
  onNext: () => void;
  onPrev?: () => void;
}) => {
  const { user } = useContext(AuthContext);
  const {
    register,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext();
  const { showToastMessage } = useToast();

  const [tagsOptions, setTagsOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [newTag, setNewTag] = useState("");
  const [selectedTags, setSelectedTags] = useState<
    { value: string; label: string }[]
  >([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const [collectionsOptions, setCollectionsOptions] = useState<
    string[] | null
  >();
  const [currentDateTime, setCurrentDateTime] = useState("");

  const filteredCategoryOptions = useMemo(
    () => CategoryOptions.filter((option) => option.label !== "All"),
    [],
  );

  const validateAndProceed = async () => {
    const isValid = await trigger(["category"]);

    if (isValid) {
      onNext();
    } else {
      showToastMessage("請填寫所有必填字段");
    }
  };

  useEffect(() => {
    const fetchTags = async () => {
      const tags = await dbApi.getTags();
      setTagsOptions(tags.map((tag: string) => ({ label: tag, value: tag })));
    };
    fetchTags();

    const fetchCollections = async () => {
      if (user?.userName) {
        const collections = await dbApi.getMyCollections(user.userName);
        setCollectionsOptions(collections);
      }
    };

    fetchCollections();
  }, [user?.userName]);

  const handleTagCreation = () => {
    if (newTag.trim() !== "" && selectedTags.length < 8) {
      const newTagOption = { value: newTag, label: newTag };
      setTagsOptions((prev) => [...prev, newTagOption]);
      setSelectedTags((prev) => [...prev, newTagOption]);
      setNewTag("");
      setIsDropdownVisible(false);
    } else if (selectedTags.length >= 8) {
      showToastMessage("最多只能選擇8個標籤");
    }
  };

  const handleTagRemoval = (tagValue: string) => {
    const removedTag = selectedTags.find((tag) => tag.value === tagValue);
    if (removedTag) {
      const newSelectedTags = selectedTags.filter(
        (tag) => tag.value !== tagValue,
      );
      setSelectedTags(newSelectedTags);
      setTagsOptions((prev) => [...prev, removedTag]);
      setValue("tags", newSelectedTags);
    }
  };

  const handleTagSelection = (tag: { value: string; label: string }) => {
    if (selectedTags.length < 8) {
      setSelectedTags((prev) => [...prev, tag]);
      setTagsOptions((prev) =>
        prev.filter((option) => option.value !== tag.value),
      );
      setIsDropdownVisible(false);
      setValue("tags", [...selectedTags, tag]);
    } else {
      showToastMessage("最多只能選擇8個標籤");
    }
  };
  useEffect(() => {
    const now = new Date();
    const gmt8Time = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const formattedDateTime = gmt8Time.toISOString().slice(0, 16);
    setCurrentDateTime(formattedDateTime);
    setValue("scheduled_release_date", formattedDateTime);
  }, [setValue]);

  return (
    <div>
      <div className="mt-4 border border-transparent">
        <Select
          placeholder="Select a category"
          onSelectionChange={(keys) =>
            setValue("category", Array.from(keys).join(""))
          }
          defaultSelectedKeys={[]}
          disableAnimation
          labelPlacement="outside"
          radius="sm"
          label="Category"
          isRequired
          variant="bordered"
          {...register("category", { required: true })}
        >
          {filteredCategoryOptions.map((option) => (
            <SelectItem key={`${option.value}`}>{option.label}</SelectItem>
          ))}
        </Select>
        {errors.category && (
          <span className="text-sm text-red-500">This field is required</span>
        )}
      </div>
      <div className="mt-4 border border-transparent">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Tags
        </label>
        <div className="relative">
          <Input
            placeholder="Select or Create new tag | max 8 tags"
            variant="bordered"
            radius="sm"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onFocus={() => setIsDropdownVisible(true)}
            onBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleTagCreation();
              }
            }}
          />
          {isDropdownVisible && (
            <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
              {tagsOptions.map((option) => (
                <div
                  key={option.value}
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                  onClick={() => handleTagSelection(option)}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="ml-1 mt-2 flex gap-2">
        {selectedTags.map((tag) => (
          <Chip
            key={tag.value}
            className="bg-primary-100"
            onClose={() => handleTagRemoval(tag.value)}
          >
            {tag.label}
          </Chip>
        ))}
      </div>
      {errors.tags && (
        <span className="text-sm text-red-500">This field is required</span>
      )}

      <div className="mt-4 border border-transparent">
        <Select
          placeholder="Select collection"
          onSelectionChange={(keys) =>
            setValue("collections", Array.from(keys).map(String))
          }
          defaultSelectedKeys={[]}
          disableAnimation
          labelPlacement="outside"
          radius="sm"
          selectionMode="multiple"
          label="Add to collection"
          variant="bordered"
        >
          {collectionsOptions && collectionsOptions.length > 0 ? (
            collectionsOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))
          ) : (
            <SelectItem key="default">默認合集</SelectItem>
          )}
        </Select>
      </div>
      <div className="mt-4 border border-transparent">
        <Input
          type="datetime-local"
          label="Release Date"
          isRequired
          placeholder="Pick Release Date"
          labelPlacement="outside"
          radius="sm"
          variant="bordered"
          defaultValue={currentDateTime}
          {...register("scheduled_release_date", {
            required: true,
          })}
        />
        {errors.summary && (
          <span className="text-sm text-red-500">This field is required</span>
        )}
      </div>

      <div className="fixed bottom-0 left-4 right-4 flex w-[calc(100%-2rem)] justify-end sm:static sm:mt-4 sm:w-full">
        <Button
          type="button"
          onClick={onPrev}
          color="default"
          variant="light"
          className="rounded-full sm:rounded-sm"
        >
          Previous
        </Button>
        <Button
          type="button"
          onClick={validateAndProceed}
          color="primary"
          className="rounded-full sm:rounded-sm"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default StorySettingForm;
