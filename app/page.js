"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import { login } from "../lib/api";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";

const schema = yup.object().shape({
  username: yup.string().required("Username is required"),
  otp: yup
    .array()
    .of(yup.string().matches(/^\d$/, "OTP is required").required("Required"))
    .length(4, "OTP must be 4 digits")
    .test("all-filled", "All OTP fields must be filled", (value) => value.every((digit) => digit !== "")),
});

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, watch, setValue, trigger } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      otp: ['', '', '', '']
    }
  });

  const onSubmit = async (data) => {
    try {
      const otpValue = data.otp.join('');
      const response = await login(data.username, otpValue);
      localStorage.setItem("token", response.token);
      toast.success('Successfully logged in!');
      router.push("/quotes");
    } catch (error) {
      toast.error('Login failed. Please try again.');
    }
  };

  const handleOtpChange = (index, e) => {
    e.preventDefault();
    const value = e.target.value;
    const newOtp = [...watch('otp')];
    if (e.nativeEvent.inputType === 'deleteContentBackward') {
      if (newOtp[index] === '') {
        if (index > 0) {
          newOtp[index - 1] = '';
          setValue('otp', newOtp);
          document.getElementById(`otp-${index - 1}`).focus();
        }
      } else {
        newOtp[index] = '';
        setValue('otp', newOtp);
      }
    } 
    else if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      newOtp[index] = value;
      setValue('otp', newOtp);
      if (value && index < 3) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
    trigger('otp');
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault(); 
      const newOtp = [...watch('otp')];
      
      if (newOtp[index] === '' && index > 0) {
        document.getElementById(`otp-${index - 1}`).focus();
      } else {
        newOtp[index] = '';
        setValue('otp', newOtp);
      }
      trigger('otp');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar title="Quote App" />
      <div className="flex-grow flex items-center justify-center bg-gray-100 px-4 sm:px-16 lg:px-20">
        <div className="bg-white p-8 rounded-[24px] shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-neutral-950">
            Login
          </h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                {...register("username")}
                className="text-neutral-950 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-neutral-500 focus:border-neutral-500"
              />
              <p className="text-red-500 text-xs mt-1 h-4 min-h-[1rem]">{errors.username?.message}</p>
            </div>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                OTP
              </label>
              <div className="flex space-x-2 mt-1">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    type="text"
                    id={`otp-${index}`}
                    {...register(`otp.${index}`)}
                    maxLength={1}
                    className="text-neutral-950 w-12 h-12 text-center px-0 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-neutral-500 focus:border-neutral-500"
                    onChange={(e) => handleOtpChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                  />
                ))}
              </div>
              <p className="text-red-500 text-xs mt-1 h-4 min-h-[1rem]">
                {errors.otp?.message || errors.otp?.[0]?.message || errors.otp?.[1]?.message || errors.otp?.[2]?.message || errors.otp?.[3]?.message}
              </p>
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-[8px] shadow-sm text-sm font-medium text-white bg-neutral-950 hover:bg-neutral-900 focus:outline-none cursor-pointer"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}