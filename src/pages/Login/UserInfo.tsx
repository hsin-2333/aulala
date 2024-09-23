import { useForm, SubmitHandler } from "react-hook-form";
import dbApi from "../../utils/firebaseService";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import debounce from "../../utils/debounce";

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
      window.location.reload(); // 強制重新載入頁面
    } catch (error) {
      console.error("Error adding user data: ", error);
    }
  };

  return (
    <div className="flex align-middle flex-col mx-auto mt-32">
      <h2 className="text-2xl font-bold mb-10">User Sign Up</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left w-96">
        <div>
          <label className="block text-sm font-medium text-gray-700">User Name</label>
          <input className="border border-input w-full" {...register("userName", { required: true, maxLength: 20 })} />
          {errors?.userName?.type === "required" && <p className="text-red-500 text-sm">This field is required</p>}
          {errors?.userName?.type === "maxLength" && (
            <p className="text-red-500 text-sm">First name cannot exceed 20 characters</p>
          )}
          {!isUSerNameAvailable && <p className="text-red-500 text-sm">Username is already taken</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Age</label>
          <input
            type="number"
            className="border border-input w-full"
            {...register("age", { min: 12, max: 99, required: true })}
          />
          {errors.age && (
            <p className="text-red-500 text-sm">You must be older than 12 and younger than 99 years old</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select className="border border-input w-full" {...register("gender", { required: true })}>
            <option value="female">female</option>
            <option value="male">male</option>
            <option value="other">non-binary</option>
          </select>
          {errors.gender && <p className="text-red-500 text-sm">Gender is required</p>}
        </div>
        <button
          className=" rounded-md flex items-center size-default bg-primary text-white"
          type="submit"
          disabled={!isValid || !isUSerNameAvailable}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default UserSignUpForm;
