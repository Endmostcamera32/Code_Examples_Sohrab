import { twMerge } from "tailwind-merge"

export default function Button({ children, className, ...props }) {
  const merged = twMerge(
    "mt-4 group relative w-full py-2 flex justify-center px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
    className
  )
  return (
    <div
    className="mx-2 md:mx-44"
    >
    <button
      {...props}
      className={merged}>
      {children}
    </button>
    </div>
  )
}