import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./ui";

export function PaymentReminder() {
  const [dismissed, setDismissed] = useState(false);

  return (
    <>
      {!dismissed && (
        <Modal title="Cuota pendiente" onClose={() => setDismissed(true)}>
          <p className="text-sm text-foreground mb-4">
            Tu cuota mensual esta pendiente de pago. Ponete al dia para poder seguir ingresando al gimnasio.
          </p>
          <Button className="w-full" onClick={() => setDismissed(true)}>
            Entendido
          </Button>
        </Modal>
      )}
      <div className="w-full rounded-xl border border-destructive/30 bg-destructive/10 p-4 mb-6 flex items-center gap-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-destructive">
          <path
            d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-sm font-medium">Tu cuota mensual esta pendiente de pago. Ponete al dia con administracion.</p>
      </div>
    </>
  );
}
