# Product Inventory (Stockroom Ledger)

A single-page React app for basic CRUD on a `Product` entity:

```
id, name, description, brand, price (INR), colors [String],
release_date, available (boolean), quantity (Integer), image
```

No routing — everything happens on one screen, and all products load in one shot.

## Backend it expects

Running at `http://localhost:8080` (see `src/api.js` to change the base URL):


**Image**: the uploaded file is read client-side and sent as a base64 data URL
in the `image` field (max 2MB). If your `Product` entity stores `image` as a
`byte[]`/`@Lob`, decode the data-URL payload (strip the
`data:image/...;base64,` prefix) server-side, or swap this field for a real
file-upload endpoint later — the form only needs `onImageChange` in
`ProductFormModal.jsx` adjusted to call it.

If your Spring Boot backend maps `updateproduct` to `POST` instead of `PUT`,
change the method in `src/api.js` (`updateproduct` function) to match.

Make sure the backend allows CORS from `http://localhost:5173` (Vite's dev
port), e.g. with `@CrossOrigin(origins = "http://localhost:5173")` on the
controller, or a global CORS config.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL (defaults to `http://localhost:5173`).

## What's included

- **Product cards** styled as inventory tags: image, availability badge,
  brand, name, description, color chips, price (INR), quantity, release date,
  Update / Delete.
- **Search bar** that filters the loaded list by product name as you type
  (case-insensitive).
- **+ New Product** opens a form modal with every field, including drag-free
  image upload (click to choose, preview, remove) and a color picker: tap a
  preset swatch, pick a custom color, or type a name/hex and hit Enter — each
  choice becomes a removable chip.
- **Update** opens the same modal pre-filled, ID locked (since it's the `@Id`).
- **Delete** asks for confirmation, then calls the API and removes the card.
- Loading, error (with retry), and empty states are all handled.

## Project structure

```
src/
  api.js                     fetch wrappers for the 4 endpoints
  App.jsx                    page state: load, search, add/edit/delete
  components/
    ProductCard.jsx          one product's tag card
    ProductFormModal.jsx     shared add/edit form
  index.css                  design tokens + global styles
  App.css                    component styles
```
