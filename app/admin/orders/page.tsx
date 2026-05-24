"use client";

import { useEffect, useState } from "react";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  writeBatch,
  setDoc,
  limit,
  where,
  updateDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { useAuth } from "@/context/AuthContext";
import { useZoom } from "@/context/ZoomContext";
import Spinner from "@/components/ui/Spinner";
import Image from "next/image";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";

interface ProductOrder {
  id: string; // This is the Firestore Document ID
  status: string;
  customer: {
    name: string;
    phone: string;
    city: string;
    address: string;
    size: string;
    social?: string;
  };
  productName: string;
  productPrice: number;
  productQuantity: number;
  productThumbnail: string;
  productBrand?: string;
  productBts: string;
  localDate?: string;
  deposit?: number;
  totalRemaining?: number;
  description?: string;
  movedAt?: any;
  completedAt?: any;
  deliveredAt?: any;
  manual?: boolean;
}

export default function AdminOrders() {
  const router = useRouter();

  const {
    user,
    isAdmin,
    isStaff,
    isAuthorized,
    loading: authLoading,
  } = useAuth();

  const { setZoomedImages } = useZoom();

  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [shippingItems, setShippingItems] = useState<ProductOrder[]>([]);
  const [completedItems, setCompletedItems] = useState<ProductOrder[]>([]);
  const [deliveredItems, setDeliveredItems] = useState<ProductOrder[]>([]);
  const [btsItems, setBtsItems] = useState<ProductOrder[]>([]);

  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const [view, setView] = useState<
    "orders" | "shipping" | "completed" | "delivered" | "bts"
  >("orders");
  const [selectedOrder, setSelectedOrder] = useState<ProductOrder | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const [manualForm, setManualForm] = useState({
    customerName: "",
    phone: "",
    telegram: "",
    address: "",
    city: "",
    brand: "",
    productName: "",
    size: "",
    price: 0,
    quantity: 1,
    imageFile: null as File | null,
  });

  const [editForm, setEditForm] = useState({
    price: 0,
    quantity: 0,
    deposit: 0,
    description: "",
  });
  const displayData =
    view === "orders" && isAdmin
      ? orders
      : view === "shipping"
      ? shippingItems
      : view === "completed"
      ? completedItems
      : view === "delivered"
      ? deliveredItems
      : view === "bts"
      ? btsItems
      : [];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Define all queries
      const ordersQ = query(
        collection(db, "orders"),
        orderBy("createdAt", "desc")
      );

      const shippingQ = query(
        collection(db, "shipping"),
        orderBy("movedAt", "desc")
      );

      const deliveredQ = query(
        collection(db, "delivered"),
        orderBy("deliveredAt", "desc"),
        limit(100)
      );

      // 2. Run all requests in parallel (Performance boost)
      const [ordersSnap, shippingSnap, deliveredSnap] = await Promise.all([
        getDocs(ordersQ),
        getDocs(shippingQ),
        getDocs(deliveredQ),
      ]);

      // 3. Map the data
      const allOrders = ordersSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ProductOrder[];

      const allShippingDocs = shippingSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ProductOrder[];

      const allDelivered = deliveredSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ProductOrder[];

      // 4. Update states
      setOrders(allOrders);

      // Filter shipping collection by status
      setShippingItems(
        allShippingDocs.filter((item) => item.status === "shipping")
      );
      setCompletedItems(
        allShippingDocs.filter(
          (item) => item.status === "shipped" && !item.productBts?.trim()
        )
      );
      setBtsItems(
        allShippingDocs.filter(
          (item) => item.productBts && item.productBts.trim() !== ""
        )
      );

      // Set delivered items from its dedicated collection
      setDeliveredItems(allDelivered);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Ma'lumot yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.imageFile) return toast.error("Iltimos, rasm yuklang");
    setIsUploading(true);

    try {
      // 1. Create a reference to a new document to get its ID immediately
      const newOrderRef = doc(collection(db, "orders"));
      const orderId = newOrderRef.id; // This is your unique ID

      // 2. Upload Image
      const storageRef = ref(
        storage,
        `manual_orders/${Date.now()}_${manualForm.imageFile.name}`
      );
      const snapshot = await uploadBytes(storageRef, manualForm.imageFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // 3. Save to Firestore using setDoc with the pre-generated ID
      // We use setDoc instead of addDoc because we already created the reference 'newOrderRef'
      await setDoc(newOrderRef, {
        id: orderId, // Storing the ID inside the document as requested
        customer: {
          name: manualForm.customerName,
          phone: manualForm.phone,
          social: manualForm.telegram,
          address: manualForm.address,
          city: manualForm.city,
          size: manualForm.size,
        },
        productName: manualForm.productName,
        productBrand: manualForm.brand,
        productPrice: manualForm.price,
        productQuantity: manualForm.quantity,
        productThumbnail: downloadURL,
        productBts: "",
        status: "pending",
        manual: true,
        createdAt: serverTimestamp(),
        localDate: new Date().toLocaleString("uz-UZ"),
      });

      toast.success("Yangi buyurtma qo'shildi!");
      setIsManualModalOpen(false);
      setManualForm({
        customerName: "",
        phone: "",
        telegram: "",
        address: "",
        city: "",
        brand: "",
        size: "",
        productName: "",
        price: 0,
        quantity: 1,
        imageFile: null,
      });
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Saqlashda xatolik");
    } finally {
      setIsUploading(false);
    }
  };
  const handleMoveToShipping = async () => {
    if (!selectedOrder) return;
    try {
      const { id, ...cleanData } = selectedOrder;
      // Moving using the exact document ID
      await addDoc(collection(db, "shipping"), {
        ...cleanData,
        productPrice: editForm.price,
        productQuantity: editForm.quantity,
        deposit: editForm.deposit,
        description: editForm.description,
        totalRemaining: editForm.price * editForm.quantity - editForm.deposit,
        movedAt: serverTimestamp(),
        status: "shipping",
      });
      await deleteDoc(doc(db, "orders", id));
      toast.success("O'tkazildi!");
      setSelectedOrder(null);
      fetchData();
    } catch (error) {
      toast.error("Xatolik!");
    }
  };

  // const handleBatchMarkAsShipped = async () => {
  //   if (shippingItems.length === 0) return;
  //   if (!window.confirm("Barchasini 'Yetkazildi' holatiga o'tkazish?")) return;
  //   try {
  //     const batch = writeBatch(db);
  //     shippingItems.forEach((item) => {
  //       // Updating using the specific ID fetched from Firestore
  //       const shippingRef = doc(db, "shipping", item.id);
  //       batch.set(
  //         shippingRef,
  //         { status: "shipped", completedAt: serverTimestamp() },
  //         { merge: true }
  //       );
  //     });
  //     await batch.commit();
  //     toast.success("Yangilandi!");
  //     fetchData();
  //   } catch (error) {
  //     toast.error("Xatolik!");
  //   }
  // };
  const handleMarkAsShipped = async (id: string) => {
    if (
      !window.confirm(
        "Ushbu buyurtmani 'Yetkazilmoqda' holatiga o'tkazishni tasdiqlaysizmi?"
      )
    )
      return;
    try {
      const shippingRef = doc(db, "shipping", id);
      await updateDoc(shippingRef, {
        status: "shipped",
        completedAt: serverTimestamp(),
      });

      toast.success("Holat yangilandi!");
      fetchData(); // Refresh the list
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Xatolik yuz berdi!");
    }
  };
  const handleMarkAsDelivered = async (order: ProductOrder) => {
    if (
      !window.confirm(
        "Ushbu buyurtmani 'Topshirildi' holatiga o'tkazishni tasdiqlaysizmi?"
      )
    )
      return;

    try {
      // 1. Storage Cleanup for manual orders
      if (order.manual === true && order.productThumbnail) {
        try {
          const imageRef = ref(storage, order.productThumbnail);
          await deleteObject(imageRef);
        } catch (e) {
          console.error("Storage cleanup skipped:", e);
        }
      }

      // 2. Prepare Data for the 'delivered' collection
      const deliveredData = {
        ...order,
        status: "delivered",
        deliveredAt: serverTimestamp(),
        // We remove the thumbnail reference from the DB record since the file is gone
        productThumbnail: order.manual ? "" : order.productThumbnail,
      };

      // 3. Atomic Operation: Add to delivered, Delete from shipping
      const batch = writeBatch(db);
      const newRef = doc(db, "delivered", order.id);
      const oldRef = doc(db, "shipping", order.id);

      batch.set(newRef, deliveredData);
      batch.delete(oldRef);

      await batch.commit();

      toast.success("Muvaffaqiyatli topshirildi!");
      fetchData();
    } catch (error) {
      console.error("Transfer error:", error);
      toast.error("Xatolik yuz berdi");
    }
  };

  const exportAndWipeDelivered = async () => {
    if (
      !window.confirm(
        "Barcha topshirilgan ma'lumotlarni Excelga yuklab olish va bazadan o'chirishni tasdiqlaysizmi?"
      )
    )
      return;

    setLoading(true);
    try {
      const deliveredRef = collection(db, "delivered");
      const snapshot = await getDocs(deliveredRef);

      if (snapshot.empty) {
        toast.error("O'chirish uchun ma'lumot mavjud emas");
        setLoading(false);
        return;
      }

      // 1. Map the main data
      const dataForExcel = snapshot.docs.map((doc) => {
        const item = doc.data();
        const total = item.productPrice * item.productQuantity;

        return {
          ID: doc.id,
          Sana:
            item.deliveredAt?.toDate().toLocaleDateString() || item.localDate,
          Mijoz: item.customer.name,
          Telefon: item.customer.phone,
          Shahar: item.customer.city,
          Mahsulot: item.productName,
          Izoh: item.description,
          Brend: item.productBrand,
          Soni: item.productQuantity,
          BTS: item.productBts,
          Razmer: item.customer.size,
          Narxi: item.productPrice,
          "Zaklad ($)": item.deposit || 0,
          "Qolgan ($)": item.totalRemaining || 0,
          "Jami ($)": total,
          Status: "Topshirildi",
        };
      });

      // 2. Calculate Totals
      const totalZaklad = dataForExcel.reduce(
        (acc, curr) => acc + curr["Zaklad ($)"],
        0
      );
      const totalQolgan = dataForExcel.reduce(
        (acc, curr) => acc + curr["Qolgan ($)"],
        0
      );
      const totalJami = dataForExcel.reduce(
        (acc, curr) => acc + curr["Jami ($)"],
        0
      );

      // 3. Push a Summary Row to the array
      dataForExcel.push({
        ID: "JAMI:",
        Sana: "",
        Mijoz: "",
        Telefon: "",
        Shahar: "",
        Mahsulot: "",
        Izoh: "",
        Brend: "",
        Soni: "",
        BTS: "",
        Razmer: "",
        Narxi: "",
        "Zaklad ($)": totalZaklad,
        "Qolgan ($)": totalQolgan,
        "Jami ($)": totalJami,
        Status: "",
      });

      // 4. Create Excel Workbook
      const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Delivered_Orders");

      // 5. Download file
      const fileName = `Delivered_Orders_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      // 6. Wipe collection
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      toast.success("Ma'lumotlar yuklab olindi va baza tozalandi!");
      fetchData();
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      console.log("Logged in as:", user.email);
    }
  }, [user]);
  if (authLoading || loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-white p-4 md:p-10 font-sans text-black">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-8 flex justify-between items-center border-b pb-6">
          <div className="flex gap-8">
            {isAdmin && (
              <>
                <button
                  onClick={() => setView("orders")}
                  className={`text-xs font-black uppercase tracking-widest pb-2 transition-all ${
                    view === "orders"
                      ? "border-b-2 border-black"
                      : "text-gray-400"
                  }`}
                >
                  Yangi ({orders.length})
                </button>

                <button
                  onClick={() => setView("shipping")}
                  className={`text-xs font-black uppercase tracking-widest pb-2 transition-all ${
                    view === "shipping"
                      ? "border-b-2 border-black"
                      : "text-gray-400"
                  }`}
                >
                  Process ({shippingItems.length})
                </button>
              </>
            )}
            <button
              onClick={() => setView("completed")}
              className={`text-xs font-black uppercase tracking-widest pb-2 transition-all ${
                view === "completed"
                  ? "border-b-2 border-black"
                  : "text-gray-400"
              }`}
            >
              Yetkazilmoqda ({completedItems.length})
            </button>
            <button
              onClick={() => setView("bts")}
              className={`text-xs font-black uppercase tracking-widest pb-2 transition-all ${
                view === "bts" ? "border-b-2 border-black" : "text-gray-400"
              }`}
            >
              BTS ({btsItems.length})
            </button>
            <button
              onClick={() => setView("delivered")}
              className={`text-xs font-black uppercase tracking-widest pb-2 transition-all ${
                view === "delivered"
                  ? "border-b-2 border-black"
                  : "text-gray-400"
              }`}
            >
              Topshirildi ({deliveredItems.length})
            </button>
          </div>
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="bg-black text-white px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all flex items-center gap-2"
          >
            Yangi Buyurtma <span className="text-sm">+</span>
          </button>
        </header>

        <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 text-[10px] font-black uppercase text-gray-400 border mb-2">
          <div className="col-span-2">Mijoz / Telefon</div>
          <div className="col-span-1">Manzil / Sana</div>
          <div className="col-span-2">Mahsulot</div>
          <div className="col-span-1 text-center">O'lcham</div>
          <div className="col-span-1 text-center">ID / Soni</div>
          <div className="col-span-2 text-right">
            {view === "orders" ? "Narxi" : "Zaklad / Qolgan"}
          </div>
          <div className="col-span-1 text-center">BTS</div>
          <div className="col-span-2 text-right">Amal</div>
        </div>

        <div className="mt-6">
          {view === "delivered" ? (
            /* COMPACT TABLE VIEW: Optimized for large data lists */
            <div className="overflow-x-auto border border-gray-100 bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-2 text-[10px] font-black uppercase tracking-tighter text-gray-400">
                      Sana
                    </th>
                    <th className="p-2 text-[10px] font-black uppercase tracking-tighter text-gray-400">
                      Mijoz
                    </th>
                    <th className="p-2 text-[10px] font-black uppercase tracking-tighter text-gray-400">
                      Mahsulot
                    </th>
                    <th className="p-2 text-[10px] font-black uppercase tracking-tighter text-gray-400">
                      O'lcham
                    </th>
                    <th className="p-2 text-[10px] font-black uppercase tracking-tighter text-gray-400">
                      BTS
                    </th>
                    <th className="p-2 text-[10px] font-black uppercase tracking-tighter text-gray-400 text-right">
                      Zaklad
                    </th>
                    <th className="p-2 text-[10px] font-black uppercase tracking-tighter text-gray-400 text-right">
                      Qolgan
                    </th>
                    <th className="p-2 text-[10px] font-black uppercase tracking-tighter text-gray-400 text-right">
                      Jami
                    </th>
                    <th className="p-2 text-[10px] font-black uppercase tracking-tighter text-gray-400 text-right">
                      Holat
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deliveredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="p-2 text-[10px] text-gray-500 whitespace-nowrap">
                        {item.deliveredAt?.toDate().toLocaleDateString() ||
                          item.localDate}
                      </td>
                      <td className="p-2">
                        <p className="text-[10px] font-bold uppercase leading-none">
                          {item.customer.name}
                        </p>
                        <p className="text-[9px] text-gray-400 font-mono">
                          {item.customer.phone}
                        </p>
                      </td>
                      <td className="p-2">
                        <p className="text-[10px] text-gray-700 italic truncate max-w-[150px]">
                          {item.productName}
                        </p>
                        <i className="text-[11px] truncate text-blue-600">
                          {item.description}
                        </i>
                      </td>
                      <td className="p-2">
                        <p className="text-[10px] text-gray-700 italic truncate max-w-[150px]">
                          {item.customer.size}
                        </p>
                      </td>
                      <td className="p-2">
                        <span className="text-[9px] font-mono text-gray-400">
                          {/* #{item.id.slice(-5)} */}#{item.productBts}
                        </span>
                      </td>
                      {/* Zaklad */}
                      <td className="p-2 text-[10px] font-bold text-green-600 text-right">
                        ${(item.deposit || 0).toLocaleString()}
                      </td>
                      {/* Qolgan */}
                      <td className="p-2 text-[10px] font-bold text-gray-900 text-right">
                        ${(item.totalRemaining || 0).toLocaleString()}
                      </td>
                      {/* Jami */}
                      <td className="p-2 text-[10px] font-black text-right">
                        $
                        {(
                          item.productPrice * item.productQuantity
                        ).toLocaleString()}
                      </td>
                      <td className="p-2 text-right">
                        <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-100 italic">
                          Topshirildi
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td
                      colSpan={5}
                      className="p-2 text-[10px] font-black uppercase text-right text-gray-400"
                    >
                      Jami:
                    </td>
                    {/* Total Zaklad */}
                    <td className="p-2 text-[10px] font-black text-right text-green-600">
                      $
                      {deliveredItems
                        .reduce((acc, item) => acc + (item.deposit || 0), 0)
                        .toLocaleString()}
                    </td>
                    {/* Total Qolgan */}
                    <td className="p-2 text-[10px] font-black text-right text-gray-900">
                      $
                      {deliveredItems
                        .reduce(
                          (acc, item) => acc + (item.totalRemaining || 0),
                          0
                        )
                        .toLocaleString()}
                    </td>
                    {/* Total Jami */}
                    <td className="p-2 text-[12px] font-black text-right text-black">
                      $
                      {deliveredItems
                        .reduce(
                          (acc, item) =>
                            acc + item.productPrice * item.productQuantity,
                          0
                        )
                        .toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            /* ORIGINAL CARD VIEW: For Orders, Shipping, and Completed */
            <div className="space-y-2">
              {view === "orders" && !isAdmin ? (
                <h1 className="text-center py-10 font-black text-red-500">
                  BO'LIMNI TANLANG!
                </h1>
              ) : (
                displayData.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-white border p-4 lg:p-3 hover:border-black transition-all"
                  >
                    {/* 1. Customer Info (col-span-2) */}
                    <div className="col-span-2">
                      <p className="text-sm font-bold truncate">
                        {item.customer.name}
                      </p>
                      <p className="text-[11px] text-gray-500 font-mono italic">
                        {item.customer.phone}
                      </p>
                    </div>

                    {/* 2. Location & Date (col-span-1) */}
                    <div className="col-span-1">
                      <p className="text-[10px] font-black text-gray-900 uppercase truncate">
                        {item.customer.city}
                      </p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">
                        {item.localDate?.split(",")[0] || "No Date"}
                      </p>
                    </div>

                    {/* 3. Product Details (col-span-2) */}
                    <div className="col-span-2 flex items-center gap-2">
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          // Wrap it inside an array literal to satisfy string[] requirement
                          if (item.productThumbnail) {
                            setZoomedImages([item.productThumbnail]);
                          }
                        }}
                        className="relative w-8 h-8 bg-gray-50 border flex-shrink-0 overflow-hidden flex items-center justify-center"
                      >
                        {item.productThumbnail ? (
                          <Image
                            src={item.productThumbnail}
                            alt=""
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-[7px] text-gray-400">
                            No Img
                          </span>
                        )}
                      </div>
                      <div className="truncate">
                        <p className="text-[8px] font-black text-red-600 uppercase leading-none">
                          {item.productBrand}
                        </p>
                        <p className="text-[11px] font-bold truncate">
                          {item.productName}
                        </p>
                        <i className="text-[11px] truncate text-blue-600">
                          {item.description}
                        </i>
                      </div>
                    </div>

                    {/* 4. SIZE (col-span-1) - NEW */}
                    <div className="col-span-1 text-center">
                      <span className="text-xs font-black px-2 py-1 bg-gray-100 rounded">
                        {item.customer.size || "-"}
                      </span>
                    </div>

                    {/* 5. ID & Quantity (col-span-1) */}
                    <div className="col-span-1 text-center">
                      <p className="text-[8px] text-gray-400 font-mono">
                        #{item.id.slice(0, 4)}
                      </p>
                      <p className="font-bold text-xs">
                        x{item.productQuantity}
                      </p>
                    </div>

                    {/* 6. Pricing (col-span-2) */}
                    <div className="col-span-2 text-right">
                      {view === "orders" ? (
                        <span className="font-black text-sm">
                          ${item.productPrice}
                        </span>
                      ) : (
                        <div className="flex flex-col text-[10px] font-bold">
                          <span className="text-green-600">
                            ${item.deposit || 0} (Z)
                          </span>
                          <span className="text-black">
                            ${item.totalRemaining || 0} (Q)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 7. BTS STATUS (col-span-1) */}
                    <div className="col-span-1 flex flex-col items-center justify-center gap-1 border-l border-gray-50">
                      {/* Display current BTS or placeholder */}
                      <span
                        className={`text-[12px] font-mono font-black px-2 py-1 rounded border shadow-sm ${
                          item.productBts
                            ? "bg-blue-50 text-blue-800 border-blue-200"
                            : "bg-gray-50 text-gray-400 border-gray-100 italic font-normal"
                        }`}
                      >
                        {item.productBts || "no-bts"}
                      </span>

                      {/* Professional Edit Button */}
                      <button
                        onClick={async () => {
                          const newBts = window.prompt(
                            "BTS kodini kiriting:",
                            item.productBts || ""
                          );
                          if (newBts === null) return;
                          try {
                            const docRef = doc(db, "shipping", item.id);
                            await updateDoc(docRef, {
                              productBts: newBts,
                            });
                            toast.success("BTS yangilandi!");
                            fetchData();
                          } catch (err: any) {
                            // This will print the actual text of the error (e.g., "Permissions Denied")
                            console.error(
                              "Firebase Error Details:",
                              err.code,
                              err.message
                            );
                            toast.error(
                              `Xatolik: ${
                                err.message || "Baza bilan aloqa yo'q"
                              }`
                            );
                          }
                        }}
                        className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
                      >
                        +BTS
                      </button>
                    </div>

                    {/* 8. Action Buttons (col-span-2) */}
                    <div className="col-span-2 text-right">
                      {view === "orders" && (
                        <button
                          onClick={() => {
                            setSelectedOrder(item);
                            setEditForm({
                              price: item.productPrice,
                              quantity: item.productQuantity,
                              deposit: 0,
                              description: "",
                            });
                          }}
                          className="bg-black text-white text-[9px] font-black uppercase px-3 py-2 hover:bg-zinc-800"
                        >
                          Manage
                        </button>
                      )}

                      {view === "shipping" && (
                        <button
                          onClick={() => handleMarkAsShipped(item.id)}
                          className="bg-blue-600 text-white text-[9px] font-black uppercase px-3 py-2 hover:bg-blue-700 transition-colors"
                        >
                          Jo'natish
                        </button>
                      )}

                      {(view === "completed" || view === "bts") && (
                        <button
                          onClick={() => handleMarkAsDelivered(item)}
                          className="bg-orange-500 text-white text-[8px] font-black uppercase px-2 py-1.5 hover:bg-orange-600"
                        >
                          Topshirish
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* {view === "shipping" && isAdmin && shippingItems.length > 0 && (
          <div className="mt-12 flex justify-center border-t pt-10">
            <button
              onClick={handleBatchMarkAsShipped}
              className="bg-black text-white px-10 py-4 font-black uppercase tracking-[0.2em] text-xs shadow-xl"
            >
              Hammasini 'Yetkazildi' deb belgilash
            </button>
          </div>
        )} */}

        {/* excel button */}
        {view === "delivered" && isAdmin && deliveredItems.length > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={exportAndWipeDelivered}
              disabled={loading}
              className="flex items-center gap-2 bg-green-600 text-white text-[10px] font-black uppercase px-6 py-3 hover:bg-green-700 transition-all shadow-sm disabled:bg-gray-400"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Excel yuklash va Tozalash
            </button>
          </div>
        )}
        {/* MANUAL ORDER DRAWER */}
        {isManualModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-end">
            <div className="bg-gray-50 p-5 space-y-6 border-t-2 border-black">
              <div className="bg-white w-full max-w-lg h-full p-8 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="font-black uppercase text-2xl italic tracking-tighter">
                    Manual Order
                  </h2>
                  <button
                    onClick={() => setIsManualModalOpen(false)}
                    className="text-[10px] font-black underline"
                  >
                    YOPISH
                  </button>
                </div>
                <form onSubmit={handleManualSubmit} className="space-y-6">
                  <div className="border-2 border-dashed p-8 text-center relative hover:bg-gray-50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      id="manual-image"
                      name="manual-image"
                      onChange={(e) =>
                        setManualForm({
                          ...manualForm,
                          imageFile: e.target.files?.[0] || null,
                        })
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <p className="text-[10px] font-black uppercase text-gray-400">
                      {manualForm.imageFile
                        ? `✓ ${manualForm.imageFile.name}`
                        : "Rasm yuklash +"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-[9px] font-black uppercase text-gray-400">
                        Mijoz Ismi
                      </span>
                      <input
                        required
                        id="m-name"
                        name="m-name"
                        type="text"
                        value={manualForm.customerName}
                        onChange={(e) =>
                          setManualForm({
                            ...manualForm,
                            customerName: e.target.value,
                          })
                        }
                        className="w-full border-b py-2 outline-none text-sm font-bold"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[9px] font-black uppercase text-gray-400">
                        Telefon
                      </span>
                      <input
                        required
                        id="m-phone"
                        name="m-phone"
                        type="text"
                        value={manualForm.phone}
                        onChange={(e) =>
                          setManualForm({
                            ...manualForm,
                            phone: e.target.value,
                          })
                        }
                        className="w-full border-b py-2 outline-none text-sm font-bold"
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-[9px] font-black uppercase text-gray-400">
                        Telegram
                      </span>
                      <input
                        id="m-tg"
                        name="m-tg"
                        type="text"
                        value={manualForm.telegram}
                        onChange={(e) =>
                          setManualForm({
                            ...manualForm,
                            telegram: e.target.value,
                          })
                        }
                        className="w-full border-b py-2 outline-none text-sm font-bold"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[9px] font-black uppercase text-gray-400">
                        Shahar
                      </span>
                      <input
                        required
                        id="m-city"
                        name="m-city"
                        type="text"
                        value={manualForm.city}
                        onChange={(e) =>
                          setManualForm({ ...manualForm, city: e.target.value })
                        }
                        className="w-full border-b py-2 outline-none text-sm font-bold"
                      />
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-[9px] font-black uppercase text-gray-400">
                      Manzil
                    </span>
                    <input
                      required
                      id="m-address"
                      name="m-address"
                      type="text"
                      value={manualForm.address}
                      onChange={(e) =>
                        setManualForm({
                          ...manualForm,
                          address: e.target.value,
                        })
                      }
                      className="w-full border-b py-2 outline-none text-sm font-bold"
                    />
                  </label>
                  <div className="bg-gray-50 p-5 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-[9px] font-black uppercase text-gray-400">
                          Brand
                        </span>
                        <input
                          required
                          id="m-brand"
                          name="m-brand"
                          type="text"
                          value={manualForm.brand}
                          onChange={(e) =>
                            setManualForm({
                              ...manualForm,
                              brand: e.target.value,
                            })
                          }
                          className="w-full border-b py-2 outline-none text-sm font-bold"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[9px] font-black uppercase text-gray-400">
                          Mahsulot
                        </span>
                        <input
                          required
                          id="m-prod"
                          name="m-prod"
                          type="text"
                          value={manualForm.productName}
                          onChange={(e) =>
                            setManualForm({
                              ...manualForm,
                              productName: e.target.value,
                            })
                          }
                          className="w-full border-b py-2 outline-none text-sm font-bold"
                        />
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-[9px] font-black uppercase text-gray-400">
                          Narxi ($)
                        </span>
                        <input
                          required
                          id="m-price"
                          name="m-price"
                          type="number"
                          value={manualForm.price === 0 ? "" : manualForm.price}
                          onChange={(e) =>
                            setManualForm({
                              ...manualForm,
                              price: Number(e.target.value) || 0,
                            })
                          }
                          className="w-full border-b py-2 outline-none text-sm font-bold"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[9px] font-black uppercase text-gray-400">
                          O'lcham
                        </span>
                        <input
                          required
                          id="m-size"
                          name="m-size"
                          type="text"
                          value={manualForm.size}
                          onChange={(e) =>
                            setManualForm({
                              ...manualForm,
                              size: e.target.value,
                            })
                          }
                          className="w-full border-b py-2 outline-none text-sm font-bold"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[9px] font-black uppercase text-gray-400">
                          Soni
                        </span>
                        <input
                          required
                          id="m-qty"
                          name="m-qty"
                          type="number"
                          value={
                            manualForm.quantity === 0 ? "" : manualForm.quantity
                          }
                          onChange={(e) =>
                            setManualForm({
                              ...manualForm,
                              quantity: Number(e.target.value) || 0,
                            })
                          }
                          className="w-full border-b py-2 outline-none text-sm font-bold"
                        />
                      </label>
                    </div>
                  </div>
                  <button
                    disabled={isUploading}
                    type="submit"
                    className="w-full bg-black text-white py-4 font-black uppercase tracking-widest hover:bg-zinc-800 disabled:bg-gray-400 tracking-[0.2em]"
                  >
                    {isUploading ? "YUKLANMOQDA..." : "SAQLASH"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* PENDING TO SHIPPING MODAL */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-end">
            <div className="bg-white w-full max-w-md h-full p-8 shadow-2xl overflow-y-auto">
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-[10px] font-black underline mb-8"
              >
                YOPISH
              </button>
              <div className="bg-gray-50 p-4 border mb-8 flex gap-4">
                <div
                  className="relative w-16 h-16 border bg-white"
                  onClick={() =>
                    setZoomedImages([selectedOrder.productThumbnail])
                  }
                >
                  <Image
                    src={selectedOrder.productThumbnail}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="text-[8px] font-black bg-black text-white px-1 rounded">
                    #{selectedOrder.id.slice(0, 4)}
                  </span>
                  <h3 className="text-sm font-bold">
                    {selectedOrder.productName}
                  </h3>
                  <p className="text-[10px] text-gray-500 uppercase">
                    {selectedOrder.customer.name}
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <label className="block">
                  <span className="text-[10px] font-black uppercase text-gray-400">
                    Soni
                  </span>
                  <input
                    id="edit-qty"
                    name="edit-qty"
                    type="number"
                    value={editForm.quantity === 0 ? "" : editForm.quantity}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        quantity: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full border-b-2 py-2 outline-none font-bold text-xl"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-black uppercase text-gray-400">
                    Sotuv Narxi
                  </span>
                  <input
                    id="edit-price"
                    name="edit-price"
                    type="number"
                    value={editForm.price === 0 ? "" : editForm.price}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        price: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full border-b-2 py-2 outline-none font-bold text-xl text-red-600"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-black uppercase text-gray-400">
                    Zaklad
                  </span>
                  <input
                    id="edit-dep"
                    name="edit-dep"
                    type="number"
                    value={editForm.deposit === 0 ? "" : editForm.deposit}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        deposit: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full border-b-2 py-2 outline-none font-bold text-xl text-green-600"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-black uppercase text-gray-400">
                    Izoh
                  </span>
                  <textarea
                    id="edit-desc"
                    name="edit-desc"
                    rows={3}
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    className="w-full border-2 p-3 text-sm focus:border-black outline-none"
                    placeholder="..."
                  />
                </label>
                <div className="bg-black p-6 text-white text-center">
                  <p className="text-[10px] uppercase text-gray-400">
                    Qolgan summa:
                  </p>
                  <p className="text-4xl font-black italic mb-6">
                    ${editForm.price * editForm.quantity - editForm.deposit}
                  </p>
                  <button
                    onClick={handleMoveToShipping}
                    className="w-full bg-white text-black py-4 font-black uppercase tracking-widest hover:bg-gray-200"
                  >
                    Shippingga O'tkazish
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
