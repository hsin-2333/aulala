import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { CategoryOptions } from "../../constants/categoryOptions";
import { AuthContext } from "../../context/AuthContext";
import dbApi from "../../utils/firebaseService";

interface ScriptFormData {
  title: string;
  summary: string;
  content: string;
  language: string;
  category: string;
  tags: { label: string; value: string }[];
  url: string;
  img_url: string[];
  author: string;
  vaUsers: { label: string; value: string }[];
}

const UploadScript = () => {
  const { user } = useContext(AuthContext);
  const [file, setFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [tagsOptions, setTagsOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [vaUsersOptions, setVaUsersOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const navigate = useNavigate();
  const filteredCategoryOptions = CategoryOptions.filter(
    (option) => option.label !== "All",
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ScriptFormData>();

  const languageOptions = [
    { value: "English", label: "English" },
    { value: "Mandarin", label: "Mandarin" },
    { value: "Spanish", label: "Spanish" },
  ];

  useEffect(() => {
    const fetchTags = async () => {
      const tags = await dbApi.getTags();
      setTagsOptions(tags.map((tag: string) => ({ label: tag, value: tag })));
    };
    fetchTags();

    const fetchVaUsers = async () => {
      const vaUsers = await dbApi.getVAs();
      setVaUsersOptions(
        vaUsers.map((user: { userName: string }) => ({
          label: user.userName,
          value: user.userName,
        })),
      );
    };
    fetchVaUsers();
  }, []);

  const handleScriptUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const imageUrl = URL.createObjectURL(selectedFile);
      setImageUrl(imageUrl);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setImageFile(selectedFile);
      const imageUrl = URL.createObjectURL(selectedFile);
      setImageUrl(imageUrl);
    }
  };

  const onSubmit = async (data: ScriptFormData) => {
    if (file) {
      try {
        const scriptData = {
          ...data,
          author: user?.userName || "Unknown",
          tags: data.tags.map((tag) => tag.value),
        };
        const scriptId = await dbApi.uploadScript(file, imageFile, scriptData);
        for (const tag of data.tags) {
          await dbApi.addOrUpdateTag(tag.value, scriptId, null);
        }

        for (const vaUser of data.vaUsers) {
          await dbApi.sendNotification({
            recipient: vaUser.value,
            message: `A new script titled "${data.title}" has been uploaded.`,
            link: `/script/${scriptId}`,
          });
        }

        window.alert("成功上傳");
      } catch (error) {
        console.error("Error uploading script:", error);
      } finally {
        navigate(`/user/${user?.userName}`);
      }
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Upload Script</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            className="w-full border-2 border-default-200"
            {...register("title", { required: true })}
          />
          {errors.title && (
            <span className="text-sm text-red-500">This field is required</span>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Upload Script
          </label>
          <input
            className="w-full border-2 border-default-200"
            type="file"
            accept=".doc,.docx,.pdf"
            onChange={handleScriptUpload}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cover Image
          </label>
          <input
            className="border-input w-full border"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
          {imageUrl && <img src={imageUrl} alt="Uploaded" className="mt-2" />}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Summary
          </label>
          <textarea
            className="border-input w-full border"
            {...register("summary", { required: true })}
          />
          {errors.summary && (
            <span className="text-sm text-red-500">This field is required</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            className="border-input w-full border"
            {...register("content", { required: true })}
          />
          {errors.content && (
            <span className="text-sm text-red-500">This field is required</span>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <Select
            options={filteredCategoryOptions}
            onChange={(selectedOption) =>
              setValue("category", selectedOption?.value || "")
            }
          />
          {errors.category && (
            <span className="text-sm text-red-500">This field is required</span>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tags
          </label>
          <CreatableSelect
            isMulti
            options={tagsOptions}
            onChange={(selectedOptions) =>
              setValue("tags", [...selectedOptions] as {
                value: string;
                label: string;
              }[])
            }
          />
          {errors.tags && (
            <span className="text-sm text-red-500">This field is required</span>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Language
          </label>
          <Select
            options={languageOptions}
            onChange={(selectedOption) =>
              setValue("language", selectedOption?.value || "")
            }
          />
          {errors.language && (
            <span className="text-sm text-red-500">This field is required</span>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Invite Voice Actors to join
          </label>
          <Select
            isMulti
            options={vaUsersOptions}
            onChange={(selectedOptions) =>
              setValue("vaUsers", [...selectedOptions] as {
                value: string;
                label: string;
              }[])
            }
          />
          {errors.vaUsers && (
            <span className="text-sm text-red-500">This field is required</span>
          )}
        </div>
        <button
          className="flex h-10 items-center bg-primary pb-2 pl-4 pr-4 pt-2 text-white"
          type="submit"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default UploadScript;
