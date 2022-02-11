import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Image from "next/image";
import { SyntheticEvent, useRef, useState } from "react";
import { isBefore } from "date-fns";
import prisma from "../../utils/prisma";
import { saveAs } from "file-saver";

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (!context.params) {
    return {
      notFound: true,
    };
  }

  const file = await prisma.file.findUnique({
    where: {
      id: context.params.fileId as string,
    },
  });

  if (
    !file ||
    (file.maxDownloads > 0 && file.remainingDownloads === 0) ||
    isBefore(file.validUntil, new Date())
  ) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      file: {
        id: file.id,
        description: file.description,
        needsPassword: file.password !== null,
      },
    },
  };
};

const Download: NextPage = ({
  file,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [password, setPassword] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  const [downloaded, setDownloaded] = useState(false);

  const togglePasswordVisibility = (e: SyntheticEvent) => {
    e.preventDefault();
    setPasswordVisible(!passwordVisible);
  };

  const onSubmitHandler = async (e: SyntheticEvent) => {
    e.preventDefault();

    const res = await fetch(`/api/files/${file.id}/download`, {
      headers: {
        Authorization: `Bearer ${Buffer.from(password).toString("base64")}`,
      },
      credentials: "include",
    });

    let filename: string | undefined;

    const contentDisposition = res.headers.get("content-disposition");
    if (contentDisposition !== null) {
      const chunk = contentDisposition
        .split(";")
        .find((n) => n.includes("filename="));

      if (chunk) {
        filename = chunk.replace("filename=", "").trim();
      }
    }

    const data = await res.blob();

    saveAs(data, filename);

    setDownloaded(true);
  };

  if (downloaded) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-200 py-2">
        <main className="rounded bg-white px-8 py-6 shadow-md">
          <h1 className="text-2xl">File Downloaded Successfully</h1>
        </main>
      </div>
    );
  }

  const passwordField = (
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
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-200 py-2">
      <main className="rounded bg-white px-8 py-6 shadow-md">
        <form onSubmit={onSubmitHandler} autoComplete="off">
          {file.needsPassword ? passwordField : null}

          <button>Download</button>
        </form>
      </main>
    </div>
  );
};

export default Download;
