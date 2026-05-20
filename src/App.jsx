import React, { useEffect, useMemo, useState } from "react";
import {
  Calculator,
  Download,
  Home,
  Package,
  Plus,
  Save,
  Search,
  Settings,
  Trash2,
  Upload,
  WalletCards,
} from "lucide-react";

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

const storageKey = "jeongmu-settlement-v2";
const today = () => new Date().toISOString().slice(0, 10);

function won(value) {
  return Number(value || 0).toLocaleString("ko-KR") + "원";
}

function koreanDate(value) {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return "날짜 없음";
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function App() {
  const [tab, setTab] = useState("settlement");
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

  const calculatedOrders = useMemo(() => {
    return orders.map((order) => {
      const product = productMap[order.productName] || {};
      const qty = Number(order.qty || 0);
      const buyPrice = Number(product.buyPrice || 0);
      const sellPrice = Number(product.sellPrice || 0);
      const totalBuy = buyPrice * qty;
      const totalSell = sellPrice * qty;
      return { ...order, buyPrice, sellPrice, totalBuy, totalSell, profit: totalSell - totalBuy };
    });
  }, [orders, productMap]);

  const dates = useMemo(() => {
    return Array.from(new Set(calculatedOrders.map((order) => order.date))).sort().reverse();
  }, [calculatedOrders]);

  const visibleOrders = useMemo(() => {
    if (dateFilter === "all") return calculatedOrders;
    return calculatedOrders.filter((order) => order.date === dateFilter);
  }, [calculatedOrders, dateFilter]);

  const totals = useMemo(() => {
    return visibleOrders.reduce(
      (acc, order) => ({
        totalBuy: acc.totalBuy + order.totalBuy,
        totalSell: acc.totalSell + order.totalSell,
        profit: acc.profit + order.profit,
      }),
      { totalBuy: 0, totalSell: 0, profit: 0 }
    );
  }, [visibleOrders]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  function addOrder() {
    setOrders((prev) => [
      {
        id: Date.now(),
        date: today(),
        buyer: "",
        productName: products[0]?.name || "",
        qty: 1,
      },
      ...prev,
    ]);
    setTab("settlement");
  }

  function updateOrder(id, key, value) {
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, [key]: value } : order)));
  }

  function deleteOrder(id) {
    setOrders((prev) => prev.filter((order) => order.id !== id));
  }

  function addProduct() {
    if (!newProduct.name.trim()) return;
    setProducts((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: newProduct.name.trim(),
        buyPrice: Number(newProduct.buyPrice || 0),
        sellPrice: Number(newProduct.sellPrice || 0),
      },
    ]);
    setNewProduct({ name: "", buyPrice: "", sellPrice: "" });
  }

  function updateProduct(id, key, value) {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, [key]: key === "name" ? value : Number(value || 0) } : product
      )
    );
  }

  function deleteProduct(id) {
    setProducts((prev) => prev.filter((product) => product.id !== id));
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
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-5xl pb-24">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-violet-500">{koreanDate(today())}</p>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">정무의 정산앱</h1>
            </div>
            <button
              onClick={addOrder}
              className="rounded-2xl bg-violet-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-violet-200"
            >
              + 정산
            </button>
          </div>
        </header>

        <div className="space-y-4 p-4">
          {tab === "settlement" ? (
            <SettlementTab
              totals={totals}
              dates={dates}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              visibleOrders={visibleOrders}
              products={products}
              updateOrder={updateOrder}
              deleteOrder={deleteOrder}
            />
          ) : (
            <ProductTab
              products={products}
              filteredProducts={filteredProducts}
              search={search}
              setSearch={setSearch}
              newProduct={newProduct}
              setNewProduct={setNewProduct}
              addProduct={addProduct}
              updateProduct={updateProduct}
              deleteProduct={deleteProduct}
              downloadBackup={downloadBackup}
              uploadBackup={uploadBackup}
            />
          )}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-2 gap-2">
          <TabButton active={tab === "settlement"} onClick={() => setTab("settlement")} icon={<Home size={20} />} label="정산" />
          <TabButton active={tab === "products"} onClick={() => setTab("products")} icon={<Settings size={20} />} label="용품관리" />
        </div>
      </nav>
    </main>
  );
}

function SettlementTab({ totals, dates, dateFilter, setDateFilter, visibleOrders, products, updateOrder, deleteOrder }) {
  return (
    <>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard icon={<Package size={22} />} title="총 받는금액" value={won(totals.totalBuy)} />
        <SummaryCard icon={<WalletCards size={22} />} title="총 판매금액" value={won(totals.totalSell)} />
        <SummaryCard icon={<Calculator size={22} />} title="총 정산금" value={won(totals.profit)} highlight />
      </section>

      <section className="rounded-[1.7rem] bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-lg font-black">정산 내역</h2>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
          >
            <option value="all">전체 날짜</option>
            {dates.map((date) => (
              <option key={date} value={date}>{koreanDate(date)}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          {visibleOrders.length === 0 && (
            <div className="rounded-3xl bg-slate-50 p-8 text-center text-sm text-slate-500">
              아직 정산 내역이 없습니다. 위쪽 + 정산 버튼을 눌러 추가하세요.
            </div>
          )}

          {visibleOrders.map((order) => (
            <article key={order.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <input
                  type="date"
                  value={order.date}
                  onChange={(e) => updateOrder(order.id, "date", e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                />
                <button onClick={() => deleteOrder(order.id)} className="rounded-2xl bg-rose-100 px-3 py-2 text-sm font-bold text-rose-600">
                  삭제
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <input
                  value={order.buyer}
                  onChange={(e) => updateOrder(order.id, "buyer", e.target.value)}
                  placeholder="시킨사람"
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-3 outline-none"
                />
                <select
                  value={order.productName}
                  onChange={(e) => updateOrder(order.id, "productName", e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-3 outline-none sm:col-span-1"
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.name}>{product.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={order.qty}
                  onChange={(e) => updateOrder(order.id, "qty", e.target.value)}
                  placeholder="수량"
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center outline-none"
                />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
                <Info label="받는가격" value={won(order.buyPrice)} />
                <Info label="판매가격" value={won(order.sellPrice)} />
                <Info label="총받는가격" value={won(order.totalBuy)} />
                <Info label="총판매금액" value={won(order.totalSell)} />
                <Info label="정산금" value={won(order.profit)} green />
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function ProductTab({ products, filteredProducts, search, setSearch, newProduct, setNewProduct, addProduct, updateProduct, deleteProduct, downloadBackup, uploadBackup }) {
  return (
    <>
      <section className="rounded-[1.7rem] bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black">용품 가격 관리</h2>
            <p className="text-xs text-slate-500">총 {products.length}개 용품 저장됨</p>
          </div>
          <Save className="text-violet-600" />
        </div>

        <div className="mb-3 flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">
          <Search size={18} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="용품 검색"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_0.7fr_0.7fr_auto]">
          <input
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            placeholder="새 용품명"
            className="rounded-2xl border border-slate-200 px-3 py-3 outline-none"
          />
          <input
            value={newProduct.buyPrice}
            onChange={(e) => setNewProduct({ ...newProduct, buyPrice: e.target.value })}
            type="number"
            placeholder="받는가격"
            className="rounded-2xl border border-slate-200 px-3 py-3 outline-none"
          />
          <input
            value={newProduct.sellPrice}
            onChange={(e) => setNewProduct({ ...newProduct, sellPrice: e.target.value })}
            type="number"
            placeholder="판매가격"
            className="rounded-2xl border border-slate-200 px-3 py-3 outline-none"
          />
          <button onClick={addProduct} className="rounded-2xl bg-slate-900 px-4 py-3 font-bold text-white">
            추가
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <article key={product.id} className="rounded-3xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <input
                value={product.name}
                onChange={(e) => updateProduct(product.id, "name", e.target.value)}
                className="w-full rounded-2xl bg-slate-50 px-3 py-3 font-bold outline-none"
              />
              <button onClick={() => deleteProduct(product.id)} className="rounded-2xl bg-rose-100 p-3 text-rose-600">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs font-bold text-blue-600">
                받는가격
                <input
                  type="number"
                  value={product.buyPrice}
                  onChange={(e) => updateProduct(product.id, "buyPrice", e.target.value)}
                  className="mt-1 w-full rounded-2xl bg-blue-50 px-3 py-3 text-slate-900 outline-none"
                />
              </label>
              <label className="text-xs font-bold text-violet-600">
                판매가격
                <input
                  type="number"
                  value={product.sellPrice}
                  onChange={(e) => updateProduct(product.id, "sellPrice", e.target.value)}
                  className="mt-1 w-full rounded-2xl bg-violet-50 px-3 py-3 text-slate-900 outline-none"
                />
              </label>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-[1.7rem] bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-black">백업 / 복원</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button onClick={downloadBackup} className="flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 font-bold text-white">
            <Download size={18} /> 백업 다운로드
          </button>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 font-bold text-white">
            <Upload size={18} /> 백업 불러오기
            <input type="file" accept="application/json" onChange={uploadBackup} className="hidden" />
          </label>
        </div>
      </section>
    </>
  );
}

function SummaryCard({ icon, title, value, highlight }) {
  return (
    <div className={`rounded-[1.7rem] p-4 shadow-sm ${highlight ? "bg-violet-600 text-white" : "bg-white text-slate-900"}`}>
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${highlight ? "bg-white/20" : "bg-violet-100 text-violet-600"}`}>
        {icon}
      </div>
      <p className={`text-xs font-bold ${highlight ? "text-violet-100" : "text-slate-500"}`}>{title}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}

function Info({ label, value, green }) {
  return (
    <div className={`rounded-2xl p-3 ${green ? "bg-emerald-100 text-emerald-700" : "bg-white text-slate-800"}`}>
      <p className="text-xs font-bold opacity-60">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${
        active ? "bg-violet-600 text-white shadow-lg shadow-violet-200" : "bg-slate-100 text-slate-500"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
