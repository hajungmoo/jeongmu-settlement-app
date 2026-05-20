
import React, { useEffect, useMemo, useState } from "react";
import { Trash2, Search, Download, Upload, Save, Package, Calculator, WalletCards } from "lucide-react";

const defaultProducts = [
  { id: 1, name: "테너지05", buyPrice: 63000, sellPrice: 0 },
  { id: 2, name: "MXP", buyPrice: 40000, sellPrice: 0 },
  { id: 3, name: "MX-K", buyPrice: 41000, sellPrice: 0 },
  { id: 4, name: "로제나", buyPrice: 28000, sellPrice: 0 },
  { id: 5, name: "디그닉스05", buyPrice: 73000, sellPrice: 0 },
  { id: 6, name: "레드몽키 스핀", buyPrice: 48000, sellPrice: 0 },
  { id: 7, name: "레드몽키 맥스", buyPrice: 48000, sellPrice: 0 },
  { id: 8, name: "블루폭스 맥스", buyPrice: 46000, sellPrice: 0 },
  { id: 9, name: "그립테이프", buyPrice: 2800, sellPrice: 0 },
  { id: 10, name: "이너포스", buyPrice: 120000, sellPrice: 0 },
  { id: 11, name: "미즈타니준", buyPrice: 210000, sellPrice: 0 },
  { id: 12, name: "지킬 C55", buyPrice: 64000, sellPrice: 0 },
  { id: 13, name: "싸이프레스 V-MAX", buyPrice: 183000, sellPrice: 0 },
  { id: 14, name: "오메가3 프로", buyPrice: 42000, sellPrice: 0 },
  { id: 15, name: "옵차르프 ST", buyPrice: 143000, sellPrice: 0 },
  { id: 16, name: "장애인 라켓세트", buyPrice: 150000, sellPrice: 0 },
  { id: 17, name: "엑시옴 수건", buyPrice: 6500, sellPrice: 0 },
  { id: 18, name: "타그로 제품", buyPrice: 40000, sellPrice: 0 },
  { id: 19, name: "어쿠스틱카본 5.8", buyPrice: 260000, sellPrice: 0 },
  { id: 20, name: "레드몽키 러버", buyPrice: 46000, sellPrice: 0 },
  { id: 21, name: "러버", buyPrice: 45000, sellPrice: 0 },
  { id: 22, name: "35% 할인 제품", buyPrice: 67600, sellPrice: 0 },
  { id: 23, name: "고급 라켓", buyPrice: 350000, sellPrice: 0 },
];

const today = () => new Date().toISOString().slice(0, 10);
const storageKey = "jeongmu-settlement-v1";

function won(value) {
  return Number(value || 0).toLocaleString("ko-KR") + "원";
}

function koreanDate(value) {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return "날짜 없음";
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function App() {
  const [products, setProducts] = useState(defaultProducts);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [newProduct, setNewProduct] = useState({ name: "", buyPrice: "", sellPrice: "" });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (Array.isArray(data.products)) setProducts(data.products);
        if (Array.isArray(data.orders)) setOrders(data.orders);
      }
    } catch (error) {
      console.error("저장 데이터 불러오기 실패", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ products, orders }));
  }, [products, orders]);

  const productMap = useMemo(() => Object.fromEntries(products.map((p) => [p.name, p])), [products]);

  const calculatedOrders = useMemo(() => orders.map((order) => {
    const product = productMap[order.productName] || {};
    const qty = Number(order.qty || 0);
    const buyPrice = Number(product.buyPrice || 0);
    const sellPrice = Number(product.sellPrice || 0);
    return { ...order, buyPrice, sellPrice, totalBuy: buyPrice * qty, totalSell: sellPrice * qty, profit: (sellPrice - buyPrice) * qty };
  }), [orders, productMap]);

  const dates = useMemo(() => Array.from(new Set(calculatedOrders.map((o) => o.date))).sort().reverse(), [calculatedOrders]);
  const visibleOrders = dateFilter === "all" ? calculatedOrders : calculatedOrders.filter((o) => o.date === dateFilter);

  const totals = useMemo(() => visibleOrders.reduce((acc, o) => ({
    totalBuy: acc.totalBuy + o.totalBuy,
    totalSell: acc.totalSell + o.totalSell,
    profit: acc.profit + o.profit,
  }), { totalBuy: 0, totalSell: 0, profit: 0 }), [visibleOrders]);

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  function addOrder() {
    setOrders((prev) => [{ id: Date.now(), date: today(), buyer: "", productName: products[0]?.name || "", qty: 1 }, ...prev]);
  }

  function updateOrder(id, key, value) {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, [key]: value } : o));
  }

  function deleteOrder(id) {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  function addProduct() {
    if (!newProduct.name.trim()) return;
    setProducts((prev) => [...prev, { id: Date.now(), name: newProduct.name.trim(), buyPrice: Number(newProduct.buyPrice || 0), sellPrice: Number(newProduct.sellPrice || 0) }]);
    setNewProduct({ name: "", buyPrice: "", sellPrice: "" });
  }

  function updateProduct(id, key, value) {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, [key]: key === "name" ? value : Number(value || 0) } : p));
  }

  function deleteProduct(id) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  function downloadBackup() {
    const blob = new Blob([JSON.stringify({ products, orders }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `정무_정산앱_백업_${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function uploadBackup(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (Array.isArray(data.products)) setProducts(data.products);
        if (Array.isArray(data.orders)) setOrders(data.orders);
      } catch {
        alert("백업 파일을 불러오지 못했습니다.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-sky-100 p-3 text-slate-900 sm:p-5">
      <div className="mx-auto max-w-6xl space-y-4">
        <section className="rounded-[2rem] bg-white/90 p-5 shadow-xl backdrop-blur">
          <p className="text-sm font-bold text-violet-500">{koreanDate(today())}</p>
          <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-violet-700">정무의 정산앱</h1>
              <p className="mt-1 text-sm text-slate-500">폰에서 편하게 쓰는 탁구용품 정산 관리</p>
            </div>
            <button onClick={addOrder} className="rounded-2xl bg-violet-600 px-5 py-3 font-black text-white shadow-lg shadow-violet-200">+ 정산 추가</button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryCard icon={<Package size={22} />} title="총 받는가격" value={won(totals.totalBuy)} color="from-blue-500 to-sky-500" />
          <SummaryCard icon={<WalletCards size={22} />} title="총 파는가격" value={won(totals.totalSell)} color="from-pink-500 to-rose-500" />
          <SummaryCard icon={<Calculator size={22} />} title="총 정산금" value={won(totals.profit)} color="from-emerald-500 to-teal-500" />
        </section>

        <section className="rounded-[2rem] bg-white p-4 shadow-xl">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-black">정산 내역</h2>
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm">
              <option value="all">전체 날짜</option>
              {dates.map((date) => <option key={date} value={date}>{koreanDate(date)}</option>)}
            </select>
          </div>

          <div className="space-y-3">
            {visibleOrders.length === 0 && <div className="rounded-3xl bg-slate-50 p-6 text-center text-sm text-slate-500">아직 정산 내역이 없습니다.</div>}
            {visibleOrders.map((order) => (
              <div key={order.id} className="rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm">
                <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <input type="date" value={order.date} onChange={(e) => updateOrder(order.id, "date", e.target.value)} className="rounded-2xl border border-slate-200 px-3 py-3" />
                  <input value={order.buyer} onChange={(e) => updateOrder(order.id, "buyer", e.target.value)} placeholder="시킨사람" className="rounded-2xl border border-slate-200 px-3 py-3" />
                  <button onClick={() => deleteOrder(order.id)} className="rounded-2xl bg-rose-100 px-3 py-3 font-bold text-rose-600 sm:ml-auto">삭제</button>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1.4fr_0.6fr]">
                  <select value={order.productName} onChange={(e) => updateOrder(order.id, "productName", e.target.value)} className="rounded-2xl border border-slate-200 px-3 py-3">
                    {products.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                  <input type="number" value={order.qty} onChange={(e) => updateOrder(order.id, "qty", e.target.value)} className="rounded-2xl border border-slate-200 px-3 py-3 text-center" placeholder="수량" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
                  <Info label="받는가격" value={won(order.buyPrice)} color="bg-blue-50 text-blue-700" />
                  <Info label="파는가격" value={won(order.sellPrice)} color="bg-pink-50 text-pink-700" />
                  <Info label="총받는가격" value={won(order.totalBuy)} color="bg-slate-100 text-slate-700" />
                  <Info label="총파는가격" value={won(order.totalSell)} color="bg-violet-50 text-violet-700" />
                  <Info label="정산금" value={won(order.profit)} color="bg-emerald-50 text-emerald-700" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-black">용품 가격 저장</h2>
            <Save className="text-violet-600" />
          </div>
          <div className="mb-3 flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">
            <Search size={18} className="text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="용품 검색" className="w-full bg-transparent text-sm outline-none" />
          </div>
          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_0.7fr_0.7fr_auto]">
            <input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="새 용품명" className="rounded-2xl border border-slate-200 px-3 py-3" />
            <input value={newProduct.buyPrice} onChange={(e) => setNewProduct({ ...newProduct, buyPrice: e.target.value })} type="number" placeholder="받는가격" className="rounded-2xl border border-slate-200 px-3 py-3" />
            <input value={newProduct.sellPrice} onChange={(e) => setNewProduct({ ...newProduct, sellPrice: e.target.value })} type="number" placeholder="파는가격" className="rounded-2xl border border-slate-200 px-3 py-3" />
            <button onClick={addProduct} className="rounded-2xl bg-slate-900 px-4 py-3 font-bold text-white">추가</button>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <div key={product.id} className="rounded-3xl bg-gradient-to-br from-violet-50 to-pink-50 p-3">
                <div className="mb-2 flex gap-2">
                  <input value={product.name} onChange={(e) => updateProduct(product.id, "name", e.target.value)} className="w-full rounded-2xl bg-white px-3 py-2 font-bold outline-none" />
                  <button onClick={() => deleteProduct(product.id)} className="rounded-2xl bg-white px-3 text-rose-500"><Trash2 size={16} /></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs font-bold text-blue-600">받는가격<input type="number" value={product.buyPrice} onChange={(e) => updateProduct(product.id, "buyPrice", e.target.value)} className="mt-1 w-full rounded-2xl bg-white px-3 py-2 text-slate-900 outline-none" /></label>
                  <label className="text-xs font-bold text-pink-600">파는가격<input type="number" value={product.sellPrice} onChange={(e) => updateProduct(product.id, "sellPrice", e.target.value)} className="mt-1 w-full rounded-2xl bg-white px-3 py-2 text-slate-900 outline-none" /></label>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-4 shadow-xl">
          <h2 className="mb-3 text-xl font-black">백업 / 복원</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button onClick={downloadBackup} className="flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 font-bold text-white"><Download size={18} /> 백업 파일 다운로드</button>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 font-bold text-white"><Upload size={18} /> 백업 파일 불러오기<input type="file" accept="application/json" onChange={uploadBackup} className="hidden" /></label>
          </div>
          <p className="mt-2 text-xs text-slate-500">폰/컴퓨터를 같이 쓰려면 백업 파일을 옮겨서 불러오면 됩니다.</p>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({ icon, title, value, color }) {
  return <div className={`rounded-[2rem] bg-gradient-to-br ${color} p-5 text-white shadow-xl`}><div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">{icon}</div><p className="text-sm font-bold opacity-80">{title}</p><p className="mt-1 text-2xl font-black">{value}</p></div>;
}

function Info({ label, value, color }) {
  return <div className={`rounded-2xl p-3 ${color}`}><p className="text-xs font-bold opacity-70">{label}</p><p className="mt-1 font-black">{value}</p></div>;
}
