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
import AddMedicine from "./pages/admin/AddMedicine";
import MyMedicines from "./pages/admin/AdminMedicines";
import { MedicineProvider } from "./contexts/MedicineContext";
import AdminMedicinesApproval from "./pages/admin/AdminSupplyApprovals";
import Medicines from "./pages/Medicines";
import { PurchaseProvider } from "./contexts/PurchaseContext";
import PurchaseCheckout from "./pages/user/PurchaseCheckout";
import MyPurchases from "./pages/user/MyPurchases";
import AdminPaymentVerification from "./pages/admin/AdminPaymentVerification";
import { SupplyProvider } from "./contexts/SupplyContext";
import { EnquiryProvider } from "./contexts/EnquiryContext";

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
                      <Route
                        path="/supplier/medicines"
                        element={
                          <ProtectedRoute allowedRoles={["supplier"]}>
                            <MyMedicines />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/supplier/medicines/add"
                        element={
                          <ProtectedRoute allowedRoles={["supplier"]}>
                            <AddMedicine />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/medicines/approval"
                        element={
                          <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminMedicinesApproval />
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
