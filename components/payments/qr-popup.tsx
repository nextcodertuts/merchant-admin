"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface QRPopupProps {
  amount: number;
  upiId: string;
}

export function QRPopup({ amount, upiId }: QRPopupProps) {
  const [open, setOpen] = useState(false);

  const upiLink = `upi://pay?pa=${upiId}&pn=Ramdhanu Garments&am=${amount}&cu=INR`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Generate QR</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md min-h-[450px]">
        <DialogHeader hidden>
          <DialogTitle className="text-center" hidden>
            Please Scan
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* <Image src="/Ramdhanu 96px.png" width={96} height={96} alt="logo" /> */}
          <QRCodeSVG value={upiLink} size={256} />
          <p className="text-center text-sm text-muted-foreground">
            Scan this QR code to pay ₹{amount} via UPI
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
