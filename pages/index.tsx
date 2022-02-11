import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-200 py-2">
      <Head>
        <title>File Vault</title>
        <meta
          name="description"
          content="Secure Limited Download File Sharing"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center rounded bg-white px-20 py-16 text-center shadow-md">
        <h1 className="text-4xl">File Vault</h1>
        <h2 className="text-2xl">Secure Limited Time File Sharing</h2>
        <div className="mt-4">
          <span className="underline">
            <Link href={"/upload"}>Upload a File</Link>
          </span>
        </div>
      </main>

      <footer></footer>
    </div>
  );
};

export default Home;
