// Base API service - all HTTP requests go through here
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5071/api";

const getToken = () => localStorage.getItem("token");

const headers = () => ({
  "Content-Type": "application/json",
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const handle = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }
  if (res.status === 204) return null;
  return res.json();
};

export const api = {
  get: (path) => fetch(`${BASE_URL}${path}`, { headers: headers() }).then(handle),
  post: (path, body) =>
    fetch(`${BASE_URL}${path}`, { method: "POST", headers: headers(), body: JSON.stringify(body) }).then(handle),
  put: (path, body) =>
    fetch(`${BASE_URL}${path}`, { method: "PUT", headers: headers(), body: JSON.stringify(body) }).then(handle),
  delete: (path) => fetch(`${BASE_URL}${path}`, { method: "DELETE", headers: headers() }).then(handle),
};

// Auth
export const authApi = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
};

// Parts
export const partsApi = {
  getAll: (search, category) => api.get(`/parts?search=${search || ""}&category=${category || ""}`),
  getById: (id) => api.get(`/parts/${id}`),
  create: (data) => api.post("/parts", data),
  update: (id, data) => api.put(`/parts/${id}`, data),
  delete: (id) => api.delete(`/parts/${id}`),
  getLowStock: () => api.get("/parts/low-stock"),
};

// Customers
export const customersApi = {
  getAll: (search) => api.get(`/customers?search=${search || ""}`),
  getById: (id) => api.get(`/customers/${id}`),
  register: (data) => api.post("/customers", data),
  getMe: () => api.get("/customers/me"),
  updateMe: (data) => api.put("/customers/me", data),
  getMyVehicles: () => api.get("/customers/me/vehicles"),
  updateMyVehicle: (vehicleId, data) => api.put(`/customers/me/vehicles/${vehicleId}`, data),
  getMyHistory: () => api.get("/customers/me/history"),
  addVehicle: (customerId, data) => api.post(`/customers/${customerId}/vehicles`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

// Staff
export const staffApi = {
  getAll: () => api.get("/staff"),
  create: (data) => api.post("/staff", data),
  deactivate: (id) => api.delete(`/staff/${id}`),
};

// Vendors
export const vendorsApi = {
  getAll: () => api.get("/vendors"),
  getById: (id) => api.get(`/vendors/${id}`),
  create: (data) => api.post("/vendors", data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  delete: (id) => api.delete(`/vendors/${id}`),
};

// Sale Invoices
export const saleInvoicesApi = {
  getAll: (customerId) => api.get(`/saleinvoices${customerId ? `?customerId=${customerId}` : ""}`),
  getById: (id) => api.get(`/saleinvoices/${id}`),
  create: (data) => api.post("/saleinvoices", data),
  markPaid: (id) => api.put(`/saleinvoices/${id}/mark-paid`),
  sendEmail: (id) => api.post(`/saleinvoices/${id}/send-email`),
};

// Purchase Invoices
export const purchaseInvoicesApi = {
  getAll: () => api.get("/purchaseinvoices"),
  create: (data) => api.post("/purchaseinvoices", data),
};

// Reports
export const reportsApi = {
  financial: (period) => api.get(`/reports/financial?period=${period}`),
  topCustomers: () => api.get("/reports/top-customers"),
  customerPurchases: () => api.get("/reports/customer-purchases"),
  regularCustomers: () => api.get("/reports/regular-customers"),
  overdueCredits: () => api.get("/reports/overdue-credits"),
  inventory: () => api.get("/reports/inventory"),
};

// Appointments
export const appointmentsApi = {
  getAll: () => api.get("/appointments"),
  create: (data) => api.post("/appointments", data),
  updateStatus: (id, status) => api.put(`/appointments/${id}/status`, status),
};

// Reviews
export const reviewsApi = {
  getAll: () => api.get("/reviews"),
  submit: (data) => api.post("/reviews", data),
};

// Part Requests
export const partRequestsApi = {
  getAll: () => api.get("/partrequests"),
  create: (data) => api.post("/partrequests", data),
  updateStatus: (id, status) => api.put(`/partrequests/${id}/status`, status),
};

// Notifications
export const notificationsApi = {
  getAll: () => api.get("/notifications"),
  markRead: (id) => api.put(`/notifications/${id}/read`),
};

// AI
export const aiApi = {
  predict: (vehicleId) => api.get(`/ai/predict/${vehicleId}`),
};
