import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Image from "next/image";
import { SyntheticEvent, useRef, useState } from "react";
import { isBefore } from "date-fns";
import prisma from "../../utils/prisma";

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
      },
    },
  };
};

const Download: NextPage = ({
  file,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [password, setPassword] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  const togglePasswordVisibility = (e: SyntheticEvent) => {
    e.preventDefault();
    setPasswordVisible(!passwordVisible);
  };

  const onSubmitHandler = async (e: SyntheticEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/files/${file.id}/download`, {
        headers: {
          Authorization: `Bearer ${Buffer.from(password).toString("base64")}`,
        },
      });

      console.log(res);
      const data = await res.blob();

      console.log(data);

      const download = URL.createObjectURL(data);
      console.log(download);
      location.assign(download);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-200 py-2">
      <main className="rounded bg-white px-8 py-6 shadow-md">
        <form onSubmit={onSubmitHandler}>
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

          <button>Download</button>
        </form>
      </main>
    </div>
  );
};

export default Download;
