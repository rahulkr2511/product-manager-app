import { useMemo } from "react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ProductCard({ product, tilt, onEdit, onDelete, isDeleting }) {
  const colors = Array.isArray(product.colors) ? product.colors : [];
  const releaseDate = formatDate(product.release_date ?? product.releaseDate);

  // Convert Base64 byte[] to Data URL
  const imageSrc = useMemo(() => {
    if (!product.imageData) return null;
    const mimeType = product.imageType || "image/jpeg";
    return `data:${mimeType};base64,${product.imageData}`;
  }, [product.imageData, product.imageType]);

  return (
    <article className="tag-card" style={{ "--tilt": `${tilt}deg` }}>
      <p className="tag-id">Tag #{String(product.id).padStart(4, "0")}</p>

      <div className="tag-media">
        {imageSrc ? (
          <img src={imageSrc} alt={product.name} />
        ) : (
          <div className="tag-media-empty">No Image</div>
        )}
        <span className={`avail-badge ${product.available ? "in" : "out"}`}>
          {product.available ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      {product.brand && <p className="tag-brand">{product.brand}</p>}
      <h3 className="tag-name">{product.name}</h3>

      {product.description && <p className="tag-desc">{product.description}</p>}

      {colors.length > 0 && (
        <div className="tag-colors">
          {colors.map((c) => (
            <span key={c} className="color-chip" title={c}>
              <span className="color-dot" style={{ background: c }} />
              {c}
            </span>
          ))}
        </div>
      )}

      <hr className="tag-divider" />

      <p className="tag-price">{INR.format(Number(product.price) || 0)}</p>

      <dl className="tag-meta">
        <div>
          <dt>Qty</dt>
          <dd>{product.quantity ?? "—"}</dd>
        </div>
        <div>
          <dt>Released</dt>
          <dd>{releaseDate ?? "—"}</dd>
        </div>
      </dl>

      <div className="tag-actions">
        <button
          type="button"
          className="btn-edit"
          onClick={() => onEdit(product)}
          disabled={isDeleting}
        >
          Update
        </button>
        <button
          type="button"
          className="btn-delete"
          onClick={() => onDelete(product)}
          disabled={isDeleting}
        >
          {isDeleting ? "Removing…" : "Delete"}
        </button>
      </div>
    </article>
  );
}