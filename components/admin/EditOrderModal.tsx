import React from "react";
import Image from "next/image";

interface EditOrderModalProps {
  order: any | null;
  isOpen: boolean;
  onClose: () => void;
  onMoveToShipping: () => void;
  onZoom: (url: string) => void;
  form: {
    quantity: number;
    price: number;
    deposit: number;
    description: string;
  };
  setForm: (form: any) => void;
}

export default function EditOrderModal({
  order,
  isOpen,
  onClose,
  onMoveToShipping,
  onZoom,
  form,
  setForm,
}: EditOrderModalProps) {
  if (!isOpen || !order) return null;

  const updateField = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const remainingBalance = form.price * form.quantity - form.deposit;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-end">
      <div className="bg-white w-full max-w-md h-full p-8 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        <button
          onClick={onClose}
          className="text-[10px] font-black underline mb-8 hover:text-gray-600"
        >
          YOPISH
        </button>

        {/* Product Header Card */}
        <div className="bg-gray-50 p-4 border mb-8 flex gap-4 items-center">
          <div
            className="relative w-16 h-16 border bg-white cursor-zoom-in shrink-0"
            onClick={() => onZoom(order.productThumbnail)}
          >
            <Image
              src={order.productThumbnail}
              alt={order.productName}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <div className="overflow-hidden">
            <span className="text-[8px] font-black bg-black text-white px-1 rounded">
              #{order.id.slice(0, 6)}
            </span>
            <h3 className="text-sm font-bold truncate">{order.productName}</h3>
            <p className="text-[10px] text-gray-500 uppercase truncate">
              {order.customer.name}
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="space-y-6">
          <EditInput
            label="Soni"
            type="number"
            value={form.quantity === 0 ? "" : form.quantity}
            onChange={(v) => updateField("quantity", Number(v) || 0)}
          />

          <EditInput
            label="Sotuv Narxi"
            type="number"
            className="text-red-600"
            value={form.price === 0 ? "" : form.price}
            onChange={(v) => updateField("price", Number(v) || 0)}
          />

          <EditInput
            label="Zaklad"
            type="number"
            className="text-green-600"
            value={form.deposit === 0 ? "" : form.deposit}
            onChange={(v) => updateField("deposit", Number(v) || 0)}
          />

          <label className="block">
            <span className="text-[10px] font-black uppercase text-gray-400">
              Izoh
            </span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="w-full border-2 p-3 text-sm focus:border-black outline-none transition-colors mt-1"
              placeholder="Eslatma yozing..."
            />
          </label>

          {/* Totals & Action */}
          <div className="bg-black p-6 text-white text-center rounded-sm">
            <p className="text-[10px] uppercase text-gray-400 tracking-widest">
              Qolgan summa:
            </p>
            <p className="text-4xl font-black italic mb-6">
              ${remainingBalance.toLocaleString()}
            </p>
            <button
              onClick={onMoveToShipping}
              className="w-full bg-white text-black py-4 font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
            >
              Shippingga O'tkazish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Sub-component for clean inputs
interface EditInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
}

function EditInput({
  label,
  value,
  onChange,
  type = "text",
  className = "",
}: EditInputProps) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase text-gray-400">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border-b-2 py-2 outline-none font-bold text-xl bg-transparent focus:border-black transition-colors ${className}`}
      />
    </label>
  );
}
