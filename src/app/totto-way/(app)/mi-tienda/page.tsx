import type { Metadata } from "next";
import { StoreViewer } from "./store-viewer";

export const metadata: Metadata = { title: "Mi Tienda Totto" };

// Authentication and onboarding are enforced by the inherited (app) layout.
export default function MyStorePage() {
  return <StoreViewer />;
}
