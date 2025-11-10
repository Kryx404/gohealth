import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoicePDF = (orderData) => {
    const doc = new jsPDF();

    // Format Rupiah
    const formatRupiah = (number) => {
        return (
            "Rp " +
            new Intl.NumberFormat("id-ID", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(number)
        );
    };

    // Header
    doc.setFontSize(20);
    doc.setTextColor(34, 197, 94); // Green color
    doc.text("GOHEALTH", 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Invoice Pembelian", 20, 28);

    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 32, 190, 32);

    // Invoice Info
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text("Invoice Details", 20, 42);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Order ID: ${orderData.orderId}`, 20, 48);
    doc.text(
        `Tanggal: ${new Date().toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })}`,
        20,
        53,
    );
    doc.text(`Payment Method: ${orderData.paymentMethod}`, 20, 58);
    doc.text(`Status: ${orderData.status || "ORDER_RECEIVED"}`, 20, 63);

    // Customer Info
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text("Customer Information", 120, 42);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Name: ${orderData.customerName}`, 120, 48);
    doc.text(`Email: ${orderData.customerEmail}`, 120, 53);
    doc.text(`Phone: ${orderData.customerPhone || "-"}`, 120, 58);

    // Shipping Address
    if (orderData.address) {
        doc.text("Shipping Address:", 120, 65);
        const addressLines = [
            orderData.address.alamat,
            `${orderData.address.kelurahan}, ${orderData.address.kecamatan}`,
            `${orderData.address.kota}, ${orderData.address.provinsi}`,
        ];
        let yPos = 70;
        addressLines.forEach((line) => {
            doc.text(line, 120, yPos);
            yPos += 5;
        });
    }

    // Items Table
    const tableStartY = 88;

    const tableColumn = ["No", "Product", "Qty", "Price", "Subtotal"];
    const tableRows = orderData.items.map((item, index) => [
        (index + 1).toString(),
        item.name,
        item.quantity.toString(),
        formatRupiah(item.price),
        formatRupiah(item.price * item.quantity),
    ]);

    autoTable(doc, {
        startY: tableStartY,
        head: [tableColumn],
        body: tableRows,
        theme: "striped",
        headStyles: {
            fillColor: [34, 197, 94], // Green
            textColor: 255,
            fontStyle: "bold",
        },
        styles: {
            fontSize: 9,
            cellPadding: 4,
        },
        columnStyles: {
            0: { cellWidth: 15 },
            1: { cellWidth: 80 },
            2: { cellWidth: 20, halign: "center" },
            3: { cellWidth: 35, halign: "right" },
            4: { cellWidth: 40, halign: "right" },
        },
    });

    // Total Section
    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);

    // Subtotal
    doc.text("Subtotal:", 130, finalY);
    doc.text(formatRupiah(orderData.subtotal), 190, finalY, { align: "right" });

    // Shipping
    doc.text("Shipping:", 130, finalY + 6);
    doc.text("FREE", 190, finalY + 6, { align: "right" });

    // Discount (if any)
    if (orderData.discount && orderData.discount > 0) {
        doc.text("Discount:", 130, finalY + 12);
        doc.text(`-${formatRupiah(orderData.discount)}`, 190, finalY + 12, {
            align: "right",
        });
    }

    // Total line
    doc.setDrawColor(200, 200, 200);
    const totalLineY = orderData.discount > 0 ? finalY + 16 : finalY + 10;
    doc.line(130, totalLineY, 190, totalLineY);

    // Grand Total
    doc.setFontSize(12);
    doc.setTextColor(34, 197, 94); // Green
    doc.setFont(undefined, "bold");
    doc.text("TOTAL:", 130, totalLineY + 7);
    doc.text(formatRupiah(orderData.total), 190, totalLineY + 7, {
        align: "right",
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont(undefined, "normal");
    const footerY = doc.internal.pageSize.height - 20;
    doc.text("Terima kasih atas pembelian Anda!", 105, footerY, {
        align: "center",
    });
    doc.text("GoHealth - Your Trusted Health Partner", 105, footerY + 5, {
        align: "center",
    });

    // Save PDF
    const fileName = `Invoice_${orderData.orderId}_${new Date().getTime()}.pdf`;
    doc.save(fileName);

    return fileName;
};
