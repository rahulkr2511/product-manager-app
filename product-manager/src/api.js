export const BASE_URL = "http://localhost:8080/product-manager";

// Helper function to generate Basic Auth header
// No login page now
const authHeader = () => {
  const username = "admin";
  const password = "admin123";
  const credentials = btoa(`${username}:${password}`);
  return { Authorization: `Basic ${credentials}` };
}

async function handleResponse(res) {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const text = await res.text();
      if (text) message = text;
    } catch {
      // ignore body-parsing errors, fall back to status message
    }
    throw new Error(message);
  }
  // Endpoints returning 204 or empty string won't crash JSON.parse
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function fetchProducts() {
  const res = await fetch(`${BASE_URL}/products`, {
    headers: authHeader()
  });
  return handleResponse(res);
}

export async function addProduct(product) {
  const res = await fetch(`${BASE_URL}/addproduct`, {
    method: "POST",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  return handleResponse(res);
}

export async function updateProduct(id, product) {
  const res = await fetch(`${BASE_URL}/updateproduct/${id}`, {
    method: "PUT",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  return handleResponse(res);
}

export async function uploadProductImage(id, imageFile) {
  const formData = new FormData();
  formData.append("imageFile", imageFile); // Matches @RequestParam("imageFile") on backend

  // Do NOT set Content-Type header manually; browser sets boundary automatically
  const res = await fetch(`${BASE_URL}/upload-image/${id}`, {
    method: "POST",
    headers: authHeader(),
    body: formData,
  });

  if (!res.ok) {
    let message = `Image upload failed (${res.status})`;
    try {
      const text = await res.text();
      if (text) message = text;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const text = await res.text();
  return text || "Image uploaded successfully";
}

export async function deleteProduct(id) {
  const res = await fetch(`${BASE_URL}/deleteproduct/${id}`, {
    method: "DELETE",
    headers: authHeader()
  });
  return handleResponse(res);
}


export async function searchProducts(keyword) {
  const res = await fetch(
    `${BASE_URL}/products/search?keyword=${encodeURIComponent(keyword)}`
  );
  return handleResponse(res);
}