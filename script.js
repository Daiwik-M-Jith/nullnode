// FAQ Toggle Functionality
document.addEventListener('DOMContentLoaded', () => {
    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    });

    // Search Functionality
    const searchInput = document.querySelector('.search-input');
    
    if (searchInput) {
        // Keyboard shortcut (Ctrl+K)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
            
            // Escape to blur
            if (e.key === 'Escape' && document.activeElement === searchInput) {
                searchInput.blur();
            }
        });

        // Search functionality
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            
            // If on FAQ page, filter FAQ items
            if (window.location.pathname.includes('faq.html')) {
                filterFAQItems(searchTerm);
            }
            
            // If on roadmap page, filter roadmap sections
            if (window.location.pathname.includes('roadmap.html')) {
                filterRoadmapSections(searchTerm);
            }
        });
    }

    // Filter FAQ items based on search
    function filterFAQItems(searchTerm) {
        const faqItems = document.querySelectorAll('.faq-item');
        let visibleCount = 0;
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question h3').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
            
            if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                item.style.display = 'block';
                visibleCount++;
                
                // Open item if search matches
                if (searchTerm.length > 2) {
                    item.classList.add('active');
                }
            } else {
                item.style.display = 'none';
                item.classList.remove('active');
            }
        });

        // Show message if no results
        showSearchMessage(visibleCount, searchTerm, '.faq-content');
    }

    // Filter roadmap sections based on search
    function filterRoadmapSections(searchTerm) {
        const roadmapSections = document.querySelectorAll('.roadmap-section');
        let visibleCount = 0;
        
        roadmapSections.forEach(section => {
            const heading = section.querySelector('h2').textContent.toLowerCase();
            const content = section.textContent.toLowerCase();
            
            if (heading.includes(searchTerm) || content.includes(searchTerm)) {
                section.style.display = 'block';
                visibleCount++;
            } else {
                section.style.display = 'none';
            }
        });

        // Show message if no results
        showSearchMessage(visibleCount, searchTerm, '.roadmap-content');
    }

    // Show search result message
    function showSearchMessage(count, term, containerSelector) {
        const container = document.querySelector(containerSelector);
        const existingMessage = container.querySelector('.search-message');
        
        if (existingMessage) {
            existingMessage.remove();
        }
        
        if (term.length > 0 && count === 0) {
            const message = document.createElement('div');
            message.className = 'search-message';
            message.style.cssText = `
                padding: 2rem;
                text-align: center;
                color: var(--text-secondary);
                background: rgba(255, 0, 0, 0.1);
                border: 1px solid rgba(255, 0, 0, 0.3);
                border-radius: 12px;
                margin: 2rem 0;
            `;
            message.innerHTML = `
                <h3 style="color: #ff4444; margin-bottom: 0.5rem;">No results found</h3>
                <p>No matches found for "${term}". Try a different search term.</p>
            `;
            container.insertBefore(message, container.firstChild);
        }
    }

    // Smooth scroll for anchor links
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

    // Add animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations
    document.querySelectorAll('.card, .roadmap-section, .faq-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Navigation active state
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // Add particle effect on mouse move
    let particles = [];
    const maxParticles = 50;

    document.addEventListener('mousemove', (e) => {
        if (Math.random() > 0.95) { // Reduced frequency
            createParticle(e.clientX, e.clientY);
        }
    });

    function createParticle(x, y) {
        if (particles.length >= maxParticles) {
            const oldParticle = particles.shift();
            oldParticle.remove();
        }

        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: var(--primary-color);
            border-radius: 50%;
            pointer-events: none;
            left: ${x}px;
            top: ${y}px;
            z-index: 9999;
            opacity: 0.6;
            animation: particleFade 1s ease-out forwards;
        `;
        
        document.body.appendChild(particle);
        particles.push(particle);

        setTimeout(() => {
            particle.remove();
            particles = particles.filter(p => p !== particle);
        }, 1000);
    }

    // Add CSS animation for particles
    if (!document.getElementById('particle-styles')) {
        const style = document.createElement('style');
        style.id = 'particle-styles';
        style.textContent = `
            @keyframes particleFade {
                0% {
                    opacity: 0.6;
                    transform: scale(1) translateY(0);
                }
                100% {
                    opacity: 0;
                    transform: scale(0) translateY(-20px);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Card click animation
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(0, 255, 136, 0.3);
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
                animation: ripple 0.6s ease-out;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Add ripple animation
    if (!document.getElementById('ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            @keyframes ripple {
                0% {
                    transform: scale(0);
                    opacity: 1;
                }
                100% {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Console Easter Egg
    console.log('%c🚀 Welcome to NullSector! 🚀', 'color: #00ff88; font-size: 20px; font-weight: bold;');
    console.log('%cInterested in cybersecurity? Join our Discord!', 'color: #00ccff; font-size: 14px;');
    console.log('%chttps://discord.gg/Tz9Y3wea32', 'color: #00ff88; font-size: 12px;');
});

// Loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Performance optimization - Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized scroll handler
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            // Add scroll effects here if needed
            ticking = false;
        });
        ticking = true;
    }
});
