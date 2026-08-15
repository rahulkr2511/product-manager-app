import { useCallback, useEffect, useState } from "react";
import "./App.css";
import ProductCard from "./components/ProductCard.jsx";
import ProductFormModal from "./components/ProductFormModal.jsx";
import { 
  fetchProducts, 
  searchProducts,
  addProduct, 
  updateProduct, 
  uploadProductImage, 
  deleteProduct 
} from "./api.js";

// Small deterministic "tilt" per card so the tags feel hand-pinned, not uniform.
function tiltFor(id) {
  const seed = Number(id) || 0;
  const values = [-1.6, 1.2, -0.8, 1.8, -1.2, 0.6, -2, 1.4];
  return values[seed % values.length];
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");

  const [modal, setModal] = useState(null); // { mode: 'add' | 'edit', product? }
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState("");

  // Reusable loader that respects whether search text is active
  const loadData = useCallback(async (query) => {
    setLoading(true);
    setLoadError("");
    try {
      const trimmed = (query ?? "").trim();
      const data = trimmed 
        ? await searchProducts(trimmed) 
        : await fetchProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setLoadError(err.message || "Could not reach the product service.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced Server-side Search Effect (350ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(search);
    }, 350);

    // Cleanup: clears timeout if user continues typing before 350ms
    return () => clearTimeout(timer);
  }, [search, loadData]);

  async function handleFormSubmit(values, imageFile) {
    setActionError("");
    try {
      let targetId = values.id;

      if (modal.mode === "add") {
        const created = await addProduct(values);
        targetId = created?.id;
      } else {
        await updateProduct(values.id, values);
      }

      // If a new image was picked, upload it right away
      if (imageFile && targetId) {
        await uploadProductImage(targetId, imageFile);
      }

      // Refresh currently visible search results
      await loadData(search);
      setModal(null);
    } catch (err) {
      setActionError(err.message || "Failed to save product.");
      throw err;
    }
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(`Delete "${product.name}" (Tag #${product.id})?`);
    if (!confirmed) return;

    setActionError("");
    setDeletingId(product.id);
    try {
      await deleteProduct(product.id);
      // Remove immediately from state -- optimistic update, no need to refetch
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      setActionError(err.message || "Could not delete that product.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">Stockroom Ledger</p>
          <h1>Product Inventory</h1>
        </div>
        <div className="count">
          <strong>{products.length}</strong>
          {products.length === 1 ? "product on file" : "products on file"}
        </div>
      </header>

      <div className="toolbar">
        <div className="search-wrap">
          <span className="search-label">Search </span>
          <input
            className="search-input"
            type="text"
            placeholder="e.g. Trail Runner"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setModal({ mode: "add" })}
        >
          + New Product
        </button>
      </div>

      {actionError && (
        <div className="form-error" style={{ marginBottom: 20 }}>
          {actionError}
        </div>
      )}

      {loading && (
        <div className="state-block">
          <div className="spinner" />
          <p className="state-title">
            {search ? "Searching the ledger…" : "Loading the ledger…"}
          </p>
          <p>Fetching products from server.</p>
        </div>
      )}

      {!loading && loadError && (
        <div className="state-block error">
          <p className="state-title">Couldn't load products</p>
          <p>{loadError}</p>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ marginTop: 16 }}
            onClick={() => loadData(search)}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !loadError && products.length === 0 && (
        <div className="state-block">
          <p className="state-title">
            {!search.trim() ? "No products yet" : "No matching tag"}
          </p>
          <p>
            {!search.trim()
              ? "Add your first product to start the ledger."
              : `Nothing found matching "${search}".`}
          </p>
        </div>
      )}

      {!loading && !loadError && products.length > 0 && (
        <div className="grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              tilt={tiltFor(product.id)}
              onEdit={(p) => setModal({ mode: "edit", product: p })}
              onDelete={handleDelete}
              isDeleting={deletingId === product.id}
            />
          ))}
        </div>
      )}

      {modal && (
        <ProductFormModal
          mode={modal.mode}
          initialProduct={modal.product}
          onClose={() => setModal(null)}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
}