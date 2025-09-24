document.addEventListener('DOMContentLoaded', () => {
    const toolsGrid = document.getElementById('tools-grid');
    const modal = document.getElementById('toolModal');
    const closeButton = document.querySelector('.modal .close-button');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody'); // This will contain all dynamic elements
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.querySelector('.upload-button');
    const processingStatus = document.getElementById('processingStatus');
    const statusText = document.getElementById('statusText');
    const previewArea = document.getElementById('previewArea');
    const toolOptionsContainer = document.getElementById('toolOptions'); // Renamed to avoid conflict
    const processButton = document.getElementById('processButton');
    const downloadButton = document.getElementById('downloadButton');

    let currentTool = null;
    let uploadedFiles = []; // Stores File objects
    let processedBlob = null; // Stores the result of a tool operation as a Blob

    const allTools = [
        { title: "Merge PDF", description: "Combine multiple PDF files into one.", icon: "fas fa-compress-arrows-alt", tool_id: "merge-pdf" },
        { title: "Add Page Numbers", description: "Insert page numbers into your PDF documents.", icon: "fas fa-list-ol", tool_id: "add-page-numbers" },
        { title: "Compress PDF", description: "Reduce the file size of your PDFs without losing quality.", icon: "fas fa-file-archive", tool_id: "compress-pdf" },
        { title: "PDF to Word", description: "Convert your PDF documents into editable Word files.", icon: "fas fa-file-word", tool_id: "pdf-to-word" },
        { title: "Word to PDF", description: "Transform Word documents into PDF format.", icon: "fas fa-file-word", tool_id: "word-to-pdf" },
        { title: "PDF to PowerPoint", description: "Convert PDFs into editable PowerPoint presentations.", icon: "fas fa-file-powerpoint", tool_id: "pdf-to-powerpoint" },
        { title: "PowerPoint to PDF", description: "Turn your PowerPoint slides into PDF documents.", icon: "fas fa-file-powerpoint", tool_id: "powerpoint-to-pdf" },
        { title: "PDF to Excel", description: "Extract data from PDFs into Excel spreadsheets.", icon: "fas fa-file-excel", tool_id: "pdf-to-excel" },
        { title: "Excel to PDF", description: "Convert Excel spreadsheets into PDF files.", icon: "fas fa-file-excel", tool_id: "excel-to-pdf" },
        { title: "PDF to JPG", description: "Convert each page of a PDF into JPG images.", icon: "fas fa-file-image", tool_id: "pdf-to-jpg" },
        { title: "JPG to PDF", description: "Combine multiple JPG images into a single PDF.", icon: "fas fa-file-image", tool_id: "jpg-to-pdf" },
        { title: "Add Watermark", description: "Add text or image watermarks to your PDFs.", icon: "fas fa-tint", tool_id: "add-watermark" },
        { title: "Edit PDF", description: "Add text or images directly to your PDF pages.", icon: "fas fa-edit", tool_id: "edit-pdf" },
        { title: "Rotate PDF", description: "Rotate PDF pages by 90, 180, or 270 degrees.", icon: "fas fa-rotate", tool_id: "rotate-pdf" },
        { title: "Unlock PDF", description: "Remove password protection from your PDF files.", icon: "fas fa-unlock", tool_id: "unlock-pdf" },
        { title: "Protect PDF", description: "Add a password to secure your PDF documents.", icon: "fas fa-lock", tool_id: "protect-pdf" },
        { title: "Split PDF", description: "Divide a large PDF into multiple smaller PDF files.", icon: "fas fa-columns", tool_id: "split-pdf" },
        { title: "Organize PDF", description: "Reorder, delete, or insert pages in your PDF.", icon: "fas fa-sitemap", tool_id: "organize-pdf" }
    ];

    // --- UI Rendering Functions ---

    function renderToolCards() {
        allTools.forEach(tool => {
            const card = document.createElement('div');
            card.className = 'tool-card';
            card.innerHTML = `
                <h2><i class="${tool.icon}"></i> ${tool.title}</h2>
                <p>${tool.description}</p>
                <button class="open-tool-button" data-tool-id="${tool.tool_id}">Open Tool</button>
            `;
            toolsGrid.appendChild(card);
        });
    }

    // --- Modal Control Functions ---

    function openModal(tool) {
        currentTool = tool;
        modalTitle.textContent = tool.title;
        uploadedFiles = [];
        processedBlob = null;
        resetModalUI();
        renderToolSpecificUI(tool.tool_id);
        modal.style.display = 'block';
    }

    function closeModal() {
        modal.style.display = 'none';
        currentTool = null;
        uploadedFiles = [];
        processedBlob = null;
        resetModalUI();
    }

    function resetModalUI() {
        fileUploadArea.style.display = 'flex';
        processingStatus.style.display = 'none';
        previewArea.style.display = 'none';
        previewArea.innerHTML = '';
        toolOptionsContainer.innerHTML = ''; // Clear tool-specific options
        toolOptionsContainer.style.display = 'none';
        processButton.style.display = 'block';
        processButton.textContent = 'Process';
        downloadButton.style.display = 'none';
        if (fileInput) fileInput.value = ''; // Clear any selected files in the input
        statusText.textContent = 'Uploading...';
    }

    // --- Tool-Specific UI Rendering ---

    function renderToolSpecificUI(toolId) {
        toolOptionsContainer.innerHTML = ''; // Clear previous options
        toolOptionsContainer.style.display = 'block'; // Ensure options container is visible if needed

        switch (toolId) {
            case 'add-page-numbers':
                toolOptionsContainer.innerHTML = `
                    <label for="pageNumberPosition">Position:</label>
                    <select id="pageNumberPosition">
                        <option value="top-left">Top Left</option>
                        <option value="top-center">Top Center</option>
                        <option value="top-right">Top Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="bottom-center" selected>Bottom Center</option>
                        <option value="bottom-right">Bottom Right</option>
                    </select>
                    <label for="pageNumberStart">Start at page:</label>
                    <input type="number" id="pageNumberStart" value="1" min="1">
                `;
                break;
            case 'add-watermark':
                toolOptionsContainer.innerHTML = `
                    <label for="watermarkText">Watermark Text:</label>
                    <input type="text" id="watermarkText" placeholder="Confidential, Draft, etc.">
                    <label for="watermarkOpacity">Opacity (%):</label>
                    <input type="number" id="watermarkOpacity" value="50" min="0" max="100">
                `;
                break;
            case 'protect-pdf':
                toolOptionsContainer.innerHTML = `
                    <label for="password">Set Password:</label>
                    <input type="password" id="password" placeholder="Enter password">
                    <label for="confirmPassword">Confirm Password:</label>
                    <input type="password" id="confirmPassword" placeholder="Confirm password">
                `;
                break;
            case 'split-pdf':
                toolOptionsContainer.innerHTML = `
                    <label for="splitMethod">Split By:</label>
                    <select id="splitMethod">
                        <option value="every-page">Every Page</option>
                        <option value="ranges">Custom Ranges (e.g., 1-5, 7, 10-12)</option>
                    </select>
                    <input type="text" id="splitRanges" placeholder="e.g., 1-5, 7, 10-12" style="display:none;">
                `;
                document.getElementById('splitMethod').addEventListener('change', (e) => {
                    document.getElementById('splitRanges').style.display = e.target.value === 'ranges' ? 'block' : 'none';
                });
                break;
            case 'rotate-pdf':
                toolOptionsContainer.innerHTML = `
                    <label for="rotationAngle">Rotation Angle:</label>
                    <select id="rotationAngle">
                        <option value="90">90 Degrees</option>
                        <option value="180">180 Degrees</option>
                        <option value="270">270 Degrees</option>
                    </select>
                `;
                break;
            // For tools like 'Merge PDF' or 'JPG to PDF', you'd typically handle multiple file previews/reordering
            case 'merge-pdf':
            case 'jpg-to-pdf':
            case 'organize-pdf':
                // For these, the preview area will become interactive (reorderable items)
                previewArea.style.display = 'flex'; // Ensure it's visible for multi-file tools
                toolOptionsContainer.style.display = 'none'; // No separate options for these usually
                break;
            default:
                toolOptionsContainer.style.display = 'none'; // No specific options needed for other tools
                break;
        }
    }

    // --- File Handling Functions ---

    function handleFiles(files) {
        if (!files || !files.length) return;

        // Clear previous previews if it's not a multi-file append scenario
        if (!currentTool || (currentTool.tool_id !== 'merge-pdf' && currentTool.tool_id !== 'jpg-to-pdf' && currentTool.tool_id !== 'organize-pdf')) {
             uploadedFiles = [];
             previewArea.innerHTML = '';
        }

        fileUploadArea.style.display = 'none';
        previewArea.style.display = 'flex'; // Show preview area
        processingStatus.style.display = 'none'; // Hide processing if files are just uploaded

        Array.from(files).forEach(file => {
            uploadedFiles.push(file); // Add to the global array

            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.dataset.name = file.name;

            const fileName = document.createElement('span');
            fileName.textContent = file.name;

            if (file.type && file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.alt = file.name;
                img.onload = () => URL.revokeObjectURL(img.src);
                previewItem.appendChild(img);
            } else if (file.type === 'application/pdf') {
                const icon = document.createElement('i');
                icon.className = 'fas fa-file-pdf fa-3x'; // Larger PDF icon
                icon.style.color = '#e74c3c'; // Red for PDF
                previewItem.appendChild(icon);
            } else {
                const icon = document.createElement('i');
                icon.className = 'fas fa-file fa-3x'; // Generic file icon
                previewItem.appendChild(icon);
            }

            previewItem.appendChild(fileName);
            previewArea.appendChild(previewItem);
        });

        // If it's a multi-file tool, re-enable file upload for more files
        if (currentTool && (currentTool.tool_id === 'merge-pdf' || currentTool.tool_id === 'jpg-to-pdf' || currentTool.tool_id === 'organize-pdf')) {
             fileUploadArea.style.display = 'flex'; // Allow adding more files
             const p = fileUploadArea.querySelector('p');
             if (p) p.textContent = 'Add more files or Drag & Drop here';
        }

        // Make preview items draggable for multi-file tools (simple example)
        if (currentTool && (currentTool.tool_id === 'merge-pdf' || currentTool.tool_id === 'jpg-to-pdf' || currentTool.tool_id === 'organize-pdf')) {
            makePreviewItemsDraggable();
        }
    }

    function makePreviewItemsDraggable() {
        const items = previewArea.querySelectorAll('.preview-item');
        items.forEach(item => {
            item.draggable = true;

            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.dataset.name);
                e.target.classList.add('dragging');
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault(); // Allow drop
                const draggingItem = document.querySelector('.dragging');
                if (draggingItem && draggingItem !== e.target) {
                    const bounding = e.target.getBoundingClientRect();
                    const offset = bounding.x + (bounding.width / 2);
                    if (e.clientX < offset) {
                        previewArea.insertBefore(draggingItem, e.target);
                    } else {
                        previewArea.insertBefore(draggingItem, e.target.nextSibling);
                    }
                }
            });

            item.addEventListener('dragenter', (e) => {
                e.preventDefault();
                e.target.classList.add('drag-over');
            });

            item.addEventListener('dragleave', (e) => {
                e.target.classList.remove('drag-over');
            });

            item.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
                previewArea.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
                // Reorder the `uploadedFiles` array based on the new DOM order
                reorderUploadedFiles();
            });
        });
    }

    function reorderUploadedFiles() {
        const currentOrderNames = Array.from(previewArea.children).map(item => item.dataset.name);
        uploadedFiles.sort((a, b) => {
            return currentOrderNames.indexOf(a.name) - currentOrderNames.indexOf(b.name);
        });
        console.log("Files reordered:", uploadedFiles.map(f => f.name));
    }


    // --- Simulated Processing & Download ---

    async function simulateProcessing() {
        if (uploadedFiles.length === 0) {
            alert('Please upload files first!');
            return;
        }

        fileUploadArea.style.display = 'none';
        previewArea.style.display = 'none';
        toolOptionsContainer.style.display = 'none';
        processButton.style.display = 'none';
        processingStatus.style.display = 'flex';
        statusText.textContent = 'Uploading files...';

        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate upload

        statusText.textContent = 'Processing document(s)...';
        await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing

        statusText.textContent = 'Almost done...';
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate final touches

        statusText.textContent = 'Done!';
        processingStatus.style.display = 'none';
        downloadButton.style.display = 'block';

        // Create a dummy blob for demonstration
        const dummyContent = `This is the result of your ${currentTool.title} operation on ${uploadedFiles.map(f => f.name).join(', ')}.\n\nGenerated by PDF WIZARD.`;
        processedBlob = new Blob([dummyContent], { type: 'text/plain' }); // Replace with actual processed file data
    }

    function downloadResult() {
        if (processedBlob) {
            const url = URL.createObjectURL(processedBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pdfwizard_${currentTool.tool_id}_result.${processedBlob.type.split('/')[1] || 'txt'}`; // Basic file extension
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            closeModal(); // Close modal after download
        } else {
            alert('No processed file to download!');
        }
    }


    // --- Event Listeners ---

    // Render tool cards on page load
    renderToolCards();

    // Open Modal when a tool card button is clicked
    toolsGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('open-tool-button')) {
            const toolId = e.target.dataset.toolId;
            const tool = allTools.find(t => t.tool_id === toolId);
            if (tool) {
                openModal(tool);
            }
        }
    });

    // Close Modal
    if (closeButton) closeButton.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // --- Robust File Input Trigger (Updated) ---
    // This replaces the simple `uploadButton.addEventListener('click', () => fileInput.click())`
    // and ensures better mobile behavior (camera/gallery/options) and graceful fallback.

    (function setupFileInputTriggers() {
        // Desired accept/capture for mobile + desktop
        const desiredAccept = "image/*,video/*,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx";
        const desiredCapture = "environment"; // prefer back camera

        let pickerOpen = false; // prevents double trigger

        function openPickerWithFallback() {
            if (pickerOpen) return;
            pickerOpen = true;

            // Ensure the main input exists
            if (fileInput) {
                try {
                    // Apply attributes dynamically (overrides HTML if needed)
                    fileInput.accept = desiredAccept;
                    fileInput.capture = desiredCapture;
                    fileInput.multiple = true; // allow multiple selection by default

                    // On some browsers clicking a hidden input may be blocked; try/catch and fallback
                    try {
                        fileInput.click();
                    } catch (err) {
                        // fallback: create a temporary input, attach change handler and click it
                        console.warn('fileInput.click() blocked, using fallback input. Error:', err);
                        const tmp = document.createElement('input');
                        tmp.type = 'file';
                        tmp.accept = desiredAccept;
                        tmp.capture = desiredCapture;
                        tmp.multiple = true;
                        tmp.style.display = 'none';
                        document.body.appendChild(tmp);

                        tmp.addEventListener('change', (ev) => {
                            handleFiles(ev.target.files);
                            // cleanup
                            setTimeout(() => {
                                document.body.removeChild(tmp);
                            }, 300);
                        });

                        tmp.click();
                    }
                } catch (e) {
                    console.error('Error opening file picker:', e);
                }
            } else {
                // If no fileInput element present, create a temp input as fallback
                console.warn('fileInput element not found — creating a temporary input.');
                const tmp2 = document.createElement('input');
                tmp2.type = 'file';
                tmp2.accept = desiredAccept;
                tmp2.capture = desiredCapture;
                tmp2.multiple = true;
                tmp2.style.display = 'none';
                document.body.appendChild(tmp2);

                tmp2.addEventListener('change', (ev) => {
                    handleFiles(ev.target.files);
                    setTimeout(() => {
                        document.body.removeChild(tmp2);
                    }, 300);
                });

                tmp2.click();
            }

            // Re-enable after a short delay (picker UI duration)
            // Some browsers cancel rapid re-open attempts; 1.5s is usually safe
            setTimeout(() => {
                pickerOpen = false;
            }, 1500);
        }

        // Wire multiple event types for better compatibility (click, pointerdown, touchstart)
        if (uploadButton) {
            uploadButton.addEventListener('click', (e) => {
                e.preventDefault();
                openPickerWithFallback();
            });
            uploadButton.addEventListener('pointerdown', (e) => {
                // pointerdown sometimes more reliable on mobile
                // don't preventDefault here to allow focus behavior
                openPickerWithFallback();
            });
            uploadButton.addEventListener('touchstart', (e) => {
                openPickerWithFallback();
            }, { passive: true });
        } else {
            // If uploadButton isn't found, attach to the whole fileUploadArea (click)
            if (fileUploadArea) {
                fileUploadArea.addEventListener('click', (e) => {
                    // avoid reacting to clicks on the drop area when dragging files
                    if (e.target && e.target.classList && e.target.classList.contains('upload-button')) return;
                    openPickerWithFallback();
                });
            }
        }

        // Ensure native input change still handled
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                // fileInput may trigger even when clicking cancel in some UIs (length === 0)
                if (e.target && e.target.files && e.target.files.length > 0) {
                    handleFiles(e.target.files);
                } else {
                    // no files selected — do nothing
                    // console.log('file input change with no files (user canceled)');
                }
            });
        }
    })();

    // Drag and Drop
    if (fileUploadArea) {
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.classList.add('drag-over');
        });
        fileUploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('drag-over');
        });
        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('drag-over');
            handleFiles(e.dataTransfer.files);
        });
    }

    // Process Button
    if (processButton) processButton.addEventListener('click', simulateProcessing);

    // Download Button
    if (downloadButton) downloadButton.addEventListener('click', downloadResult);

    // Sidebar navigation (for mobile collapsible sections)
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (sidebarNav) {
        sidebarNav.addEventListener('click', (e) => {
            const targetH4 = e.target.closest('.sidebar-nav h4');
            if (targetH4) {
                const section = targetH4.parentElement;
                section.classList.toggle('active'); // Toggles max-height for the ul
            }

            const sidebarNavLink = e.target.closest('.sidebar-nav a');
            if (sidebarNavLink && sidebarNavLink.dataset.tool) {
                e.preventDefault(); // Prevent default link behavior
                const toolId = sidebarNavLink.dataset.tool;
                const tool = allTools.find(t => t.tool_id === toolId);
                if (tool) {
                    openModal(tool);
                }
            }
        });
    }


    // Hamburger menu for mobile
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const sidebar = document.querySelector('.sidebar');
    if (hamburgerMenu && sidebar) {
        hamburgerMenu.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Close sidebar if main content area is clicked when sidebar is open (mobile)
    const mainContainer = document.querySelector('.main-container');
    if (mainContainer && sidebar) {
        mainContainer.addEventListener('click', (e) => {
            if (sidebar.classList.contains('open') && !e.target.closest('.sidebar')) {
                sidebar.classList.remove('open');
            }
        });
    }

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
            // Close mobile sidebar if open after clicking a link
            if (sidebar && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    });

    // For the "Get Started Now" button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            const tg = document.querySelector('#tools-grid');
            if (tg) {
                tg.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    }

});