import { Layout } from "@/components/Layout";
import { OrthoPartnerManagement } from "@/components/OrthoPartnerManagement";

export default function OrthoPartners() {
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <OrthoPartnerManagement />
      </div>
    </Layout>
  );
}