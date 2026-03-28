import React from "react";

type Props = {
  label: string;
  type?: string;
  placeholder?: string;
  // Add these for form functionality
  value?: string | number;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
};

export default function InputField({
  label,
  type = "text",
  placeholder,
  value,
  name,
  onChange,
  required = false,
}: Props) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-1 text-gray-700">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
      />
    </div>
  );
}
// type Props = {
//   label: string;
//   type?: string;
//   placeholder?: string;
// };

// export default function InputField({
//   label,
//   type = "text",
//   placeholder,
// }: Props) {
//   return (
//     <div>
//       <label className="block text-sm mb-1">{label}</label>
//       <input
//         type={type}
//         placeholder={placeholder}
//         className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
//       />
//     </div>
//   );
// }
