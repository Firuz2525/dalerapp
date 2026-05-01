// @/components/admin/ManualOrderModal.tsx
import React from "react";

interface ManualOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isUploading: boolean;
  form: any;
  setForm: (form: any) => void;
}

interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number";
}

export default function ManualOrderModal({
  isOpen,
  onClose,
  onSubmit,
  isUploading,
  form,
  setForm,
}: ManualOrderModalProps) {
  if (!isOpen) return null;

  const updateForm = (updates: any) => setForm({ ...form, ...updates });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-end">
      <div className="bg-white w-full max-w-lg h-full p-8 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center mb-10">
          <h2 className="font-black uppercase text-2xl italic tracking-tighter">
            Manual Order
          </h2>
          <button
            onClick={onClose}
            className="text-[10px] font-black underline hover:text-red-600 transition-colors"
          >
            YOPISH
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Image Upload Area */}
          <div className="border-2 border-dashed p-8 text-center relative hover:bg-gray-50 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                updateForm({ imageFile: e.target.files?.[0] || null })
              }
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            <p className="text-[10px] font-black uppercase text-gray-400">
              {form.imageFile ? `✓ ${form.imageFile.name}` : "Rasm yuklash +"}
            </p>
          </div>

          {/* Customer Fields */}
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Mijoz Ismi"
              value={form.customerName}
              onChange={(v) => updateForm({ customerName: v })}
            />
            <InputField
              label="Telefon"
              value={form.phone}
              onChange={(v) => updateForm({ phone: v })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Telegram"
              value={form.telegram}
              onChange={(v) => updateForm({ telegram: v })}
            />
            <InputField
              label="Shahar"
              value={form.city}
              onChange={(v) => updateForm({ city: v })}
            />
          </div>

          <InputField
            label="Manzil"
            value={form.address}
            onChange={(v) => updateForm({ address: v })}
          />

          {/* Product Fields Section */}
          <div className="bg-gray-50 p-5 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Brand"
                value={form.brand}
                onChange={(v) => updateForm({ brand: v })}
              />
              <InputField
                label="Mahsulot"
                value={form.productName}
                onChange={(v) => updateForm({ productName: v })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Narxi ($)"
                type="number"
                value={form.price === 0 ? "" : form.price}
                onChange={(v) => updateForm({ price: Number(v) || 0 })}
              />
              <InputField
                label="Soni"
                type="number"
                value={form.quantity === 0 ? "" : form.quantity}
                onChange={(v) => updateForm({ quantity: Number(v) || 0 })}
              />
            </div>
          </div>

          <button
            disabled={isUploading}
            type="submit"
            className="w-full bg-black text-white py-4 font-black uppercase tracking-[0.2em] text-xs hover:bg-zinc-800 disabled:bg-gray-400 transition-all shadow-lg"
          >
            {isUploading ? "YUKLANMOQDA..." : "SAQLASH"}
          </button>
        </form>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
}: InputFieldProps) {
  return (
    <label className="block">
      <span className="text-[9px] font-black uppercase text-gray-400">
        {label}
      </span>
      <input
        required={label !== "Telegram"}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-b py-2 outline-none text-sm font-bold bg-transparent focus:border-black transition-colors"
      />
    </label>
  );
}
