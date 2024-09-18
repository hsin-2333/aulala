import { useForm, SubmitHandler } from "react-hook-form";
import dbApi from "../../utils/firebaseService";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import debounce from "lodash.debounce";

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
        ...signUpData,
        id: user.uid,
      };

      await dbApi.createUser(userData);
      navigate(`/user/${userData.userName}`);
    } catch (error) {
      console.error("Error adding user data: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>User Name</label>
      <input {...register("userName", { required: true, maxLength: 20 })} />
      {errors?.userName?.type === "required" && <p>This field is required</p>}
      {errors?.userName?.type === "maxLength" && <p>First name cannot exceed 20 characters</p>}
      {!isUSerNameAvailable && <p>Username is already taken</p>}
      <label>Age</label>
      <input type="number" {...register("age", { min: 12, max: 99, required: true })} />
      {errors.age && <p>You Must be older then 12 and younger then 99 years old</p>}
      <label>Gender</label>
      <select {...register("gender", { required: true })}>
        <option value="female">female </option>
        <option value="male">male</option>
        <option value="other">non-binary</option>
      </select>
      {errors.gender && <p>Gender is required</p>}
      <input type="submit" disabled={!isValid || !isUSerNameAvailable} />
    </form>
  );
};

export default UserSignUpForm;
