import { useForm } from "react-hook-form";
import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import dbApi from "../../../utils/firebaseService";
import { CategoryOptions } from "../../../constants/categoryOptions";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

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
  const [tagsOptions, setTagsOptions] = useState<{ value: string; label: string }[]>([]);

  const filteredCategoryOptions = CategoryOptions.filter((option) => option.label !== "All");
  const AudioInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>();

  useEffect(() => {
    const fetchTags = async () => {
      const tags = await dbApi.getTags();
      setTagsOptions(tags.map((tag: string) => ({ label: tag, value: tag })));
    };
    fetchTags();
  }, []);

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
    if (file) {
      try {
        const storyData = {
          ...data,
          duration: audioDuration,
          author: user?.userName || "Unknown",
          tags: data.tags.map((tag) => tag.value),
          voice_actor: [user?.userName || ""], //之後要增加多位聲優
        };

        navigate(`/user/${user?.userName}`);

        const storyId = await dbApi.uploadAudioAndSaveStory(file, imageFile, storyData);
        for (const tag of data.tags) {
          await dbApi.addOrUpdateTag(tag.value, storyId, null);
        }
        window.alert("成功上傳");
      } catch (error) {
        console.error("Error uploading story and audio:", error);
      }
    }
  };
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Upload Section</h2>
      {!isAudioUploaded ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Audio</label>
            <input type="file" accept="audio/*" onChange={handleAudioUpload} ref={AudioInputRef} />
          </div>
        </>
      ) : (
        <>
          <div>
            <h6>
              Audio Name: {audioName} <br />
              Audio Duration: {audioDuration ? `${audioDuration.toFixed(2)} seconds` : "Loading..."}
            </h6>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input className="border border-input w-full" {...register("title", { required: true })} />
              {errors.title && <span className="text-red-500 text-sm">This field is required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Intro</label>
              <input className="border border-input w-full" {...register("intro", { required: true })} />
              {errors.intro && <span className="text-red-500 text-sm">This field is required</span>}
            </div>
            <div>
              <label>Summary</label>
              <textarea {...register("summary", { required: true })} className="border border-input w-full" />
              {errors.summary && <span className="text-red-500 text-sm">This field is required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <Select
                options={filteredCategoryOptions}
                onChange={(selectedOption) => setValue("category", selectedOption?.value || "")}
              />
              {errors.category && <span className="text-red-500 text-sm">This field is required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tags</label>
              <CreatableSelect
                isMulti
                options={tagsOptions}
                onChange={(selectedOptions) =>
                  setValue("tags", [...selectedOptions] as { value: string; label: string }[])
                }
              />
              {errors.tags && <span className="text-red-500 text-sm">This field is required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Scheduled Release Date</label>
              <input
                className="border border-input w-full"
                type="datetime-local"
                {...register("scheduled_release_date", { required: true })}
              />
              {errors.scheduled_release_date && <span className="text-red-500 text-sm">This field is required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cover Image</label>
              <input className="border border-input w-full" type="file" accept="image/*" onChange={handleImageUpload} />
              {imageUrl && <img src={imageUrl} alt="Uploaded" className="mt-2" />}
            </div>
            <button className="flex items-center size-default bg-primary text-white " type="submit">
              Submit
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default UploadStory;
