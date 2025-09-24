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
                    // Add splitPdf() function call here once implemented
                    break;
                case 'Compress PDF':
                    // Add compressPdf() function call here once implemented
                    break;
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

});
