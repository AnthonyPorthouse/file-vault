import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

const Home: NextPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>File Vault</title>
        <meta
          name="description"
          content="Secure Limited Download File Sharing"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-4xl">File Vault</h1>
        <h2 className="text-2xl">Secure Limited Time File Sharing</h2>
      </main>

      <footer></footer>
    </div>
  );
};

export default Home;
