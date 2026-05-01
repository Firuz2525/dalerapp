// @/components/admin/OrdersHeader.tsx

interface OrdersHeaderProps {
  view: "orders" | "shipping" | "completed" | "delivered"; // Added delivered
  setView: (view: "orders" | "shipping" | "completed" | "delivered") => void;
  counts: {
    orders: number;
    shipping: number;
    completed: number;
    delivered: number; // Added delivered count
  };
  onOpenManualModal: () => void;
}

export default function OrdersHeader({
  view,
  setView,
  counts,
  onOpenManualModal,
}: OrdersHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
      <div className="flex gap-8 border-b w-full md:w-auto">
        <button
          onClick={() => setView("orders")}
          className={`text-xs font-black uppercase tracking-widest pb-2 transition-all ${
            view === "orders" ? "border-b-2 border-black" : "text-gray-400"
          }`}
        >
          Buyurtmalar ({counts.orders})
        </button>
        <button
          onClick={() => setView("shipping")}
          className={`text-xs font-black uppercase tracking-widest pb-2 transition-all ${
            view === "shipping" ? "border-b-2 border-black" : "text-gray-400"
          }`}
        >
          Shipping ({counts.shipping})
        </button>
        <button
          onClick={() => setView("completed")}
          className={`text-xs font-black uppercase tracking-widest pb-2 transition-all ${
            view === "completed" ? "border-b-2 border-black" : "text-gray-400"
          }`}
        >
          Tugallanganlar ({counts.completed})
        </button>

        {/* NEW DELIVERED HEADER */}
        <button
          onClick={() => setView("delivered")}
          className={`text-xs font-black uppercase tracking-widest pb-2 transition-all ${
            view === "delivered" ? "border-b-2 border-black" : "text-gray-400"
          }`}
        >
          Yetkazilganlar ({counts.delivered})
        </button>
      </div>

      <button
        onClick={onOpenManualModal}
        className="bg-black text-white px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
      >
        Manual Order +
      </button>
    </div>
  );
}
