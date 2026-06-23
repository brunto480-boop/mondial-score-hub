import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/admin')({
  component: AdminRedirect,
});

function AdminRedirect() {
  useEffect(() => {
    window.location.href = '/admin.html';
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-sm text-gray-500 animate-pulse">Redirection vers le panneau d'administration...</p>
      </div>
    </div>
  );
}
