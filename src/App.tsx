import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Rewards from "./pages/Rewards";
import Cards from "./pages/Cards";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Wallet from "./pages/Wallet";
import NotFound from "./pages/NotFound";
import PromotionPage from "./pages/PromotionPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserList from "./pages/admin/UserList";
import PrivilegeList from "./pages/admin/PrivilegeList";
import BillList from "./pages/admin/BillList";
import PolicyList from "./pages/admin/PolicyList";
import PolicyCertificate from "./pages/PolicyCertificate";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
          <Route path="/cards" element={<ProtectedRoute><Cards /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="/policy-certificate" element={<ProtectedRoute><PolicyCertificate /></ProtectedRoute>} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/promo/:id" element={<ProtectedRoute><PromotionPage /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly><UserList /></ProtectedRoute>} />
          <Route path="/admin/privileges" element={<ProtectedRoute adminOnly><PrivilegeList /></ProtectedRoute>} />
          <Route path="/admin/bills" element={<ProtectedRoute adminOnly><BillList /></ProtectedRoute>} />
          <Route path="/admin/policies" element={<ProtectedRoute adminOnly><PolicyList /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
