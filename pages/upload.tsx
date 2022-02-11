import { NextPage } from "next";
import Image from "next/image";
import { SyntheticEvent, useRef, useState } from "react";

interface FileId {
  id: string;
}

const Upload: NextPage = () => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [description, setDescription] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [maxDownloads, setMaxDownloads] = useState<string>("0");

  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  const togglePasswordVisibility = (e: SyntheticEvent) => {
    e.preventDefault();
    setPasswordVisible(!passwordVisible);
  };

  const onSubmitHandler = async (e: SyntheticEvent) => {
    e.preventDefault();

    const fileUploadRequest: FileId = await (
      await createFileUploadRequest(
        description,
        password,
        duration,
        maxDownloads
      )
    ).json();

    const file = await uploadFile(fileUploadRequest.id as string);
  };

  const createFileUploadRequest = async (
    description: string,
    password: string,
    duration: string,
    maxDownloads: string
  ) => {
    return await fetch("/api/files", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description,
        password,
        validFor: duration,
        maxDownloads: Number(maxDownloads),
      }),
    });
  };

  const uploadFile = async (fileId: string) => {
    const formData = new FormData();

    if (!fileRef.current || !fileRef.current?.files) {
      return;
    }

    formData.append("file", fileRef.current.files[0]);

    return await fetch(`/api/files/${fileId}`, {
      method: "PUT",
      body: formData,
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-200 py-2">
      <main className="rounded bg-white px-8 py-6 shadow-md">
        <form ref={formRef} onSubmit={onSubmitHandler}>
          <div className="mb-4">
            <label htmlFor="description" className="mb-2 block font-bold">
              Description
            </label>
            <input
              className="focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none"
              type="text"
              id="description"
              name="description"
              placeholder="Description"
              onChange={(e) => {
                setDescription(e.currentTarget.value);
              }}
              value={description}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="mb-2 block font-bold">
              Password
            </label>
            <div className="focus:shadow-outline flex w-full justify-between rounded border py-2 px-3 leading-tight text-gray-700 shadow">
              <input
                className="appearance-none focus:outline-none"
                type={passwordVisible ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Password"
                onChange={(e) => {
                  setPassword(e.currentTarget.value);
                }}
                value={password}
              />

              <div
                onClick={togglePasswordVisibility}
                className="flex w-full flex-col justify-center"
              >
                {passwordVisible ? (
                  <Image
                    src={"/eye-off.svg"}
                    alt={"Hide Password"}
                    width={20}
                    height={20}
                  />
                ) : (
                  <Image
                    src={"/eye.svg"}
                    alt={"Show Password"}
                    width={20}
                    height={20}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="duration" className="mb-2 block font-bold">
              Valid For
            </label>
            <input
              className="focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none"
              type="text"
              id="duration"
              name="duration"
              placeholder="Duration"
              onChange={(e) => {
                setDuration(e.currentTarget.value);
              }}
              value={duration}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="max-downloads" className="mb-2 block font-bold">
              Max Downloads
            </label>
            <input
              className="focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none"
              type="number"
              id="max-downloads"
              name="max-downloads"
              placeholder="Max Downloads"
              onChange={(e) => {
                setMaxDownloads(e.currentTarget.value);
              }}
              value={maxDownloads}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="file" className="mb-2 block font-bold">
              File
            </label>
            <input
              className="focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none"
              type="file"
              id="file"
              name="file"
              ref={fileRef}
            />
          </div>

          <button>Create</button>
        </form>
      </main>
    </div>
  );
};

export default Upload;
