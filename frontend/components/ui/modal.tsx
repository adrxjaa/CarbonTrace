"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children?: ReactNode;
};

export function Modal({ open, title, description, onClose, children }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#081a15]/60 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-[#0d241d] p-6 text-white shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            {description ? <p className="mt-2 text-sm text-white/70">{description}</p> : null}
          </div>
          <Button variant="ghost" className="text-white hover:bg-white/10" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}
