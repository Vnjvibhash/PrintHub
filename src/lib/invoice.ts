import { jsPDF } from "jspdf";
import { Order, SpecificationOptions } from "@/types";

export function generateInvoicePDF(order: Order, companySettings: {
  companyName: string;
  companyAddress: string;
  gstNumber: string;
  contactEmail: string;
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const invoiceNumber = order.id.replace("PH-", "INV-2026-");
  const dateStr = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // 1. Branding Header
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229); // Indigo brand color
  doc.text("PrintHub Services", 14, 20);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(companySettings.companyAddress, 14, 26);
  doc.text(`GSTIN: ${companySettings.gstNumber} | Email: ${companySettings.contactEmail}`, 14, 31);

  // 2. Invoice Meta Detail Box
  doc.setDrawColor(240, 240, 240);
  doc.setFillColor(250, 250, 252);
  doc.rect(130, 14, 66, 22, "FD");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text("INVOICE RECEIPT", 135, 20);
  
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(`Invoice No: ${invoiceNumber}`, 135, 25);
  doc.text(`Date: ${dateStr}`, 135, 29);

  // Divider Line
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 38, 196, 38);

  // 3. Bill To Customer details
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text("BILL TO:", 14, 46);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`Customer Name: ${order.customerName}`, 14, 51);
  doc.text(`Email Address: ${order.customerEmail}`, 14, 55);
  doc.text(`Payment Gateway: ${order.paymentMethod.toUpperCase()}`, 14, 59);

  // 4. Order Itemized Table Headers
  let currentY = 70;
  doc.setFillColor(79, 70, 229);
  doc.rect(14, currentY, 182, 8, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("Item & Description", 18, currentY + 5.5);
  doc.text("Specs", 85, currentY + 5.5);
  doc.text("Base Price", 130, currentY + 5.5);
  doc.text("Qty", 155, currentY + 5.5);
  doc.text("Amount", 175, currentY + 5.5);

  // 5. Billing Table Rows
  currentY += 8;
  doc.setDrawColor(230, 230, 230);
  doc.setFillColor(255, 255, 255);
  doc.rect(14, currentY, 182, 28, "D");

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);

  // Format specifications string for display
  const specs = order.specifications;
  const specList: string[] = [];
  if (specs.paperSize) specList.push(specs.paperSize);
  if (specs.colorMode) specList.push(specs.colorMode === "color" ? "Color" : "B/W");
  if (specs.sides) specList.push(specs.sides === "double" ? "2-Sided" : "1-Sided");
  if (specs.binding && specs.binding !== "none") specList.push(specs.binding);
  if (specs.size) specList.push(`Size: ${specs.size}`);
  if (specs.color) specList.push(`Color: ${specs.color}`);
  const specsStr = specList.join(", ");

  doc.setFont("Helvetica", "bold");
  doc.text(order.serviceName, 18, currentY + 8);
  
  doc.setFont("Helvetica", "normal");
  // Multi-line descriptions support
  const descText = doc.splitTextToSize(specsStr, 40);
  doc.text(descText, 85, currentY + 8);
  
  doc.text(`Rs. ${order.priceBreakdown.base.toFixed(2)}`, 130, currentY + 8);
  doc.text(order.quantity.toString(), 155, currentY + 8);
  doc.text(`Rs. ${order.priceBreakdown.subtotal.toFixed(2)}`, 175, currentY + 8);

  // Options add-ons details row if present
  if (order.priceBreakdown.optionsPrice > 0) {
    doc.text("Binding / finishing add-ons", 18, currentY + 16);
    doc.text(`Rs. ${order.priceBreakdown.optionsPrice.toFixed(2)}`, 130, currentY + 16);
    doc.text("-", 155, currentY + 16);
    doc.text(`Included`, 175, currentY + 16);
  }

  // 6. Tax Summary box
  currentY += 34;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Subtotal:", 135, currentY);
  doc.text(`Rs. ${order.priceBreakdown.subtotal.toFixed(2)}`, 175, currentY);

  doc.text("GST Tax (18%):", 135, currentY + 5);
  doc.text(`Rs. ${order.priceBreakdown.gst.toFixed(2)}`, 175, currentY + 5);

  doc.line(135, currentY + 8, 196, currentY + 8);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(79, 70, 229);
  doc.text("TOTAL AMOUNT:", 135, currentY + 13);
  doc.text(`Rs. ${order.priceBreakdown.total.toFixed(2)}`, 175, currentY + 13);

  // 7. Footer UPI Verification Notes
  currentY += 24;
  doc.setDrawColor(240, 240, 240);
  doc.setFillColor(248, 249, 250);
  doc.rect(14, currentY, 182, 22, "FD");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text("Verification Reference QR scan payment instructions:", 18, currentY + 6);
  
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text(`Verify payments using transaction reference. Payment gateway captured state is captured under transaction: ${order.paymentId || "UPI-MOCK"}`, 18, currentY + 11);
  doc.text("Note: Documents and print graphics files are automatically purged from secure Storage servers after 15 days.", 18, currentY + 15);

  return doc;
}
