// src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Home from "./pages/HomePage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Footer from "./components/Footer";
import { MedicineProvider } from "./contexts/MedicineContext";
import Medicines from "./pages/Medicines";
import { PurchaseProvider } from "./contexts/PurchaseContext";
import PurchaseCheckout from "./pages/user/PurchaseCheckout";
import MyPurchases from "./pages/user/MyPurchases";
import AdminPaymentVerification from "./pages/admin/AdminPaymentVerification";
import { SupplyProvider } from "./contexts/SupplyContext";
import { EnquiryProvider } from "./contexts/EnquiryContext";

import SupplierCatalog from "./pages/supplier/SupplierCatalog";
import CreateSupply from "./pages/supplier/CreateSupply";
import MySupplies from "./pages/supplier/MySupplies";
import SupplierEnquiries from "./pages/supplier/SupplierEnquiries";

// Admin pages
import AdminMedicines from "./pages/admin/AdminMedicines";
import AddMedicine from "./pages/admin/AddMedicine";
import AdminSupplyApprovals from "./pages/admin/AdminSupplyApprovals";
import AdminEnquiries from "./pages/admin/AdminEnquiries";

function App() {
  return (
    <Router>
      <AuthProvider>
        <MedicineProvider>
          <SupplyProvider>
            <EnquiryProvider>
              <PurchaseProvider>
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        }
                      />

                      {/* Customer routes — authenticated */}
                      <Route
                        path="/purchase/checkout"
                        element={
                          <ProtectedRoute allowedRoles={["user"]}>
                            <PurchaseCheckout />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/my-purchases"
                        element={
                          <ProtectedRoute allowedRoles={["user"]}>
                            <MyPurchases />
                          </ProtectedRoute>
                        }
                      />

                      {/* Admin */}
                      <Route
                        path="/admin/payment-verification"
                        element={
                          <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminPaymentVerification />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="/medicines" element={<Medicines />} />
                      <Route path="*" element={<Navigate to="/" replace />} />

                      {/* SUPPLIER */}
                      <Route
                        path="/supplier/catalog"
                        element={
                          <ProtectedRoute allowedRoles={["supplier"]}>
                            <SupplierCatalog />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/supplier/supplies"
                        element={
                          <ProtectedRoute allowedRoles={["supplier"]}>
                            <MySupplies />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/supplier/supplies/create"
                        element={
                          <ProtectedRoute allowedRoles={["supplier"]}>
                            <CreateSupply />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/supplier/enquiries"
                        element={
                          <ProtectedRoute allowedRoles={["supplier"]}>
                            <SupplierEnquiries />
                          </ProtectedRoute>
                        }
                      />

                      {/* ADMIN */}
                      <Route
                        path="/admin/medicines"
                        element={
                          <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminMedicines />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/medicines/add"
                        element={
                          <ProtectedRoute allowedRoles={["admin"]}>
                            <AddMedicine />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/supplies"
                        element={
                          <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminSupplyApprovals />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/enquiries"
                        element={
                          <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminEnquiries />
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </main>
                  <Footer />
                  <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                  />
                </div>
              </PurchaseProvider>
            </EnquiryProvider>
          </SupplyProvider>
        </MedicineProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
