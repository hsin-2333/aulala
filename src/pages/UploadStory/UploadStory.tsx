import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Chip,
  Divider,
  Link,
  Progress,
} from "@nextui-org/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FaCheck } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { SlCloudUpload } from "react-icons/sl";
import { useLocation, useNavigate } from "react-router-dom";
import Toast from "../../components/Toast";
import { AuthContext } from "../../context/AuthContext";
import { useToast } from "../../hooks/useToast";
import dbApi from "../../utils/firebaseService";
import StoryCoverForm from "./formSteps/StoryCoverForm";
import StoryInfoForm from "./formSteps/StoryInfoForm";
import StorySettingForm from "./formSteps/StorySettingForm";

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
  const queryClient = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { script_audioName, script_audioUrl } = location.state || {};
  const [isAudioUploaded, setIsAudioUploaded] = useState(!!script_audioUrl);

  const [audioName, setAudioName] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const { toastMessage, showToast, showToastMessage, handleCloseToast } =
    useToast();

  const AudioInputRef = useRef<HTMLInputElement>(null);
  const methods = useForm<FormData>();

  const handleAudioUpload = useCallback(
    async (selectedFile: File) => {
      if (selectedFile) {
        const fileSizeInMB = selectedFile.size / (1024 * 1024);
        if (fileSizeInMB > 8) {
          showToastMessage("文件大小超過8MB，請選擇較小的文件");
          if (AudioInputRef.current) {
            AudioInputRef.current.value = "";
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
    },
    [showToastMessage],
  );

  useEffect(() => {
    if (script_audioUrl) {
      const fileName = script_audioName || "uploaded_audio.mp3";
      fetch(script_audioUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], fileName, { type: blob.type });
          handleAudioUpload(file);
        });
    }
  }, [script_audioUrl, script_audioName, handleAudioUpload]);

  const handleAudioInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      handleAudioUpload(selectedFile);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (file) {
      let storyId: string | null = null;

      try {
        const storyData = {
          ...data,
          duration: audioDuration || 0,
          author: user?.userName || "Unknown",
          tags: data.tags ? data.tags.map((tag) => tag.value) : [],
          voice_actor: [user?.userName || ""],
          status: "Processing",
          collections: data.collections
            ? data.collections.map((collection) => collection)
            : [],
        };

        navigate(`/user/${user?.userName}/uploads`);
        setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey: ["stories", user?.userName],
          });
        }, 2000);

        storyId = await dbApi.uploadAudioAndSaveStory(
          file,
          imageFile,
          storyData,
        );
        if (data.tags) {
          for (const tag of data.tags) {
            await dbApi.addOrUpdateTag(tag.value, storyId, null);
          }
        }

        if (data.collections) {
          for (const collection of data.collections) {
            await dbApi.addStoryToCollection(
              storyId,
              collection,
              user?.userName || "Unknown",
            );
          }
        }
      } catch (error) {
        console.error("Error uploading story and audio:", error);
        if (storyId) {
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

  const resetImage = () => {
    setImageFile(null);
    setImageUrl(null);
    const inputElement = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    if (inputElement) {
      inputElement.value = "";
    }
  };

  return (
    <>
      <div>
        {showToast && (
          <Toast message={toastMessage} onClose={handleCloseToast} />
        )}
      </div>
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
          <div className="mx-2 mt-2 flex items-center justify-center">
            <div className="absolute left-2 top-3 flex justify-center gap-2 self-center">
              <Link href="/" color="foreground">
                <IoIosArrowBack size={20} className="self-center" />
              </Link>
              <span className="text-medium font-bold text-default-800">
                Upload Story
              </span>
            </div>
          </div>
        </div>
      )}
      <div className="container relative mx-auto w-full p-2">
        <Breadcrumbs>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href={`/user/${user?.userName}/uploads`}>
            Uploaded Content
          </BreadcrumbItem>
          <BreadcrumbItem>Upload</BreadcrumbItem>
        </Breadcrumbs>
        {!isAudioUploaded ? (
          <div className="mt-20 flex flex-col items-center gap-4">
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioInputChange}
              ref={AudioInputRef}
              className="hidden"
            />
            <Button
              className="h-32 w-64 flex-col items-center border-2 border-dashed text-primary"
              variant="bordered"
              type="button"
              startContent={<SlCloudUpload size={32} />}
              onClick={() => {
                if (AudioInputRef.current) {
                  AudioInputRef.current.click();
                }
              }}
              radius="sm"
            >
              Upload Audio File
              <label className="block h-1/5 text-xs font-medium text-gray-400">
                Only accept audio below 8 MB
              </label>
            </Button>
          </div>
        ) : (
          <>
            <div>
              <h6 className="mt-10">
                Audio Name: {audioName || script_audioName}
                <br />
                Audio Duration:{" "}
                {audioDuration
                  ? `${audioDuration.toFixed(2)} seconds`
                  : "Loading..."}
              </h6>
            </div>
            <div className="m-8 hidden items-center justify-evenly sm:flex">
              <div className="flex flex-col items-center gap-1">
                {currentStep === 1 ? (
                  <Chip
                    color="primary"
                    className={`text-sm font-bold ${
                      currentStep === 1
                        ? "bg-primary-300"
                        : "border border-slate-300 bg-white text-default-500 shadow-sky-300/20"
                    }`}
                  >
                    1
                  </Chip>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-300 text-xs">
                    <FaCheck className="text-white" />
                  </div>
                )}

                <span className="text-xs text-default-500">Story Info</span>
              </div>
              <Divider className="w-1/4" />
              <div className="flex flex-col items-center gap-1">
                {currentStep <= 2 ? (
                  <Chip
                    color="primary"
                    className={`text-sm font-bold ${
                      currentStep === 2
                        ? "bg-primary-300"
                        : "border border-slate-300 bg-white text-default-500 shadow-sky-300/20"
                    }`}
                  >
                    2
                  </Chip>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-300 text-xs">
                    <FaCheck className="text-white" />
                  </div>
                )}

                <span className="text-xs text-default-500">Story Setting</span>
              </div>
              <Divider className="w-1/4" />
              <div className="flex flex-col items-center gap-1">
                {currentStep <= 3 ? (
                  <Chip
                    color="primary"
                    className={`text-sm font-bold ${
                      currentStep === 3
                        ? "bg-primary-300"
                        : "border border-slate-300 bg-white text-default-500 shadow-sky-300/20"
                    }`}
                  >
                    3
                  </Chip>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-300 text-xs">
                    <FaCheck className="text-white" />
                  </div>
                )}

                <span className="text-xs text-default-500">
                  Add Cover Image
                </span>
              </div>
            </div>
            <FormProvider {...methods}>
              <form
                onSubmit={methods.handleSubmit(onSubmit)}
                className="space-y-4 text-left"
              >
                {currentStep === 1 && (
                  <StoryInfoForm onNext={() => setCurrentStep(2)} />
                )}
                {currentStep === 2 && (
                  <StorySettingForm
                    onNext={() => setCurrentStep(3)}
                    onPrev={() => setCurrentStep(1)}
                  />
                )}
                {currentStep === 3 && (
                  <StoryCoverForm
                    onPrev={() => {
                      resetImage();
                      setCurrentStep(2);
                    }}
                    onNext={methods.handleSubmit(onSubmit)}
                    imageUrl={imageUrl}
                    onImageUpload={handleImageUpload}
                  />
                )}
              </form>
            </FormProvider>
          </>
        )}
      </div>
    </>
  );
};

export default UploadStory;
