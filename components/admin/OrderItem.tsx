import Image from "next/image";

interface OrderItemProps {
  item: any; // Ideally, replace 'any' with your Order interface
  view: "orders" | "shipping" | "completed";
  onZoom: (url: string) => void;
  onAction: (item: any) => void;
}

export default function OrderItem({
  item,
  view,
  onZoom,
  onAction,
}: OrderItemProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-white border p-4 lg:p-3 hover:border-black transition-all">
      {/* Customer Info */}
      <div className="col-span-2">
        <p className="text-sm font-bold truncate">{item.customer.name}</p>
        <p className="text-[11px] text-gray-500 font-mono italic">
          {item.customer.social || item.customer.phone}
        </p>
      </div>

      {/* Address & Date */}
      <div className="col-span-2">
        <p className="text-[10px] font-black text-gray-900 uppercase mb-1 truncate">
          {item.customer.city}
        </p>
        <p className="text-[11px] text-gray-500 truncate">
          {item.customer.address}
        </p>
        <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">
          {item.localDate || "Sana mavjud emas"}
        </p>
      </div>

      {/* Product Info */}
      <div className="col-span-3 flex items-center gap-3">
        <div
          className="relative w-10 h-10 bg-gray-50 border flex-shrink-0 cursor-zoom-in overflow-hidden"
          onClick={() => onZoom(item.productThumbnail)}
        >
          <Image
            src={item.productThumbnail}
            alt=""
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
        <div className="truncate">
          <p className="text-[9px] font-black text-red-600 uppercase leading-none">
            {item.productBrand}
          </p>
          <p className="text-xs font-bold truncate">{item.productName}</p>
          {item.description && (
            <p className="text-[10px] text-blue-600 italic truncate max-w-[150px]">
              "{item.description}"
            </p>
          )}
        </div>
      </div>

      {/* ID & Quantity */}
      <div className="col-span-1 text-center flex flex-col items-center justify-center">
        <span className="text-[8px] font-black bg-gray-100 px-1 mb-1 text-gray-500 rounded uppercase">
          #{item.id.slice(0, 4)}
        </span>
        <span className="font-bold text-xs leading-none">
          x{item.productQuantity}
        </span>
      </div>

      {/* Pricing Logic */}
      <div className="col-span-2 text-right">
        {view === "orders" ? (
          <span className="font-black text-sm">${item.productPrice}</span>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
            <span className="text-green-600">${item.deposit || 0}</span>
            <span className="text-black font-black">
              ${item.totalRemaining}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="col-span-2 text-right">
        {view === "orders" && (
          <button
            onClick={() => onAction(item)}
            className="bg-black text-white text-[9px] font-black uppercase px-4 py-2 hover:bg-zinc-800"
          >
            Pending
          </button>
        )}
        {view === "shipping" && (
          <span className="bg-blue-50 text-blue-700 text-[8px] font-black uppercase px-2 py-1">
            Shipping
          </span>
        )}
        {view === "completed" && (
          <div className="flex flex-col items-end">
            <span className="bg-green-50 text-green-700 text-[8px] font-black uppercase px-2 py-1 italic">
              Yetkazildi
            </span>
            <p className="text-[8px] text-gray-400 mt-1">
              {item.completedAt?.toDate().toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
