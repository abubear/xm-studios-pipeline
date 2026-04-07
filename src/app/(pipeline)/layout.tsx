import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";

export default function PipelineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
