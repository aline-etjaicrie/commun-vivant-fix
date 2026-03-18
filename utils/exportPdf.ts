export const exportToPDF = async (elementId: string, filename: string) => {
    if (typeof window === 'undefined') return;

    try {
        // Dynamic import to avoid SSR issues
        const html2pdf = (await import('html2pdf.js')).default;

        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Element ${elementId} not found`);
            return;
        }

        const options = {
            margin: 10, // mm
            filename: `${filename}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        await html2pdf().set(options).from(element).save();
    } catch (error) {
        console.error('PDF Export Error:', error);
        alert('Erreur lors de l\'export PDF. Veuillez vérifier que html2pdf.js est installé.');
    }
};
