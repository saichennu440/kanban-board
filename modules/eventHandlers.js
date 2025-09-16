/**
 * Event Handlers Module
 * Handles form submission and other UI events
 */

import { DOMUtils } from './domUtils.js';

/**
 * EventHandlers class manages all UI event handling
 */
export class EventHandlers {
  constructor(taskManager) {
    this.taskManager = taskManager;
    this.init();
  }

  /**
   * Initialize event handlers
   */
  init() {
    this.setupFormHandlers();
    this.setupKeyboardHandlers();
    this.setupWindowHandlers();
  }

  /**
   * Setup form event handlers
   */
  setupFormHandlers() {
    const taskForm = DOMUtils.querySelector('#taskForm');
    const titleInput = DOMUtils.querySelector('#taskTitle');
    const descriptionInput = DOMUtils.querySelector('#taskDescription');

    if (!taskForm || !titleInput || !descriptionInput) {
      console.error('Required form elements not found');
      return;
    }

    // Form submission handler
    DOMUtils.addEventListener(taskForm, 'submit', (e) => {
      e.preventDefault();
      this.handleFormSubmission(titleInput, descriptionInput);
    });

    // Real-time validation
    DOMUtils.addEventListener(titleInput, 'input', (e) => {
      this.handleTitleValidation(e.target);
    });

    // Auto-resize textarea
    DOMUtils.addEventListener(descriptionInput, 'input', (e) => {
      this.handleTextareaResize(e.target);
    });

    // Character count for inputs (optional enhancement)
    this.setupCharacterCount(titleInput, 100);
    this.setupCharacterCount(descriptionInput, 500);
  }

  /**
   * Handle form submission
   * @param {HTMLInputElement} titleInput - Title input element
   * @param {HTMLTextAreaElement} descriptionInput - Description input element
   */
  handleFormSubmission(titleInput, descriptionInput) {
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();

    // Validate title
    if (!title) {
      this.showFieldError(titleInput, 'Task title is required');
      titleInput.focus();
      return;
    }

    if (title.length > 100) {
      this.showFieldError(titleInput, 'Task title must be 100 characters or less');
      titleInput.focus();
      return;
    }

    if (description.length > 500) {
      this.showFieldError(descriptionInput, 'Description must be 500 characters or less');
      descriptionInput.focus();
      return;
    }

    try {
      // Create the task
      const task = this.taskManager.createTask(title, description);
      
      // Clear form
      this.clearForm(titleInput, descriptionInput);
      
      // Clear any previous errors
      this.clearFieldErrors();
      
      // Show success feedback
      this.showSuccessMessage(`Task "${task.title}" created successfully!`);
      
      // Focus back to title input for quick task creation
      titleInput.focus();

    } catch (error) {
      console.error('Error creating task:', error);
      this.showFieldError(titleInput, error.message || 'Failed to create task');
    }
  }

  /**
   * Handle title validation
   * @param {HTMLInputElement} input - Title input element
   */
  handleTitleValidation(input) {
    const value = input.value;
    
    // Clear previous errors
    this.clearFieldError(input);
    
    // Validate length
    if (value.length > 100) {
      this.showFieldError(input, 'Title must be 100 characters or less');
    }
  }

  /**
   * Handle textarea auto-resize
   * @param {HTMLTextAreaElement} textarea - Textarea element
   */
  handleTextareaResize(textarea) {
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Set height to scrollHeight, with min and max constraints
    const minHeight = 60; // Minimum height in pixels
    const maxHeight = 200; // Maximum height in pixels
    const scrollHeight = textarea.scrollHeight;
    
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
    textarea.style.height = newHeight + 'px';
    
    // Add scrollbar if content exceeds max height
    if (scrollHeight > maxHeight) {
      textarea.style.overflowY = 'auto';
    } else {
      textarea.style.overflowY = 'hidden';
    }
  }

  /**
   * Setup character count display for inputs
   * @param {HTMLElement} input - Input element
   * @param {number} maxLength - Maximum character length
   */
  setupCharacterCount(input, maxLength) {
    // Create character count element
    const countElement = DOMUtils.createElement('div', 'character-count', {
      style: 'font-size: 0.75rem; color: #64748B; text-align: right; margin-top: 4px;'
    });
    
    // Insert after input
    input.parentNode.appendChild(countElement);
    
    // Update count function
    const updateCount = () => {
      const current = input.value.length;
      const remaining = maxLength - current;
      countElement.textContent = `${current}/${maxLength}`;
      
      // Change color based on remaining characters
      if (remaining < 20) {
        countElement.style.color = '#EF4444'; // Red
      } else if (remaining < 50) {
        countElement.style.color = '#F59E0B'; // Orange
      } else {
        countElement.style.color = '#64748B'; // Gray
      }
    };
    
    // Initial update
    updateCount();
    
    // Update on input
    DOMUtils.addEventListener(input, 'input', updateCount);
  }

  /**
   * Setup keyboard shortcuts and handlers
   */
  setupKeyboardHandlers() {
    // Global keyboard shortcuts
    DOMUtils.addEventListener(document, 'keydown', (e) => {
      // Ctrl/Cmd + Enter to submit form from anywhere
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const titleInput = DOMUtils.querySelector('#taskTitle');
        if (document.activeElement === titleInput || 
            document.activeElement === DOMUtils.querySelector('#taskDescription')) {
          e.preventDefault();
          DOMUtils.querySelector('#taskForm').dispatchEvent(new Event('submit'));
        }
      }
      
      // Escape to clear form
      if (e.key === 'Escape') {
        this.clearForm();
        this.clearFieldErrors();
      }
    });
  }

  /**
   * Setup window event handlers
   */
  setupWindowHandlers() {
    // Handle page visibility changes to sync data
    DOMUtils.addEventListener(document, 'visibilitychange', () => {
      if (!document.hidden) {
        // Reload tasks when page becomes visible (in case of multiple tabs)
        this.taskManager.loadTasks();
        this.taskManager.renderAllTasks();
        this.taskManager.updateTaskCounts();
      }
    });

    // Handle page unload to save any pending changes
    DOMUtils.addEventListener(window, 'beforeunload', () => {
      this.taskManager.saveTasks();
    });

    // Handle resize for responsive design
    let resizeTimer;
    DOMUtils.addEventListener(window, 'resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Trigger any resize-specific updates
        this.handleWindowResize();
      }, 250);
    });
  }

  /**
   * Handle window resize events
   */
  handleWindowResize() {
    // Update any responsive elements or recalculate positions
    console.log('Window resized, updating layout...');
  }

  /**
   * Clear the task form
   * @param {HTMLInputElement} titleInput - Title input (optional)
   * @param {HTMLTextAreaElement} descriptionInput - Description input (optional)
   */
  clearForm(titleInput, descriptionInput) {
    const title = titleInput || DOMUtils.querySelector('#taskTitle');
    const description = descriptionInput || DOMUtils.querySelector('#taskDescription');
    
    if (title) {
      title.value = '';
      title.style.height = 'auto';
    }
    
    if (description) {
      description.value = '';
      description.style.height = 'auto';
    }
  }

  /**
   * Show field error message
   * @param {HTMLElement} field - Input field element
   * @param {string} message - Error message
   */
  showFieldError(field, message) {
    // Clear existing error
    this.clearFieldError(field);
    
    // Add error class
    field.classList.add('error');
    field.style.borderColor = '#EF4444';
    
    // Create error message element
    const errorElement = DOMUtils.createElement('div', 'field-error', {
      style: 'color: #EF4444; font-size: 0.75rem; margin-top: 4px;'
    });
    errorElement.textContent = message;
    
    // Insert after field
    field.parentNode.appendChild(errorElement);
  }

  /**
   * Clear field error
   * @param {HTMLElement} field - Input field element
   */
  clearFieldError(field) {
    field.classList.remove('error');
    field.style.borderColor = '';
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
  }

  /**
   * Clear all field errors
   */
  clearFieldErrors() {
    const errorFields = DOMUtils.querySelectorAll('.error');
    errorFields.forEach(field => this.clearFieldError(field));
  }

  /**
   * Show success message
   * @param {string} message - Success message
   */
  showSuccessMessage(message) {
    // Create success notification
    const notification = DOMUtils.createElement('div', 'success-notification', {
      style: `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10B981;
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
      `
    });
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 3000);
  }
}

// Make EventHandlers available globally
window.KanbanEventHandlers = EventHandlers;