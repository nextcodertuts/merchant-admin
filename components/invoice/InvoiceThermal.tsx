/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
import type { Invoice } from "@/types";

const DEFAULT_LOGO =
  "https://gist.github.com/user-attachments/assets/a6925d83-68ab-4150-a95f-fae671d61c99";

export function InvoiceThermal({ invoice }: { invoice: Invoice }) {
  return (
    <div className="w-[58mm] font-mono text-[10px] max-h-fit leading-tight p-2 bg-white">
      <div className="text-center mb-2">
        {/* <img
          src={invoice.business?.logoUrl || DEFAULT_LOGO}
          alt="Business Logo"
          className="w-16 h-16 object-contain mx-auto mb-2"
        /> */}
        <h1 className="font-bold text-[12px]">{invoice.business?.name}</h1>
        <p>{invoice.business?.address}</p>
        <p>{invoice.business?.phone}</p>
      </div>

      <div className="mb-2">
        <p>Invoice: #{invoice.number}</p>
        <p>
          Date:{" "}
          {new Date(invoice.date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </p>
        <p>Customer: {invoice.client?.name}</p>
      </div>

      <div className="border-t border-b border-black py-1 mb-2">
        <div className="flex justify-between font-bold">
          <span>Item</span>
          <span>Qty</span>
          <span>Price</span>
          <span>D.Price</span>
          <span>Total</span>
        </div>
      </div>

      {invoice.items?.map((item) => (
        <div key={item.id} className="flex justify-between mb-1">
          <span className="w-1/3 ">{item.product.name}</span>
          <span className="w-1/6 text-left">{item.quantity}</span>
          <span className="w-1/4 text-left">
            {item.product.price.toFixed(2)}
          </span>
          <span className="w-1/4 text-left">{item.price.toFixed(2)}</span>
          <span className="w-1/4 text-right">
            ₹{(item.quantity * item.price).toFixed(2)}
          </span>
        </div>
      ))}

      <div className="border-t border-black pt-1 mt-2">
        <div className="flex justify-between">
          <span>Total:</span>
          <span>₹{invoice.total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Paid:</span>
          <span>₹{invoice.amountPaid.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Balance Due:</span>
          <span>₹{(invoice.total - invoice.amountPaid).toFixed(2)}</span>
        </div>
      </div>

      {invoice.business?.bankName && (
        <div className="mt-2 text-center">
          <p className="font-bold">Payment Details</p>
          <p>{invoice.business.bankName}</p>
          <p>Ac.No: {invoice.business.accountNo}</p>
          <p>IFSC: {invoice.business.ifscCode}</p>
          {invoice.business.upiId && <p>UPI: {invoice.business.upiId}</p>}
        </div>
      )}

      <div className="mt-2 text-center">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );
}
