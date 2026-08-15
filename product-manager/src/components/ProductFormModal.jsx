import { useEffect, useRef, useState } from "react";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB

const PRESET_COLORS = [
  { name: "Black", hex: "#111111" },
  { name: "White", hex: "#f5f5f0" },
  { name: "Grey", hex: "#8c8c8c" },
  { name: "Red", hex: "#c0392b" },
  { name: "Orange", hex: "#e07b39" },
  { name: "Yellow", hex: "#e3b23c" },
  { name: "Green", hex: "#3f7d4f" },
  { name: "Blue", hex: "#2f6690" },
  { name: "Navy", hex: "#1f2d50" },
  { name: "Purple", hex: "#7b5aa6" },
  { name: "Pink", hex: "#c5698a" },
  { name: "Brown", hex: "#7a5230" },
];

function toDateInputValue(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function ProductFormModal({ mode, initialProduct, onClose, onSubmit }) {
  const isEdit = mode === "edit";
  const p = initialProduct || {};

  const [name, setName] = useState(p.name || "");
  const [brand, setBrand] = useState(p.brand || "");
  const [description, setDescription] = useState(p.description || "");
  const [price, setPrice] = useState(p.price != null ? String(p.price) : "");
  const [quantity, setQuantity] = useState(p.quantity != null ? String(p.quantity) : "");
  const [available, setAvailable] = useState(p.available ?? true);
  const [releaseDate, setReleaseDate] = useState(toDateInputValue(p.release_date ?? p.releaseDate));
  const [colors, setColors] = useState(Array.isArray(p.colors) ? p.colors : []);
  const [colorDraft, setColorDraft] = useState("");
  const [pickerHex, setPickerHex] = useState("#4c6b58");

  // Initial preview from existing Base64 imageData if editing
  const initialPreview = p.imageData
    ? `data:${p.imageType || "image/jpeg"};base64,${p.imageData}`
    : "";

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialPreview);
  const [imageError, setImageError] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function hasColor(value) {
    return colors.some((c) => c.toLowerCase() === value.toLowerCase());
  }

  function addColorValue(value) {
    const trimmed = value.trim();
    if (!trimmed || hasColor(trimmed)) return;
    setColors((prev) => [...prev, trimmed]);
  }

  function togglePreset(preset) {
    if (hasColor(preset.name)) {
      setColors((prev) => prev.filter((c) => c.toLowerCase() !== preset.name.toLowerCase()));
    } else {
      addColorValue(preset.name);
    }
  }

  function addFromPicker() {
    addColorValue(colorDraft.trim() || pickerHex);
    setColorDraft("");
  }

  function handleColorKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addFromPicker();
    } else if (e.key === "Backspace" && colorDraft === "" && colors.length > 0) {
      setColors((prev) => prev.slice(0, -1));
    }
  }

  function removeColor(value) {
    setColors((prev) => prev.filter((c) => c !== value));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    setImageError("");
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("Image is too large (max 2MB).");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (name.trim() === "" || price.trim() === "" || quantity.trim() === "") {
      setError("Name, price, and quantity are required.");
      return;
    }
    if (Number(price) < 0 || Number.isNaN(Number(price))) {
      setError("Price must be a valid number.");
      return;
    }
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
      setError("Quantity must be a whole number.");
      return;
    }

    setSubmitting(true);
    try {
      const productPayload = {
        ...(isEdit ? { id: p.id } : {}),
        name: name.trim(),
        description: description.trim(),
        brand: brand.trim(),
        price: Number(price),
        colors,
        releaseDate: releaseDate || null,
        available: Boolean(available),
        quantity: Number(quantity),
      };

      await onSubmit(productPayload, imageFile);
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <h2>{isEdit ? "Update Product" : "New Product"}</h2>
        <p className="modal-sub">
          {isEdit ? `Editing tag #${p.id}` : "Stamp a new tag for the ledger"}
        </p>

        <form onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <div className="field">
            <label htmlFor="product-brand">Brand</label>
            <input
              id="product-brand"
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              disabled={submitting}
              placeholder="e.g. Bosch"
            />
          </div>

          <div className="field">
            <label htmlFor="product-name">Name</label>
            <input
              id="product-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              placeholder="e.g. Steel Shelving Unit"
            />
          </div>

          <div className="field">
            <label htmlFor="product-description">Description</label>
            <textarea
              id="product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              placeholder="What's this product about?"
              rows={3}
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="product-price">Price (INR)</label>
              <div className="input-prefix">
                <span>₹</span>
                <input
                  id="product-price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={submitting}
                  placeholder="1999"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="product-quantity">Quantity</label>
              <input
                id="product-quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={submitting}
                placeholder="e.g. 40"
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="product-release-date">Release date</label>
              <input
                id="product-release-date"
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="field field-checkbox">
              <label htmlFor="product-available">Availability</label>
              <label className="checkbox-row">
                <input
                  id="product-available"
                  type="checkbox"
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                  disabled={submitting}
                />
                <span>{available ? "In stock" : "Out of stock"}</span>
              </label>
            </div>
          </div>

          <div className="field">
            <label htmlFor="product-color-picker">Colors</label>

            <div className="color-presets">
              {PRESET_COLORS.map((preset) => {
                const selected = hasColor(preset.name);
                return (
                  <button
                    key={preset.name}
                    type="button"
                    className={`preset-swatch${selected ? " selected" : ""}`}
                    style={{ background: preset.hex }}
                    onClick={() => togglePreset(preset)}
                    disabled={submitting}
                    title={preset.name}
                    aria-label={`${selected ? "Remove" : "Add"} ${preset.name}`}
                    aria-pressed={selected}
                  >
                    {selected && <span className="preset-check">✓</span>}
                  </button>
                );
              })}
            </div>

            <div className="color-picker-row">
              <input
                id="product-color-picker"
                type="color"
                className="color-picker-swatch"
                value={pickerHex}
                onChange={(e) => setPickerHex(e.target.value)}
                disabled={submitting}
                title="Pick a custom color"
              />
              <input
                type="text"
                value={colorDraft}
                onChange={(e) => setColorDraft(e.target.value)}
                onKeyDown={handleColorKeyDown}
                disabled={submitting}
                placeholder="Custom name or hex (or just pick, then Add)"
              />
              <button
                type="button"
                className="btn btn-ghost btn-small"
                onClick={addFromPicker}
                disabled={submitting}
              >
                Add
              </button>
            </div>

            {colors.length > 0 && (
              <div className="chip-list">
                {colors.map((c) => (
                  <span key={c} className="color-chip editable">
                    <span className="color-dot" style={{ background: c }} />
                    {c}
                    <button
                      type="button"
                      className="chip-remove"
                      onClick={() => removeColor(c)}
                      disabled={submitting}
                      aria-label={`Remove ${c}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <p className="field-hint">
              Tap a swatch, pick a custom color, or type a name/hex and hit Enter.
            </p>
          </div>

          <div className="field">
            <label htmlFor="product-image">Image</label>
            <div className="image-upload">
              {imagePreview ? (
                <div className="image-preview">
                  <img src={imagePreview} alt="Product preview" />
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={clearImage}
                    disabled={submitting}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="image-drop"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={submitting}
                >
                  Click to upload an image
                </button>
              )}
              <input
                ref={fileInputRef}
                id="product-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={submitting}
                hidden
              />
            </div>
            {imageError && <p className="field-hint field-error">{imageError}</p>}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving…" : isEdit ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}