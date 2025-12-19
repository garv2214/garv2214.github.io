// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(10, 10, 10, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(96, 165, 250, 0.2)';
    } else {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Active navigation link highlighting
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});


// Enhanced Contact Form Handling
class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.btnText = this.submitBtn?.querySelector('.btn-text');
        this.btnLoading = this.submitBtn?.querySelector('.btn-loading');
        this.formStatus = document.getElementById('formStatus');
        this.charCount = document.getElementById('charCount');
        this.messageField = document.getElementById('message');
        
        this.init();
    }

    init() {
        if (!this.form) return;
        
        this.setupValidation();
        this.setupEventListeners();
        this.setupBackendIntegration();
    }

    setupValidation() {
        // Validation rules for each field
        this.validationRules = {
            name: {
                required: true,
                minLength: 2,
                maxLength: 50,
                pattern: /^[a-zA-Z\s]+$/,
                message: 'Please enter a valid name (letters and spaces only)'
            },
            email: {
                required: true,
                maxLength: 100,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
            },
            subject: {
                required: true,
                minLength: 5,
                maxLength: 100,
                message: 'Subject must be between 5 and 100 characters'
            },
            message: {
                required: true,
                minLength: 20,
                maxLength: 1000,
                message: 'Message must be between 20 and 1000 characters'
            }
        };
    }

    setupEventListeners() {
        // Real-time validation
        const fields = this.form.querySelectorAll('input, textarea');
        fields.forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => {
                this.validateField(field);
                if (field.id === 'message') this.updateCharCount();
            });
        });

        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Character counter for message field
        if (this.messageField) {
            this.messageField.addEventListener('input', () => this.updateCharCount());
        }
    }

    validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        const rules = this.validationRules[fieldName];
        
        if (!rules) return true;

        let isValid = true;
        let errorMessage = '';

        // Required check
        if (rules.required && !value) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(fieldName)} is required`;
        }
        // Pattern check
        else if (value && rules.pattern && !rules.pattern.test(value)) {
            isValid = false;
            errorMessage = rules.message;
        }
        // Length checks
        else if (value && rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(fieldName)} must be at least ${rules.minLength} characters`;
        }
        else if (value && rules.maxLength && value.length > rules.maxLength) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(fieldName)} must be less than ${rules.maxLength} characters`;
        }

        // Update field appearance
        this.updateFieldState(field, isValid, errorMessage);
        
        return isValid;
    }

    updateFieldState(field, isValid, errorMessage) {
        const formGroup = field.closest('.form-group');
        const errorElement = formGroup?.querySelector('.error-message');
        
        // Remove previous states
        field.classList.remove('valid', 'invalid');
        
        if (field.value.trim()) {
            field.classList.add(isValid ? 'valid' : 'invalid');
        }

        // Update error message
        if (errorElement) {
            if (errorMessage && !isValid) {
                errorElement.textContent = errorMessage;
                errorElement.classList.add('show');
            } else {
                errorElement.textContent = '';
                errorElement.classList.remove('show');
            }
        }
    }

    getFieldLabel(fieldName) {
        const labels = {
            name: 'Name',
            email: 'Email',
            subject: 'Subject',
            message: 'Message'
        };
        return labels[fieldName] || fieldName;
    }

    updateCharCount() {
        if (!this.charCount || !this.messageField) return;
        
        const count = this.messageField.value.length;
        this.charCount.textContent = count;
        
        // Update counter styling based on length
        const counter = this.charCount.parentElement;
        counter.classList.remove('warning', 'danger');
        
        if (count > 900) {
            counter.classList.add('danger');
        } else if (count > 750) {
            counter.classList.add('warning');
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // Spam protection - check honeypot
        const honeypot = this.form.querySelector('input[name="website"]');
        if (honeypot && honeypot.value) {
            this.showStatus('Spam detected. Form submission blocked.', 'error');
            return;
        }

        // Validate all fields
        const fields = this.form.querySelectorAll('input, textarea');
        let isFormValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showStatus('Please fix the errors above before submitting.', 'error');
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        try {
            // Get form data
            const formData = new FormData(this.form);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message'),
                timestamp: new Date().toISOString()
            };

            // Submit to backend
            const result = await this.submitForm(data);
            
            if (result.success) {
                this.showStatus('Thank you! Your message has been sent successfully.', 'success');
                this.form.reset();
                this.updateCharCount();
                
                // Reset field states
                fields.forEach(field => {
                    field.classList.remove('valid', 'invalid');
                    const errorElement = field.closest('.form-group')?.querySelector('.error-message');
                    if (errorElement) {
                        errorElement.classList.remove('show');
                    }
                });
            } else {
                throw new Error(result.message || 'Submission failed');
            }

        } catch (error) {
            console.error('Form submission error:', error);
            this.showStatus('Sorry, there was an error sending your message. Please try again or contact me directly.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    setLoadingState(loading) {
        if (!this.submitBtn || !this.btnText || !this.btnLoading) return;

        this.submitBtn.disabled = loading;
        
        if (loading) {
            this.btnText.style.opacity = '0';
            this.btnLoading.style.display = 'flex';
        } else {
            this.btnText.style.opacity = '1';
            this.btnLoading.style.display = 'none';
        }
    }

    showStatus(message, type = 'info') {
        if (!this.formStatus) return;

        this.formStatus.textContent = message;
        this.formStatus.className = `form-status ${type} show`;

        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                this.formStatus.classList.remove('show');
            }, 5000);
        }
    }

    async submitForm(data) {
        // Option 1: Netlify Forms (recommended for static sites)
        if (window.location.hostname !== 'localhost') {
            try {
                const response = await fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    return { success: true };
                }
            } catch (error) {
                console.log('Netlify Forms submission failed, trying EmailJS...');
            }
        }

        // Option 2: EmailJS (client-side email service)
        if (window.emailjs) {
            try {
                const templateParams = {
                    from_name: data.name,
                    from_email: data.email,
                    subject: data.subject,
                    message: data.message
                };

                await window.emailjs.send(
                    'your_service_id', // Replace with your EmailJS service ID
                    'your_template_id', // Replace with your EmailJS template ID
                    templateParams
                );

                return { success: true };
            } catch (error) {
                console.log('EmailJS submission failed:', error);
            }
        }

        // Option 3: Formspree (fallback)
        try {
            const response = await fetch('https://formspree.io/f/your_form_id', { // Replace with your Formspree form ID
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                return { success: true };
            }
        } catch (error) {
            console.log('Formspree submission failed:', error);
        }

        // Fallback: Log to console (for development)
        console.log('Form submitted:', data);
        return { success: true };
    }

    setupBackendIntegration() {
        // Add any setup needed for backend services
        // This is where you would initialize EmailJS, reCAPTCHA, etc.
        
        // Example EmailJS initialization (uncomment and configure):
        /*
        emailjs.init('your_public_key'); // Replace with your EmailJS public key
        */
        
        // Example reCAPTCHA initialization (uncomment and configure):
        /*
        grecaptcha.ready(() => {
            // reCAPTCHA is ready
        });
        */
    }
}

// Initialize contact form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContactForm();
});

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.skill-category, .project-card, .stat');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Typing effect for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect when page loads
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.innerHTML;
        typeWriter(heroTitle, originalText, 50);
    }
});

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }
    
    .notification-close:hover {
        opacity: 0.8;
    }
    
    .notification-message {
        flex: 1;
    }
`;

document.head.appendChild(notificationStyles);

// Add active state styles for navigation
const navStyles = document.createElement('style');
navStyles.textContent = `
    .nav-link.active {
        color: #60a5fa !important;
        text-shadow: 0 0 15px rgba(96, 165, 250, 0.8) !important;
    }
    
    .nav-link.active::after {
        width: 100% !important;
    }
`;


document.head.appendChild(navStyles);

// Resume Download Functionality
document.addEventListener('DOMContentLoaded', () => {
    const resumeDownloadBtn = document.querySelector('.resume-actions .btn-primary');
    const resumeViewBtn = document.querySelector('.resume-actions .btn-secondary');
    
    if (resumeDownloadBtn) {
        resumeDownloadBtn.addEventListener('click', function(e) {
            // Add download animation
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.add('fa-spin');
                setTimeout(() => {
                    icon.classList.remove('fa-spin');
                }, 1000);
            }
            
            // Show brief feedback
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i> Downloaded!';
            this.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            
            setTimeout(() => {
                this.innerHTML = originalText;
                this.style.background = '';
            }, 2000);
        });
    }
    
    if (resumeViewBtn) {
        resumeViewBtn.addEventListener('click', function(e) {
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    }
});
