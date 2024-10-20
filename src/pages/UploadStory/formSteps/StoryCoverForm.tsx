import { Button, Input } from "@nextui-org/react";
import { useFormContext } from "react-hook-form";
import { useToast } from "../../../hooks/useToast";

const StoryCoverForm = ({
  onNext,
  onPrev,
  imageUrl,
  onImageUpload,
}: {
  onNext: () => void;
  onPrev: () => void;
  imageUrl: string | null;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const {
    register,
    trigger,
    formState: { errors },
  } = useFormContext();

  const { showToastMessage } = useToast();

  const validateAndProceed = async () => {
    const isValid = await trigger(["img_url"]);

    if (isValid) {
      onNext();
    } else {
      showToastMessage("請填寫所有必填字段");
    }
  };

  return (
    <div>
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
          {...register("img_url", { required: true })}
          onChange={onImageUpload}
        />
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Uploaded"
            className="mt-2 h-48 rounded-sm border-2 border-default-200"
          />
        )}
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
          color="primary"
          className="rounded-full sm:rounded-sm"
          onClick={validateAndProceed}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default StoryCoverForm;
