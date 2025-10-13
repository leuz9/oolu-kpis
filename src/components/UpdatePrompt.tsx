import React from 'react';

export default function UpdatePrompt() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onUpdate = () => setOpen(true);
    window.addEventListener('app:update-available', onUpdate as EventListener);
    return () => window.removeEventListener('app:update-available', onUpdate as EventListener);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        <div className="bg-gray-900 text-white rounded-lg shadow-xl p-4 w-80 border border-gray-700">
          <div className="text-sm font-medium">Nouvelle version disponible</div>
          <div className="text-xs text-gray-300 mt-1">Cliquez pour mettre à jour et charger les dernières améliorations.</div>
          <div className="mt-3 flex justify-end space-x-2">
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 text-xs rounded-md bg-gray-700 hover:bg-gray-600"
            >Plus tard</button>
            <button
              onClick={() => location.reload()}
              className="px-3 py-1.5 text-xs rounded-md bg-emerald-600 hover:bg-emerald-500"
            >Mettre à jour</button>
          </div>
        </div>
      </div>
    </div>
  );
}


