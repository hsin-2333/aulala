import { Button, Input } from "@nextui-org/react";
import { useFormContext } from "react-hook-form";
import { useToast } from "../../../hooks/useToast";

const StoryInfoForm = ({
  onNext,
}: {
  onNext: () => void;
  onPrev?: () => void;
}) => {
  const {
    register,
    trigger,
    formState: { errors },
  } = useFormContext();

  const { showToastMessage } = useToast();

  const validateAndProceed = async () => {
    const isValid = await trigger(["title", "intro", "summary"]);

    if (isValid) {
      onNext();
    } else {
      showToastMessage("請填寫所有必填字段");
    }
  };

  return (
    <div className="h-full">
      <div className="mt-4 border border-transparent">
        <Input
          label="Title"
          isRequired
          placeholder="Your Audio Story Title"
          labelPlacement="outside"
          radius="sm"
          variant="bordered"
          defaultValue="The Watcher's Keep -Demo"
          {...register("title", {
            required: true,
            setValueAs: (value: string) => value.trim(),
          })}
        />
        {errors.title && (
          <span className="text-sm text-red-500">This field is required</span>
        )}
      </div>
      <div className="mt-4 border border-transparent">
        <Input
          label="Intro"
          isRequired
          placeholder="Enter intro"
          labelPlacement="outside"
          radius="sm"
          variant="bordered"
          defaultValue="Hope you enjoy this story!"
          {...register("intro", {
            required: true,
            setValueAs: (value: string) => value.trim(),
          })}
        />
        {errors.intro && (
          <span className="text-sm text-red-500">This field is required</span>
        )}
      </div>
      <div className="mt-4 border border-transparent">
        <Input
          label="Summary"
          isRequired
          placeholder="Enter summary"
          labelPlacement="outside"
          radius="sm"
          variant="bordered"
          defaultValue="From the time when there was still magic in the land, and there were elves and wizards and dwarves and dragons and griffins and —"
          {...register("summary", {
            required: true,
            setValueAs: (value: string) => value.trim(),
          })}
        />
        {errors.summary && (
          <span className="text-sm text-red-500">This field is required</span>
        )}
      </div>
      <div className="fixed bottom-0 left-4 right-4 flex w-[calc(100%-2rem)] justify-end sm:static sm:mt-4 sm:w-full">
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

export default StoryInfoForm;
