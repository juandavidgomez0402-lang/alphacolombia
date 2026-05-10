// ===== FAQ INTERACTIVE SCRIPT =====

document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const toggle = item.querySelector('.faq-toggle');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-answer').style.maxHeight = null;
                    otherItem.querySelector('.faq-toggle').textContent = '+';
                }
            });
            
            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
                answer.style.maxHeight = null;
                toggle.textContent = '+';
            } else {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
                toggle.textContent = '−';
            }
        });
    });
});

// Support Modal Functions
function openSupportModal() {
    const modal = document.getElementById('supportModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeSupportModal() {
    const modal = document.getElementById('supportModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore background scrolling
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('supportModal');
    if (event.target == modal) {
        closeSupportModal();
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeSupportModal();
    }
});
