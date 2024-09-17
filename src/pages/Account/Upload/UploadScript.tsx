import React, { useState, useEffect, useContext } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import dbApi from "../../../utils/firebaseService";
import { CategoryOptions } from "../../../constants/categoryOptions";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { AuthContext } from "../../../context/AuthContext";

interface ScriptFormData {
  title: string;
  summary: string;
  content: string;
  language: string[];
  category: string;
  tags: { label: string; value: string }[];
  url: string;
  img_url: string[];
  author: string;
}

const UploadScript = () => {
  const { user } = useContext(AuthContext);
  const [file, setFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [tagsOptions, setTagsOptions] = useState<{ value: string; label: string }[]>([]);
  const navigate = useNavigate();
  const filteredCategoryOptions = CategoryOptions.filter((option) => option.label !== "All");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ScriptFormData>();

  useEffect(() => {
    const fetchTags = async () => {
      const tags = await dbApi.getTags();
      setTagsOptions(tags.map((tag: string) => ({ label: tag, value: tag })));
    };
    fetchTags();
  }, []);

  const handleScriptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const imageUrl = URL.createObjectURL(selectedFile);
      setImageUrl(imageUrl);
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

  const onSubmit = async (data: ScriptFormData) => {
    if (file) {
      try {
        const scriptData = {
          ...data,
          author: user?.userName,
        };
        const scriptId = await dbApi.uploadScript(file, imageFile, scriptData);
        for (const tag of data.tags) {
          await dbApi.addOrUpdateTag(tag.value, scriptId, null);
        }
        window.alert("成功上傳");
      } catch (error) {
        console.error("Error uploading script:", error);
      } finally {
        navigate(`/account/${user?.userName}/contents?tab=script`);
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Upload Script</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input {...register("title", { required: true })} />
          {errors.title && <span className="text-red-500 text-sm">This field is required</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload Script</label>
          <input type="file" accept=".doc,.docx,.pdf" onChange={handleScriptUpload} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cover Image</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {imageUrl && <img src={imageUrl} alt="Uploaded" className="mt-2" />}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Summary</label>
          <textarea {...register("summary", { required: true })} />
          {errors.summary && <span className="text-red-500 text-sm">This field is required</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Content</label>
          <textarea {...register("content", { required: true })} />
          {errors.content && <span className="text-red-500 text-sm">This field is required</span>}
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
            onChange={(selectedOptions) => setValue("tags", [...selectedOptions] as { value: string; label: string }[])}
          />
          {errors.tags && <span className="text-red-500 text-sm">This field is required</span>}
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default UploadScript;