const GOOGLE_SHEET_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbw4dVq_85POAS86dyDl4wZxLEA_qGq1N1SWlQgkqIc3kPsgEyns75vDtcdeJKDOuyJH0Q/exec";

/**
 * script.js - Universal JavaScript file
 * Civil Engineering & Government Contracting Website
 * Implements mobile navigation menu toggle and contact form validation/modal feedback.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Interactivity ---
    const hamburger = document.getElementById('hamburger-toggle');
    const navMenu = document.getElementById('nav-menu-list');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Toggle body scroll locking when mobile menu is active
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close menu when clicking nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // --- Active Page Navigation Link Highlight ---
    const currentPath = window.location.pathname;
    const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    
    const menuLinks = document.querySelectorAll('.nav-link');
    menuLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === pageName || (pageName === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // --- Contact Form Client-Side Validation & Success Feedback ---
    const contactForm = document.getElementById('inquiry-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent page reload

            // Reset previous validation styles
            let isValid = true;
            const formInputs = contactForm.querySelectorAll('.form-input');
            formInputs.forEach(input => {
                input.classList.remove('error');
                const errMsg = document.getElementById(`${input.id}-error`);
                if (errMsg) errMsg.style.display = 'none';
            });

            // 1. Full Name Validation
            const nameInput = document.getElementById('full-name');
            if (!nameInput.value.trim()) {
                showInputError(nameInput, 'Please enter your full name.');
                isValid = false;
            }

            // 2. Organization/Department Validation
            const orgInput = document.getElementById('organization');
            if (!orgInput.value.trim()) {
                showInputError(orgInput, 'Please enter your organization or government department.');
                isValid = false;
            }

            // 3. Email Validation
            const emailInput = document.getElementById('email');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailInput.value.trim()) {
                showInputError(emailInput, 'Please enter your email address.');
                isValid = false;
            } else if (!emailRegex.test(emailInput.value.trim())) {
                showInputError(emailInput, 'Please enter a valid email address (e.g., name@domain.com).');
                isValid = false;
            }

            // 4. Phone Validation (Optional but must be digits if filled)
            const phoneInput = document.getElementById('phone');
            if (phoneInput.value.trim() && !/^\+?[0-9\s-]{7,15}$/.test(phoneInput.value.trim())) {
                showInputError(phoneInput, 'Please enter a valid telephone number.');
                isValid = false;
            }

            // 5. Project Type Validation
            const projectTypeInput = document.getElementById('project-type');
            if (!projectTypeInput.value) {
                showInputError(projectTypeInput, 'Please select a project type.');
                isValid = false;
            }

            // 6. Message Validation
            const messageInput = document.getElementById('message');
            if (!messageInput.value.trim()) {
                showInputError(messageInput, 'Please write details about your inquiry.');
                isValid = false;
            } else if (messageInput.value.trim().length < 15) {
                showInputError(messageInput, 'Please provide a bit more detail (minimum 15 characters).');
                isValid = false;
            }

            // If all fields are valid, trigger the success modal or post to Google Sheet
            if (isValid) {
                const formData = {
                    name: nameInput.value.trim(),
                    organization: orgInput.value.trim(),
                    email: emailInput.value.trim(),
                    phone: phoneInput.value.trim(),
                    projectType: projectTypeInput.value,
                    requirements: messageInput.value.trim()
                };

                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.textContent;

                // Fallback if URL is not yet configured
                if (GOOGLE_SHEET_WEBAPP_URL === "PASTE_YOUR_WEBAPP_URL_HERE") {
                    triggerSuccessModal(formData.name, formData.email);
                    contactForm.reset();
                    return;
                }

                // Show sending loading state on button
                submitBtn.disabled = true;
                submitBtn.textContent = "Sending Request...";

                // Submit to Apps Script Web App
                fetch(GOOGLE_SHEET_WEBAPP_URL, {
                    method: 'POST',
                    mode: 'no-cors', // Bypasses browser CORS redirects block
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                })
                .then(() => {
                    // With no-cors mode, fetch execution resolves successfully
                    triggerSuccessModal(formData.name, formData.email);
                    contactForm.reset();
                })
                .catch(error => {
                    console.error('Submission Error:', error);
                    alert("Submission failed. Please check your internet connection and try again.");
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                });
            }
        });
    }

    // Helpers to display error message under form inputs
    function showInputError(inputElement, errorMessage) {
        inputElement.classList.add('error');
        const errorContainer = document.getElementById(`${inputElement.id}-error`);
        if (errorContainer) {
            errorContainer.textContent = errorMessage;
            errorContainer.style.display = 'block';
        }
        inputElement.focus();
    }

    // Trigger Custom Success Modal overlay rather than default prompt
    function triggerSuccessModal(userName, userEmail) {
        // Create modal DOM structure dynamically if not present
        let modalOverlay = document.getElementById('success-modal-overlay');
        
        if (!modalOverlay) {
            modalOverlay = document.createElement('div');
            modalOverlay.id = 'success-modal-overlay';
            modalOverlay.className = 'modal-overlay';
            
            modalOverlay.innerHTML = `
                <div class="success-modal">
                    <div class="modal-icon">✓</div>
                    <h3>Inquiry Received</h3>
                    <p id="modal-message-text"></p>
                    <button id="modal-close-btn" class="btn btn-primary">Done</button>
                </div>
            `;
            document.body.appendChild(modalOverlay);
        }

        const msgText = modalOverlay.querySelector('#modal-message-text');
        msgText.innerHTML = `Thank you, <strong>${userName}</strong>. Your quotation request has been logged successfully. A civil representative will review your project details and respond to <strong>${userEmail}</strong> within 1 business day.`;

        // Activate modal classes
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Bind close event
        const closeBtn = modalOverlay.querySelector('#modal-close-btn');
        closeBtn.addEventListener('click', () => {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // --- MSDC Jalandhar Fullscreen Lightbox Slider Logic ---
    const msdcCards = document.querySelectorAll('.msdc-card');
    const viewDeckBtn = document.getElementById('view-full-deck-btn');
    const lightbox = document.getElementById('lightbox');
    
    if (lightbox) {
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxCaption = document.getElementById('lightbox-caption');
        const lightboxCounter = document.getElementById('lightbox-counter');
        const lightboxClose = document.getElementById('lightbox-close');
        const lightboxPrev = document.getElementById('lightbox-prev');
        const lightboxNext = document.getElementById('lightbox-next');
        
        let currentSlideIndex = 1;
        const totalSlides = 56;
        
        // Curated captions for the 12 display grid cards, and programmatic generator for the remaining ones
        const msdcCaptions = {
            1: "Campus Main Entrance - CAMPUS EXTERIOR",
            2: "Landscaped Campus Grounds - CAMPUS EXTERIOR",
            3: "Campus Courtyard - CAMPUS EXTERIOR",
            4: "Apparel & Leather Stitching Lab - TECHNICAL LABS",
            5: "Fitter & Electrical Lab - TECHNICAL LABS",
            6: "IT / ITTeS Training Center - TECHNICAL LABS",
            7: "Main Reception Block - ADMINISTRATIVE FACILITIES",
            8: "Centre Head Office - ADMINISTRATIVE FACILITIES",
            9: "Executive Conference Room - ADMINISTRATIVE FACILITIES",
            10: "Academic Lecture Hall - ADMINISTRATIVE FACILITIES",
            11: "Civic Water Filtration Facility - CAMPUS UTILITIES",
            12: "Institutional Washroom Facilities - CAMPUS UTILITIES"
        };
        
        function getMsdcCaption(index) {
            if (msdcCaptions[index]) return msdcCaptions[index];
            const zones = [
                "Academic Block Classroom & Laboratory Civil Works",
                "Advanced Training Labs & Concrete Subbase Structuring",
                "Campus Paving, Soil Compactness & Perimeter Layouts",
                "Administrative Section Interior Flooring & Conduit Outfitting",
                "Utility Substation Panels, Cabling Grid & Subgrade Pipes",
                "Civil Landscaping Grading, Retaining Walls & Site Drainage"
            ];
            const zone = zones[index % zones.length];
            return `MSDC Jalandhar Construction Deck - ${zone} - Progress Photo #${index}`;
        }
        
        function openLightbox(index) {
            currentSlideIndex = index;
            lightbox.classList.add('active');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.classList.add('lightbox-open');
            document.body.style.overflow = 'hidden';
            updateSlide();
        }
        
        function closeLightbox() {
            lightbox.classList.remove('active');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('lightbox-open');
            document.body.style.overflow = '';
        }
        
        function updateSlide() {
            lightboxImg.style.opacity = '0';
            lightboxImg.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                lightboxImg.src = `MSDC${currentSlideIndex}.jpg`;
                lightboxImg.alt = getMsdcCaption(currentSlideIndex);
                
                // Fallback image in case MSDC images are not physically present on disk yet
                lightboxImg.onerror = function() {
                    const fallbackUrls = [
                        "https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1545624905-242ef998246e?auto=format&fit=crop&w=1200&q=80"
                    ];
                    this.src = fallbackUrls[currentSlideIndex % fallbackUrls.length];
                    this.onerror = null;
                };
                
                lightboxCaption.textContent = getMsdcCaption(currentSlideIndex);
                lightboxCounter.textContent = `Photo ${currentSlideIndex} of ${totalSlides}`;
                
                lightboxImg.style.opacity = '1';
                lightboxImg.style.transform = 'scale(1)';
            }, 100);
        }
        
        function navigateSlide(direction) {
            currentSlideIndex += direction;
            if (currentSlideIndex > totalSlides) currentSlideIndex = 1;
            if (currentSlideIndex < 1) currentSlideIndex = totalSlides;
            updateSlide();
        }
        
        // Click grid images to open lightbox
        msdcCards.forEach(card => {
            card.addEventListener('click', () => {
                const index = parseInt(card.getAttribute('data-index'), 10);
                openLightbox(index);
            });
        });
        
        // Click progress deck button to open at image 1
        if (viewDeckBtn) {
            viewDeckBtn.addEventListener('click', () => {
                openLightbox(1);
            });
        }
        
        // Lightbox Navigation triggers
        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        if (lightboxPrev) lightboxPrev.addEventListener('click', () => navigateSlide(-1));
        if (lightboxNext) lightboxNext.addEventListener('click', () => navigateSlide(1));
        
        // Close on background overlay click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        // Keyboard listeners for slides
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            
            if (e.key === 'ArrowLeft') {
                navigateSlide(-1);
            } else if (e.key === 'ArrowRight') {
                navigateSlide(1);
            } else if (e.key === 'Escape') {
                closeLightbox();
            }
        });
    }
});
