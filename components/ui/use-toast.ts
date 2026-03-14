import { useCallback, useState } from "react";

export interface Toast {
    id: string;
    title?: string;
    description?: string;
    variant?: "default" | "destructive";
}

const toasts: Toast[] = [];
const listeners: Set<(toasts: Toast[]) => void> = new Set();

function notifyListeners() {
    listeners.forEach((listener) => listener([...toasts]));
}

export function useToast() {
    const [, setToasts] = useState<Toast[]>([]);

    const toast = useCallback(
        ({ title, description, variant = "default" }: Omit<Toast, "id">) => {
            const id = Math.random().toString(36).substr(2, 9);
            const newToast = { id, title, description, variant };

            toasts.push(newToast);
            setToasts([...toasts]);
            notifyListeners();

            // Auto-remove after 5 seconds
            setTimeout(() => {
                toasts.splice(
                    toasts.findIndex((t) => t.id === id),
                    1,
                );
                setToasts([...toasts]);
                notifyListeners();
            }, 5000);

            return {
                id,
                dismiss: () => {
                    toasts.splice(
                        toasts.findIndex((t) => t.id === id),
                        1,
                    );
                    setToasts([...toasts]);
                    notifyListeners();
                },
            };
        },
        [],
    );

    return { toast };
}
