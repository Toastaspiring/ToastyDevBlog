import { AdminRoute } from "../components/ProtectedRoute";
import { SharedLayout } from "../components/SharedLayout";

// This page is protected and only accessible by admin users.
// It also uses the SharedLayout for a consistent header and footer.
export default [AdminRoute, SharedLayout];