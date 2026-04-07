import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";

export default function ImaginationStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
