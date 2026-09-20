// src/components/QRCodeDisplay.tsx
import React from "react";

interface QRCodeDisplayProps {
  upiId: string;
  merchantName?: string;
  amount: number;
  reference: string;
  /** Path or URL to your static QR image. Defaults to /qr-code.png (in public/) */
  qrImageSrc?: string;
}

/**
 * Displays a STATIC QR image (provided by you) alongside payment details.
 *
 * Drop your QR image at:  public/qr-code.png
 * Or pass a custom `qrImageSrc` prop (URL or imported asset).
 */
const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  upiId,
  merchantName = "Pharmacy Store",
  amount,
  reference,
  qrImageSrc = "/payment-qr-code.jpg", // 👈 file in `public/` folder
}) => {
  return (
    <div className="flex flex-col items-center">
      {/* ============ STATIC QR IMAGE ============ */}
      <div className="w-56 h-56 bg-white border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center p-2">
        <img
          src={qrImageSrc}
          alt="Payment QR Code"
          className="w-full h-full object-contain"
          onError={(e) => {
            // Fallback if the image is missing
            (e.target as HTMLImageElement).style.display = "none";
            const parent = (e.target as HTMLImageElement).parentElement;
            if (parent && !parent.querySelector(".qr-fallback")) {
              const fallback = document.createElement("div");
              fallback.className =
                "qr-fallback text-xs text-gray-400 text-center px-4";
              fallback.innerHTML =
                "QR image not found<br/>Add your QR to <code>public/qr-code.png</code>";
              parent.appendChild(fallback);
            }
          }}
        />
      </div>
      {/* ========================================= */}

      {/* Payment details */}
      <div className="mt-4 text-center space-y-1">
        <p className="text-xs text-gray-500">Merchant</p>
        <p className="font-semibold text-gray-800">{merchantName}</p>

        <p className="text-xs text-gray-500 mt-3">UPI ID</p>
        <p className="font-mono font-semibold text-gray-800">{upiId}</p>

        <p className="text-xs text-gray-500 mt-3">Amount</p>
        <p className="text-2xl font-bold text-light-orange">
          ₹{amount.toFixed(2)}
        </p>

        <p className="text-xs text-gray-500 mt-3">Reference</p>
        <p className="font-mono text-sm text-gray-700">{reference}</p>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
