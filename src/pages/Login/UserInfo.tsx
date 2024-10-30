import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import debounce from "../../utils/debounce";
import dbApi from "../../utils/firebaseService";

enum GenderEnum {
  female = "female",
  male = "male",
  other = "other",
}

interface IFormInput {
  userName: string;
  gender: GenderEnum;
  age: number;
}

const UserSignUpForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<IFormInput>({ mode: "onChange" });
  const navigate = useNavigate();
  const [isUSerNameAvailable, setIsUserNameAvailable] = useState(true);
  const userName = watch("userName");

  const checkUserName = debounce(async (userName: string) => {
    if (!userName) return;
    try {
      const isAvailable = await dbApi.checkUserName(userName);
      setIsUserNameAvailable(isAvailable);
    } catch (e) {
      console.error("Error checking username: ", e);
    }
  }, 500);

  useEffect(() => {
    checkUserName(userName);
  }, [userName, checkUserName]);

  const onSubmit: SubmitHandler<IFormInput> = async (signUpData) => {
    console.log(signUpData);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const userData = {
        uid: user.uid,
        avatar: user.photoURL,
        email: user.email,
        role: "user",
        ...signUpData,
        id: user.uid,
      };

      await dbApi.createUser(userData);
      navigate(`/user/${userData.userName}`);
      window.location.reload();
    } catch (error) {
      console.error("Error adding user data: ", error);
    }
  };

  return (
    <div className="mx-auto mt-32 flex flex-col align-middle">
      <h2 className="mb-10 text-2xl font-bold">User Sign Up</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-96 flex-col gap-4 space-y-4 text-left"
      >
        <div>
          <Input
            type="text"
            label="User Name"
            labelPlacement="outside"
            size="md"
            radius="sm"
            variant="bordered"
            className="w-full text-left"
            placeholder="A Unique User Name"
            {...register("userName", { required: true, maxLength: 20 })}
          />
          {errors?.userName?.type === "required" && (
            <p className="text-sm text-red-500">This field is required</p>
          )}
          {errors?.userName?.type === "maxLength" && (
            <p className="text-sm text-red-500">
              First name cannot exceed 20 characters
            </p>
          )}
          {!isUSerNameAvailable && (
            <p className="text-sm text-red-500">Username is already taken</p>
          )}
        </div>
        <div>
          <Input
            type="number"
            label="Age"
            labelPlacement="outside"
            size="md"
            radius="sm"
            variant="bordered"
            className="w-full text-left"
            placeholder="Your Age"
            {...register("age", { min: 12, max: 99, required: true })}
          />
          {errors.age && (
            <p className="text-sm text-red-500">
              You must be older than 12 and younger than 99 years old
            </p>
          )}
        </div>
        <div>
          <Select
            className="w-full"
            label="Gender"
            labelPlacement="outside"
            variant="bordered"
            size="md"
            radius="sm"
            placeholder="Your gender"
            {...register("gender", { required: true })}
          >
            <SelectItem key="female">female</SelectItem>
            <SelectItem key="male">male</SelectItem>
            <SelectItem key="other">non-binary</SelectItem>
          </Select>
          {errors.gender && (
            <p className="text-sm text-red-500">Gender is required</p>
          )}
        </div>

        <Button
          size="md"
          radius="sm"
          color="primary"
          type="submit"
          isDisabled={!isValid || !isUSerNameAvailable}
        >
          Submit
        </Button>
      </form>
    </div>
  );
};

export default UserSignUpForm;
