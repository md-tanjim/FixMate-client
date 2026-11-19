import jsPDF from "jspdf";
import { CustomerPayment } from "../api/customer-dashboard";


function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generatePaymentReceipt(payment: CustomerPayment) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // Header
  doc.setFillColor(15, 118, 110);
  doc.roundedRect(margin, 15, contentWidth, 37, 4, 4, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(23);
  doc.text("FixMate", margin + 8, 29);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Repair Service Payment Receipt", margin + 8, 39);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("PAID", pageWidth - margin - 8, 29, {
    align: "right",
  });

  // Receipt metadata
  let y = 66;

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Payment Receipt", margin, y);

  y += 12;

  const addRow = (label: string, value: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(label, margin, y);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);

    const lines = doc.splitTextToSize(value || "N/A", 115);
    doc.text(lines, margin + 48, y);

    y += Math.max(8, lines.length * 5 + 2);
  };

  const addSection = (title: string) => {
    y += 3;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 118, 110);
    doc.text(title, margin, y);

    y += 8;
  };

  addRow("Receipt number", payment._id);
  addRow("Payment date", formatDate(payment.paidAt));

  addSection("SERVICE DETAILS");

  addRow("Service", payment.serviceTitle);
  addRow("Booking ID", payment.bookingId);
  addRow("Technician", payment.technicianName);

  addSection("CUSTOMER DETAILS");

  addRow("Customer", payment.customerName);
  addRow("Email", payment.customerEmail);

  addSection("TRANSACTION DETAILS");

  addRow("Transaction ID", payment.transactionId);
  addRow("Payment status", "Paid");

  // Amount section
  y += 5;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 25, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  doc.text("TOTAL PAID", margin + 7, y + 15);

  doc.setFontSize(17);
  doc.setTextColor(15, 118, 110);
  doc.text(
    formatCurrency(payment.amount, payment.currency),
    pageWidth - margin - 7,
    y + 15,
    { align: "right" }
  );

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Thank you for choosing FixMate.",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  doc.save(`FixMate-Receipt-${payment._id}.pdf`);
}