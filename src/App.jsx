import React, { useEffect, useMemo, useState } from "react";
import {
  Calculator,
  CheckCircle2,
  Download,
  Home,
  Moon,
  Package,
  Plus,
  Save,
  Search,
  Settings,
  Sun,
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

const storageKey = "jeongmu-settlement-v3";
const today = () => new Date().toISOString().slice(0, 10);

function won(value) {
  return Number(value || 0).toLocaleString("ko-KR") + "원";
}

function koreanDate(value) {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return "날짜 없음";
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function monthKey(value) {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return "날짜 없음";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function App() {
  const [tab, setTab] = useState("settlement");
  const [products, setProducts] = useState(defaultProducts);
  const [orders, setOrders] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [buyerSearch, setBuyerSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(false);
  const [savedText, setSavedText] = useState("저장됨");
  const [newProduct, setNewProduct] = useState({ name: "", buyPrice: "", sellPrice: "" });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (Array.isArray(data.products)) setProducts(data.products);
        if (Array.isArray(data.orders)) setOrders(data.orders);
        if (typeof data.darkMode === "boolean") setDarkMode(data.darkMode);
      }
    } catch (error) {
      console.error("저장 데이터 불러오기 실패", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ products, orders, darkMode }));
    setSavedText("저장됨");
    const timer = setTimeout(() => setSavedText("자동 저장"), 1200);
    return () => clearTimeout(timer);
  }, [products, orders, darkMode]);

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

  const dates = useMemo(() => Array.from(new Set(calculatedOrders.map((o) => o.date))).sort().reverse(), [calculatedOrders]);

  const visibleOrders = useMemo(() => {
    return calculatedOrders.filter((order) => {
      const dateOk = dateFilter === "all" || order.date === dateFilter;
      const buyerOk = !buyerSearch.trim() || order.buyer.toLowerCase().includes(buyerSearch.toLowerCase());
      return dateOk && buyerOk;
    });
  }, [calculatedOrders, dateFilter, buyerSearch]);

  const recentOrders = useMemo(() => calculatedOrders.slice(0, 5), [calculatedOrders]);

  const monthlyStats = useMemo(() => {
    const map = {};
    calculatedOrders.forEach((order) => {
      const key = monthKey(order.date);
      if (!map[key]) map[key] = { month: key, totalBuy: 0, totalSell: 0, profit: 0, count: 0 };
      map[key].totalBuy += order.totalBuy;
      map[key].totalSell += order.totalSell;
      map[key].profit += order.profit;
      map[key].count += 1;
    });
    return Object.values(map).sort((a, b) => b.month.localeCompare(a.month));
  }, [calculatedOrders]);

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

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(productSearch.toLowerCase()));
  const quickProducts = products.slice(0, 8);

  function addOrder(productName = products[0]?.name || "") {
    setOrders((prev) => [
      {
        id: Date.now(),
        date: today(),
        buyer: "",
        productName,
        qty: 1,
        done: false,
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
    const blob = new Blob([JSON.stringify({ products, orders, darkMode }, null, 2)], { type: "application/json" });
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
        if (typeof data.darkMo
