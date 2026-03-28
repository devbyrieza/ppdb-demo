import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * POST /api/pembayaran/midtrans/callback
 * Menerima notifikasi dari Midtrans (webhook)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse notification body
    const notification = await request.json();

    console.log("Midtrans notification received:", {
      order_id: notification.order_id,
      transaction_status: notification.transaction_status,
      fraud_status: notification.fraud_status,
    });

    // 2. Validate notification signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    if (!serverKey) {
      console.error("MIDTRANS_SERVER_KEY not configured");
      return NextResponse.json({ status: "error", message: "Server key not configured" }, { status: 500 });
    }

    const signatureKey = notification.signature_key;
    const orderId = notification.order_id;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;

    const expectedSignature = crypto
      .createHash("sha512")
      .update(orderId + statusCode + grossAmount + serverKey)
      .digest("hex");

    if (signatureKey !== expectedSignature) {
      console.error("Invalid signature key");
      return NextResponse.json({ status: "error", message: "Invalid signature" }, { status: 403 });
    }

    // 3. Find the payment record by order_id
    const pembayaran = await prisma.pembayaran.findFirst({
      where: { midtrans_order_id: orderId },
      select: { id: true, pendaftar_id: true, status_pembayaran: true }
    });

    if (!pembayaran) {
      console.error("Payment not found for order_id:", orderId);
      return NextResponse.json({ status: "error", message: "Payment not found" }, { status: 404 });
    }

    // 4. Determine payment status based on notification
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    let newStatus = pembayaran.status_pembayaran;
    let shouldUpdatePendaftar = false;

    if (transactionStatus === "capture") {
      // For credit card payments
      if (fraudStatus === "accept") {
        newStatus = "verified";
        shouldUpdatePendaftar = true;
      } else if (fraudStatus === "challenge") {
        // Need manual review
        newStatus = "pending";
      }
    } else if (transactionStatus === "settlement") {
      // Payment successful
      newStatus = "verified";
      shouldUpdatePendaftar = true;
    } else if (transactionStatus === "pending") {
      // Waiting for payment
      newStatus = "pending";
    } else if (
      transactionStatus === "deny" ||
      transactionStatus === "expire" ||
      transactionStatus === "cancel"
    ) {
      // Payment failed/expired/cancelled
      newStatus = "rejected";
    }

    // 5. Update payment record
    await prisma.pembayaran.update({
      where: { id: pembayaran.id },
      data: {
        midtrans_transaction_id: notification.transaction_id,
        midtrans_transaction_status: transactionStatus,
        midtrans_payment_type: notification.payment_type,
        midtrans_response_json: notification,
        status_pembayaran: newStatus,
        verified_at: newStatus === "verified" ? new Date() : null,
        catatan_verifikasi:
          newStatus === "verified"
            ? `Pembayaran otomatis via ${notification.payment_type}`
            : newStatus === "rejected"
              ? `Pembayaran ${transactionStatus}`
              : null,
        updated_at: new Date(),
      }
    });

    // 6. Update pendaftar status if payment is successful
    if (shouldUpdatePendaftar) {
      // Get current pendaftar status
      const pendaftar = await prisma.pendaftar.findUnique({
        where: { id: pembayaran.pendaftar_id },
        select: { status_pendaftaran: true }
      });

      // Only update if still waiting for payment
      if (
        pendaftar &&
        (pendaftar.status_pendaftaran === "draft" ||
          pendaftar.status_pendaftaran === "waiting_payment" ||
          pendaftar.status_pendaftaran === "payment_verification")
      ) {
        await prisma.pendaftar.update({
          where: { id: pembayaran.pendaftar_id },
          data: {
            status_pendaftaran: "verified",
            updated_at: new Date(),
          }
        });

        console.log(`Pendaftar ${pembayaran.pendaftar_id} status updated to verified`);
      }
    }

    // 7. Return success
    console.log(`Payment ${orderId} updated to status: ${newStatus}`);
    return NextResponse.json({ status: "ok", message: "Notification processed successfully" });
  } catch (error: any) {
    console.error("Error processing Midtrans callback:", error);
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok", message: "Midtrans callback endpoint is ready" });
}
