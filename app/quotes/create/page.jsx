"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { uploadImage, createQuote } from "../../../lib/api";
import Navbar from "../../../components/Navbar";
import toast from "react-hot-toast";

const schema = yup.object().shape({
  text: yup.string().required("Quote text is required"),
  image: yup
    .mixed()
    .test("fileRequired", "Image is required", (value) => value && value.length > 0)
    .test("fileFormat", "Unsupported file format", (value) =>
      value && ["image/jpeg", "image/png", "image/gif"].includes(value[0]?.type)
    ),
});

export default function CreateQuotePage() {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsUploading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }
      const mediaData = await uploadImage(data.image[0]);
      await createQuote(data.text, mediaData.mediaUrl, token);
      toast.success('Quote created successfully!');
      router.push("/quotes");
    } catch (error) {
      toast.error('Failed to create quote. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      setValue("image", [file]);
      clearErrors("image");
    } else {
      setFileName("");
      setValue("image", null);
    }
  };

  useEffect(() => {
    register("image");
  }, [register]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar title="Create Quote" />
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="bg-white p-8 rounded-[24px] shadow-md max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center text-neutral-950">
            Create Quote
          </h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="mb-4">
              <label
                htmlFor="text"
                className="block text-sm font-medium text-gray-700"
              >
                Quote Text
              </label>
              <textarea
                id="text"
                {...register("text")}
                className="text-neutral-950 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-600 focus:border-gray-500 resize-y min-h-[100px]"
              />
              {errors.text && (
                <p className="mt-1 text-sm text-red-600">{errors.text.message}</p>
              )}
            </div>
            <div className="mb-4">
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700"
              >
                Image
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Choose File
                </button>
                <span className="ml-3 text-sm text-gray-500">
                  {fileName || "No file chosen"}
                </span>
              </div>
              {errors.image && (
                <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isUploading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-neutral-950 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : "Create Quote"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
