import { useForm } from "react-hook-form";
import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import dbApi from "../../../utils/firebaseService";
import { CategoryOptions } from "../../../constants/categoryOptions";
import { Select, SelectItem, Input, Button, Chip, Progress, Link } from "@nextui-org/react";
import { IoIosArrowBack } from "react-icons/io";

interface FormData {
  title: string;
  intro: string;
  url: string;
  voice_actor: string[];
  category: string;
  tags: { label: string; value: string }[];
  script_id: string;
  summary: string;
  scheduled_release_date: string;
  audio_url: string;
  img_url: string[];
  author: string;
  collections: string[];
}

const UploadStory = () => {
  const [isAudioUploaded, setIsAudioUploaded] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [audioName, setAudioName] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const filteredCategoryOptions = CategoryOptions.filter((option) => option.label !== "All");
  const AudioInputRef = useRef<HTMLInputElement>(null);

  const [tagsOptions, setTagsOptions] = useState<{ value: string; label: string }[]>([]);
  const [newTag, setNewTag] = useState("");
  const [selectedTags, setSelectedTags] = useState<{ value: string; label: string }[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const [collectionsOptions, setCollectionsOptions] = useState<string[] | null>();

  console.log("collectionsOptions", collectionsOptions);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = useForm<FormData>();

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

  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const fileSizeInMB = selectedFile.size / (1024 * 1024); // 將文件大小轉換為MB
      if (fileSizeInMB > 8) {
        window.alert("文件大小超過8MB，請選擇較小的文件。");
        if (AudioInputRef.current) {
          AudioInputRef.current.value = ""; // 清空文件輸入框
        }
        return;
      }

      setFile(selectedFile);
      setAudioName(selectedFile.name);

      const audioUrl = URL.createObjectURL(selectedFile);
      const audio = new Audio(audioUrl);

      audio.onloadedmetadata = () => {
        setAudioDuration(audio.duration);
        setIsAudioUploaded(true);
      };
      setCurrentStep(1);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setImageFile(selectedFile);
      const imageUrl = URL.createObjectURL(selectedFile);
      setImageUrl(imageUrl);
    }
  };

  const onSubmit = async (data: FormData) => {
    console.log(data);
    if (file) {
      let storyId: string | null = null;

      try {
        const storyData = {
          ...data,
          duration: audioDuration || 0,
          author: user?.userName || "Unknown",
          tags: data.tags.map((tag) => tag.value),
          voice_actor: [user?.userName || ""], //之後要增加多位聲優
          status: "Processing",
          collections: data.collections,
        };

        navigate(`/user/${user?.userName}/uploads`);

        storyId = await dbApi.uploadAudioAndSaveStory(file, imageFile, storyData);
        for (const tag of data.tags) {
          await dbApi.addOrUpdateTag(tag.value, storyId, null);
        }

        for (const collection of data.collections) {
          await dbApi.addStoryToCollection(storyId, collection, user?.userName || "Unknown");
        }

        await dbApi.updateStoryStatus(storyId, "Done");
        window.alert("成功上傳");
      } catch (error) {
        console.error("Error uploading story and audio:", error);
        if (storyId) {
          // 如果上傳失敗，回滾狀態
          await dbApi.updateStoryStatus(storyId, "Failed");
          setFile(null);
          setImageFile(null);
          setImageUrl(null);
          setIsAudioUploaded(false);
          setAudioName(null);
          setAudioDuration(null);
        }
      }
    }
  };

  const handleStepClick = async (step: number) => {
    // 檢查當前步驟的必填字段
    let isValid = true;
    if (step > currentStep) {
      if (currentStep === 1) {
        isValid = await trigger(["title", "intro", "summary"]);
      } else if (currentStep === 2) {
        isValid = await trigger(["category", "tags", "scheduled_release_date"]);
      }
    }

    if (isValid) {
      setCurrentStep(step);
    } else if (step < currentStep) {
      setCurrentStep(step);
    } else {
      window.alert("請填寫所有必填字段");
    }
  };

  const handleTagCreation = () => {
    if (newTag.trim() !== "" && selectedTags.length < 8) {
      const newTagOption = { value: newTag, label: newTag };
      setTagsOptions((prev) => [...prev, newTagOption]);
      setSelectedTags((prev) => [...prev, newTagOption]);
      setNewTag("");
      setIsDropdownVisible(false);
    } else if (selectedTags.length >= 8) {
      window.alert("最多只能選擇8個標籤");
    }
  };

  const handleTagRemoval = (tagValue: string) => {
    const removedTag = selectedTags.find((tag) => tag.value === tagValue);
    if (removedTag) {
      const newSelectedTags = selectedTags.filter((tag) => tag.value !== tagValue);
      setSelectedTags(newSelectedTags);
      setTagsOptions((prev) => [...prev, removedTag]);
      setValue("tags", newSelectedTags);
    }
  };

  const handleTagSelection = (tag: { value: string; label: string }) => {
    if (selectedTags.length < 8) {
      setSelectedTags((prev) => [...prev, tag]);
      setTagsOptions((prev) => prev.filter((option) => option.value !== tag.value));
      setIsDropdownVisible(false);
      setValue("tags", [...selectedTags, tag]);
    } else {
      window.alert("最多只能選擇8個標籤");
    }
  };

  // const getStepLabel = (step: number) => {
  //   switch (step) {
  //     case 1:
  //       return "Step 1: Audio Info";
  //     case 2:
  //       return "Step 2: More Info";
  //     case 3:
  //       return "Step 3: Add Cover Image";
  //     default:
  //       return "";
  //   }
  // };

  return (
    <>
      {isAudioUploaded && (
        <div className="mb-8 sm:hidden">
          <Progress
            aria-label="Step Progress"
            size="sm"
            value={(currentStep / 3) * 100}
            color="success"
            showValueLabel={false}
            className="max-w-md"
          />
          <div className=" flex items-center justify-center mt-2 mx-2">
            <div className="absolute left-2 top-3 gap-2 self-center flex justify-center">
              <Link href="/" color="foreground">
                <IoIosArrowBack size={20} className="self-center" />
              </Link>
              <span className="text-medium text-default-800 font-bold"> Upload Story</span>
            </div>

            {/* <span className="text-left text-tiny text-default-400 m-1"> {getStepLabel(currentStep)}</span> */}
          </div>
        </div>
      )}
      <div className="container mx-auto w-full p-2 relative">
        {/* <h2 className="text-2xl font-bold mb-4">Upload Section</h2> */}

        {!isAudioUploaded ? (
          <div className="flex gap-4 flex-col items-center">
            <label className="block text-sm font-medium text-gray-700">Only accept audio below 8 MB</label>
            <input type="file" accept="audio/*" onChange={handleAudioUpload} ref={AudioInputRef} className="hidden" />
            <button
              className="flex items-center size-default bg-primary text-white"
              type="button"
              onClick={() => {
                if (AudioInputRef.current) {
                  AudioInputRef.current.click();
                }
              }}
            >
              Select Audio File
            </button>
          </div>
        ) : (
          <>
            <div>
              <h6>
                Audio Name: {audioName} <br />
                Audio Duration: {audioDuration ? `${audioDuration.toFixed(2)} seconds` : "Loading..."}
              </h6>
            </div>
            <div className="hidden sm:flex justify-around m-8">
              <button
                onClick={() => handleStepClick(1)}
                className={`px-4 py-2  ${currentStep === 1 ? "bg-slate-500 text-white" : "bg-gray-200"}`}
              >
                Audio Info
              </button>
              <button
                onClick={() => handleStepClick(2)}
                className={`px-4 py-2 ${currentStep === 2 ? "bg-slate-500 text-white" : "bg-gray-200"}`}
              >
                More Info
              </button>
              <button
                onClick={() => handleStepClick(3)}
                className={`px-4 py-2 ${currentStep === 3 ? "bg-slate-500 text-white" : "bg-gray-200"}`}
              >
                Add Cover Image
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left ">
              {currentStep === 1 && (
                <div className="h-full">
                  <h3 className="text-xl font-semibold">Audio Info</h3>
                  <div className="mt-4 border border-transparent">
                    <Input
                      label="Title"
                      isRequired
                      placeholder="Your Audio Story Title"
                      labelPlacement="outside"
                      radius="sm"
                      variant="bordered"
                      {...register("title", { required: true })}
                    />
                    {errors.title && <span className="text-red-500 text-sm">This field is required</span>}
                  </div>
                  <div className="mt-4 border border-transparent">
                    <Input
                      label="Intro"
                      isRequired
                      placeholder="Enter intro"
                      labelPlacement="outside"
                      radius="sm"
                      variant="bordered"
                      {...register("intro", { required: true })}
                    />
                    {errors.intro && <span className="text-red-500 text-sm">This field is required</span>}
                  </div>
                  <div className="mt-4 border border-transparent">
                    <Input
                      label="Summary"
                      isRequired
                      placeholder="Enter summary"
                      labelPlacement="outside"
                      radius="sm"
                      variant="bordered"
                      {...register("summary", { required: true })}
                    />
                    {errors.summary && <span className="text-red-500 text-sm">This field is required</span>}
                  </div>
                  <div className="fixed bottom-0 left-4 right-4 w-[calc(100%-2rem)] sm:w-full sm:static flex justify-end sm:mt-4">
                    <Button
                      type="button"
                      onClick={() => handleStepClick(2)}
                      color="primary"
                      className="rounded-full sm:rounded-sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
              {currentStep === 2 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">More Info</h3>
                  <div className="mt-4 border border-transparent">
                    <Select
                      placeholder="Select a category"
                      onSelectionChange={(keys) => setValue("category", Array.from(keys).join(""))}
                      defaultSelectedKeys={[]}
                      disableAnimation
                      labelPlacement="outside"
                      radius="sm"
                      label="Category"
                      isRequired
                      variant="bordered"
                    >
                      {filteredCategoryOptions.map((option) => (
                        <SelectItem key={option.label}>{option.label}</SelectItem>
                      ))}
                    </Select>
                    {errors.category && <span className="text-red-500 text-sm">This field is required</span>}
                  </div>
                  <div className="mt-4 border border-transparent">
                    <label className="block text-sm font-medium text-gray-700  mb-1">
                      Tags<span className="text-red-500 text-sm ">*</span>
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
                        <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                          {tagsOptions.map((option) => (
                            <div
                              key={option.value}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                              onClick={() => handleTagSelection(option)}
                            >
                              {option.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 ml-1">
                    {selectedTags.map((tag) => (
                      <Chip key={tag.value} className="bg-primary-100" onClose={() => handleTagRemoval(tag.value)}>
                        {tag.label}
                      </Chip>
                    ))}
                  </div>
                  {errors.tags && <span className="text-red-500 text-sm">This field is required</span>}
                  <div className="mt-4 border border-transparent">
                    <Select
                      placeholder="Select collection"
                      onSelectionChange={(keys) => setValue("collections", Array.from(keys).map(String))}
                      defaultSelectedKeys={[]}
                      disableAnimation
                      labelPlacement="outside"
                      radius="sm"
                      selectionMode="multiple"
                      label="Add to collection"
                      variant="bordered"
                    >
                      {collectionsOptions ? (
                        collectionsOptions.map((option) => <SelectItem key={option}>{option}</SelectItem>)
                      ) : (
                        <Select>
                          <SelectItem key="a">aaa</SelectItem>
                        </Select>
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
                      {...register("scheduled_release_date", { required: true })}
                    />
                    {errors.summary && <span className="text-red-500 text-sm">This field is required</span>}
                  </div>

                  <div className="fixed bottom-0 left-4 right-4 w-[calc(100%-2rem)] sm:w-full sm:static flex justify-end sm:mt-4">
                    <Button
                      type="button"
                      onClick={() => handleStepClick(1)}
                      color="default"
                      variant="light"
                      className="rounded-full sm:rounded-sm"
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleStepClick(3)}
                      color="primary"
                      className="rounded-full sm:rounded-sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
              {currentStep === 3 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Add Cover Image</h3>
                  <div className="mt-4 border border-transparent">
                    <Input
                      label="Cover Image"
                      isRequired
                      placeholder="Choose a cover image"
                      labelPlacement="outside"
                      radius="sm"
                      variant="bordered"
                      accept="image/*"
                      type="file"
                      onChange={handleImageUpload}
                    />
                    {imageUrl && <img src={imageUrl} alt="Uploaded" className="mt-2" />}
                    {errors.summary && <span className="text-red-500 text-sm">This field is required</span>}
                  </div>
                  <div className="fixed bottom-0 left-4 right-4 w-[calc(100%-2rem)] sm:w-full sm:static flex justify-end sm:mt-4">
                    <Button
                      type="button"
                      onClick={() => handleStepClick(2)}
                      color="default"
                      variant="light"
                      className="rounded-full sm:rounded-sm"
                    >
                      Previous
                    </Button>
                    <Button type="submit" color="primary" className="rounded-full sm:rounded-sm">
                      Submit
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </>
  );
};

export default UploadStory;
