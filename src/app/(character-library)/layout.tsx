import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";

export default function CharacterLibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
