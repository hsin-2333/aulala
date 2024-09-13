import { useForm, SubmitHandler } from "react-hook-form";
import dbApi from "../../utils/firebaseService";
import { getAuth } from "firebase/auth";

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
    formState: { errors },
  } = useForm<IFormInput>();
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
      };

      await dbApi.createUser(userData);
    } catch (error) {
      console.error("Error adding user data: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>User Name</label>
      <input {...register("userName", { required: true, maxLength: 20 })} />
      {errors?.userName?.type === "required" && <p>This field is required</p>}
      {errors?.userName?.type === "maxLength" && (
        <p>First name cannot exceed 20 characters</p>
      )}
      <label>Age</label>
      <input type="number" {...register("age", { min: 12, max: 99 })} />
      {errors.age && (
        <p>You Must be older then 12 and younger then 99 years old</p>
      )}
      <label>Gender</label>
      <select {...register("gender")}>
        <option value="female">female</option>
        <option value="male">male</option>
        <option value="other">non-binary</option>
      </select>
      <input type="submit" />
    </form>
  );
};

export default UserSignUpForm;
