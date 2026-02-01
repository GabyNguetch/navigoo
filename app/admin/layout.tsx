import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'POI Navigoo - Admin Dashboard',
  description: 'Dashboard d\'administration pour la gestion des points d\'intérêt',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}