interface OrdersTableLabelsProps {
  view: "orders" | "shipping" | "completed";
}

export default function OrdersTableLabels({ view }: OrdersTableLabelsProps) {
  return (
    <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 text-[10px] font-black uppercase text-gray-400 border mb-2">
      <div className="col-span-2">Mijoz / Telefon</div>
      <div className="col-span-2">Manzil / Sana</div>
      <div className="col-span-3">Mahsulot</div>
      <div className="col-span-1 text-center">ID / Soni</div>
      <div className="col-span-2 text-right">
        {view === "orders" ? "Narxi" : "Zaklad / Qolgan"}
      </div>
      <div className="col-span-2 text-right">Amal</div>
    </div>
  );
}
