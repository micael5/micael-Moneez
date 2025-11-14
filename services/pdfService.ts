import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exports a specific HTML element to a PDF file.
 * @param elementId The ID of the HTML element to capture.
 * @param fileName The desired name for the output PDF file.
 */
export const exportToPdf = async (elementId: string, fileName: string): Promise<void> => {
    // Find the element that you want to capture
    const input = document.getElementById(elementId);

    if (!input) {
        console.error(`Element with id ${elementId} not found.`);
        return;
    }

    try {
        // Use html2canvas to render the element as a canvas
        const canvas = await html2canvas(input, {
            scale: 2, // Increase scale for better resolution
            backgroundColor: '#ffffff', // Force a white background for consistency
            useCORS: true, // Enable cross-origin images if any
        });

        const imgData = canvas.toDataURL('image/png');

        // Initialize jsPDF
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;

        let imgWidth = pdfWidth;
        let imgHeight = imgWidth / ratio;
        
        // If the image height is greater than the page height, scale it down
        if (imgHeight > pdfHeight) {
            imgHeight = pdfHeight;
            imgWidth = imgHeight * ratio;
        }

        const x = (pdfWidth - imgWidth) / 2;
        const y = 0; // Start at the top

        // Add the image to the PDF
        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

        // Save the PDF
        pdf.save(fileName);

    } catch (error) {
        console.error("Error generating PDF:", error);
    }
};
