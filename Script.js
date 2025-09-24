// Ensure PDF-LIB is loaded from a CDN in your HTML files.
// <script src="https://unpkg.com/pdf-lib/dist/pdf-lib.min.js"></script>

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const actionBtn = document.getElementById('action-btn');
    const downloadLink = document.getElementById('download-link');
    const fileList = document.getElementById('file-list');
    const statusMessage = document.getElementById('status-message');
    const toolTitle = document.querySelector('h1').textContent; // Get the current tool name

    let uploadedFiles = [];

    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => fileInput.click());
    }

    if (fileInput) {
        fileInput.addEventListener('change', (event) => {
            uploadedFiles = Array.from(event.target.files);
            renderFileList();
            if (actionBtn) actionBtn.style.display = 'block';
        });
    }

    if (actionBtn) {
        actionBtn.addEventListener('click', () => {
            switch (toolTitle) {
                case 'Merge PDF':
                    mergePdfs();
                    break;
                case 'Split PDF':
                    splitPdf();
                    break;
                case 'Compress PDF':
                    compressPdf();
                    break;
                // Add cases for other tools here
            }
        });
    }

    function renderFileList() {
        if (!fileList) return;
        fileList.innerHTML = '';
        uploadedFiles.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.textContent = file.name;
            fileList.appendChild(fileItem);
        });
        statusMessage.textContent = `${uploadedFiles.length} file(s) selected.`;
    }

    async function downloadFile(bytes, filename, mimeType) {
        const blob = new Blob([bytes], { type: mimeType });
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = filename;
        downloadLink.textContent = `Download ${filename}`;
        downloadLink.style.display = 'inline-block';
        statusMessage.textContent = 'Operation completed!';
    }

    // --- Merge PDF Logic ---
    async function mergePdfs() {
        if (uploadedFiles.length < 2) {
            statusMessage.textContent = 'Please select at least two PDF files to merge.';
            return;
        }
        
        statusMessage.textContent = 'Merging PDFs...';
        actionBtn.disabled = true;

        try {
            const mergedPdf = await PDFLib.PDFDocument.create();
            for (const file of uploadedFiles) {
                const pdfBytes = await file.arrayBuffer();
                const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
                const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                copiedPages.forEach(page => mergedPdf.addPage(page));
            }
            const mergedPdfBytes = await mergedPdf.save();
            downloadFile(mergedPdfBytes, 'merged.pdf', 'application/pdf');
        } catch (error) {
            statusMessage.textContent = `Error: ${error.message}`;
            console.error(error);
        } finally {
            actionBtn.disabled = false;
        }
    }

    // --- Split PDF Logic ---
    async function splitPdf() {
        if (uploadedFiles.length !== 1) {
            statusMessage.textContent = 'Please select exactly one PDF file to split.';
            return;
        }

        statusMessage.textContent = 'Splitting PDF...';
        actionBtn.disabled = true;

        try {
            const pdfBytes = await uploadedFiles[0].arrayBuffer();
            const originalPdf = await PDFLib.PDFDocument.load(pdfBytes);
            
            const numPages = originalPdf.getPages().length;
            const zip = new JSZip(); // Assuming JSZip library is also loaded

            for (let i = 0; i < numPages; i++) {
                const newPdf = await PDFLib.PDFDocument.create();
                const [copiedPage] = await newPdf.copyPages(originalPdf, [i]);
                newPdf.addPage(copiedPage);
                const newPdfBytes = await newPdf.save();
                zip.file(`page-${i + 1}.pdf`, newPdfBytes);
            }

            const zipContent = await zip.generateAsync({ type: 'blob' });
            downloadFile(zipContent, 'split_pdfs.zip', 'application/zip');

        } catch (error) {
            statusMessage.textContent = `Error: ${error.message}`;
            console.error(error);
        } finally {
            actionBtn.disabled = false;
        }
    }

    // --- Compress PDF Logic (Simplified) ---
    async function compressPdf() {
        if (uploadedFiles.length !== 1) {
            statusMessage.textContent = 'Please select exactly one PDF file to compress.';
            return;
        }
        
        statusMessage.textContent = 'Compressing PDF...';
        actionBtn.disabled = true;
        
        try {
            const pdfBytes = await uploadedFiles[0].arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes, {
                // To compress, we could re-save the PDF with optimized options.
                // However, PDF-LIB's 'save' method already provides a good default compression.
                // A true compression tool would re-encode images, which requires a server.
            });
            
            const compressedPdfBytes = await pdfDoc.save();
            const originalSize = uploadedFiles[0].size;
            const compressedSize = compressedPdfBytes.length;
            const reduction = ((originalSize - compressedSize) / originalSize) * 100;
            
            statusMessage.textContent = `Compression successful! Reduced by ${reduction.toFixed(2)}%`;
            downloadFile(compressedPdfBytes, 'compressed.pdf', 'application/pdf');

        } catch (error) {
            statusMessage.textContent = `Error: ${error.message}`;
            console.error(error);
        } finally {
            actionBtn.disabled = false;
        }
    }

});
