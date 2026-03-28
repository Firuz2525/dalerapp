type Props = {
  children: React.ReactNode;
  type?: "button" | "submit";
};

export default function Button({ children, type = "button" }: Props) {
  return (
    <button
      type={type}
      className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
    >
      {children}
    </button>
  );
}
