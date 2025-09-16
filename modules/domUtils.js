/**
 * DOM Utilities Module
 * Reusable helper functions for DOM manipulation and element creation
 */

/**
 * DOM utility class with helper methods
 */
export class DOMUtils {
  /**
   * Create an element with specified tag, classes, and attributes
   * @param {string} tag - HTML tag name
   * @param {string|Array} classes - CSS class(es) to add
   * @param {Object} attributes - Key-value pairs of attributes to set
   * @returns {HTMLElement} Created element
   */
  static createElement(tag, classes = [], attributes = {}) {
    const element = document.createElement(tag);
    
    // Add classes
    if (typeof classes === 'string') {
      element.classList.add(classes);
    } else if (Array.isArray(classes)) {
      element.classList.add(...classes);
    }
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    
    return element;
  }

  /**
   * Safely query selector with error handling
   * @param {string} selector - CSS selector
   * @param {Element} parent - Parent element to search within (optional)
   * @returns {Element|null} Found element or null
   */
  static querySelector(selector, parent = document) {
    try {
      return parent.querySelector(selector);
    } catch (error) {
      console.error(`Error selecting element with selector "${selector}":`, error);
      return null;
    }
  }

  /**
   * Safely query all selectors with error handling
   * @param {string} selector - CSS selector
   * @param {Element} parent - Parent element to search within (optional)
   * @returns {NodeList} NodeList of found elements
   */
  static querySelectorAll(selector, parent = document) {
    try {
      return parent.querySelectorAll(selector);
    } catch (error) {
      console.error(`Error selecting elements with selector "${selector}":`, error);
      return [];
    }
  }

  /**
   * Add event listener with error handling
   * @param {Element} element - Element to attach listener to
   * @param {string} event - Event type
   * @param {Function} handler - Event handler function
   * @param {boolean|Object} options - Event listener options
   */
  static addEventListener(element, event, handler, options = false) {
    if (!element || typeof handler !== 'function') {
      console.error('Invalid element or handler provided to addEventListener');
      return;
    }

    try {
      element.addEventListener(event, handler, options);
    } catch (error) {
      console.error(`Error adding event listener for "${event}":`, error);
    }
  }

  /**
   * Remove event listener with error handling
   * @param {Element} element - Element to remove listener from
   * @param {string} event - Event type
   * @param {Function} handler - Event handler function
   */
  static removeEventListener(element, event, handler) {
    if (!element || typeof handler !== 'function') {
      console.error('Invalid element or handler provided to removeEventListener');
      return;
    }

    try {
      element.removeEventListener(event, handler);
    } catch (error) {
      console.error(`Error removing event listener for "${event}":`, error);
    }
  }

  /**
   * Sanitize HTML content to prevent XSS attacks
   * @param {string} html - HTML content to sanitize
   * @returns {string} Sanitized HTML content
   */
  static sanitizeHTML(html) {
    if (typeof html !== 'string') return '';
    
    // Create a temporary element to use browser's HTML parsing
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
  }

  /**
   * Truncate text to specified length
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @param {string} suffix - Suffix to add when truncated
   * @returns {string} Truncated text
   */
  static truncateText(text, maxLength, suffix = '...') {
    if (typeof text !== 'string' || text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Generate a unique ID for elements
   * @param {string} prefix - Prefix for the ID
   * @returns {string} Unique ID
   */
  static generateUniqueId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Show/hide elements with smooth transitions
   * @param {Element} element - Element to show/hide
   * @param {boolean} show - Whether to show or hide
   * @param {number} duration - Animation duration in milliseconds
   */
  static toggleVisibility(element, show, duration = 300) {
    if (!element) return;

    if (show) {
      element.style.display = 'block';
      element.style.opacity = '0';
      element.style.transition = `opacity ${duration}ms ease`;
      
      // Force reflow
      element.offsetHeight;
      
      element.style.opacity = '1';
    } else {
      element.style.transition = `opacity ${duration}ms ease`;
      element.style.opacity = '0';
      
      setTimeout(() => {
        if (element.style.opacity === '0') {
          element.style.display = 'none';
        }
      }, duration);
    }
  }
}

// Make DOMUtils available globally for other modules
window.KanbanDOMUtils = DOMUtils;