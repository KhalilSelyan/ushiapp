import Link from "next/link";
import React from "react";

function FourOhFour() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-900">
      <div className="  py-8 px-4 lg:py-16 lg:px-6">
        <div className=" text-center">
          <h1 className="mb-4 text-7xl font-extrabold tracking-tight text-purple-600 dark:text-purple-500 lg:text-9xl">
            404
          </h1>
          <p className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Something&apos;s missing.
          </p>
          <p className="mb-4 text-lg font-light text-gray-400">
            Sorry, we can&apos;t find that page. You&apos;ll find lots to
            explore on the home page.{" "}
          </p>
          <Link href="/">
            <a className="my-4 inline-flex rounded-lg bg-purple-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-900">
              Back to Homepage
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default FourOhFour;
