import { Layout } from "@/components/Layout";
import { OrthoPartnerManagement } from "@/components/OrthoPartnerManagement";
import { OrthoSampleDataGenerator } from "@/components/OrthoSampleDataGenerator";

export default function OrthoPartners() {
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 space-y-6">
        <OrthoSampleDataGenerator />
        <OrthoPartnerManagement />
      </div>
    </Layout>
  );
}