/**
 * Main Application Entry Point
 * Orchestrates the initialization of all Kanban board modules
 */

import { Storage } from './modules/storage.js';
import { DOMUtils } from './modules/domUtils.js';
import { TaskManager } from './modules/taskManager.js';
import { DragDrop } from './modules/dragDrop.js';
import { EventHandlers } from './modules/eventHandlers.js';

/**
 * KanbanApp class - Main application orchestrator
 */
class KanbanApp {
  constructor() {
    this.taskManager = null;
    this.dragDrop = null;
    this.eventHandlers = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the Kanban application
   */
  async init() {
    try {
      console.log('Initializing Kanban Board Application...');

      // Check for localStorage availability
      if (!Storage.isAvailable()) {
        this.showStorageWarning();
      }

      // Wait for DOM to be ready
      await this.waitForDOM();

      // Initialize core modules in proper order
      this.initializeTaskManager();
      this.initializeDragDrop();
      this.initializeEventHandlers();

      // Setup module connections
      this.connectModules();

      // Setup error handling
      this.setupErrorHandling();

      // Setup performance monitoring (optional)
      this.setupPerformanceMonitoring();

      this.isInitialized = true;
      console.log('Kanban Board Application initialized successfully!');

      // Dispatch custom event for extensibility
      this.dispatchAppReady();

    } catch (error) {
      console.error('Failed to initialize Kanban Board Application:', error);
      this.handleInitializationError(error);
    }
  }

  /**
   * Wait for DOM to be fully loaded
   * @returns {Promise} Promise that resolves when DOM is ready
   */
  waitForDOM() {
    return new Promise((resolve) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve();
      }
    });
  }

  /**
   * Initialize Task Manager module
   */
  initializeTaskManager() {
    console.log('Initializing Task Manager...');
    this.taskManager = new TaskManager();
  }

  /**
   * Initialize Drag and Drop module
   */
  initializeDragDrop() {
    console.log('Initializing Drag and Drop...');
    this.dragDrop = new DragDrop(this.taskManager);
  }

  /**
   * Initialize Event Handlers module
   */
  initializeEventHandlers() {
    console.log('Initializing Event Handlers...');
    this.eventHandlers = new EventHandlers(this.taskManager);
  }

  /**
   * Connect modules with cross-dependencies
   */
  connectModules() {
    // Connect DragDrop to TaskManager
    this.taskManager.setDragDrop(this.dragDrop);
    
    console.log('Modules connected successfully');
  }

  /**
   * Setup global error handling
   */
  setupErrorHandling() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      console.error('Uncaught error:', event.error);
      this.handleRuntimeError(event.error);
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.handleRuntimeError(event.reason);
    });
  }

  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor performance metrics
    if ('performance' in window && 'mark' in window.performance) {
      window.performance.mark('kanban-app-initialized');
      
      // Log performance timing
      window.addEventListener('load', () => {
        const timing = window.performance.getEntriesByType('navigation')[0];
        console.log(`App load time: ${timing.loadEventEnd - timing.fetchStart}ms`);
      });
    }
  }

  /**
   * Dispatch custom app ready event
   */
  dispatchAppReady() {
    const appReadyEvent = new CustomEvent('kanbanAppReady', {
      detail: {
        taskManager: this.taskManager,
        dragDrop: this.dragDrop,
        eventHandlers: this.eventHandlers
      }
    });
    
    document.dispatchEvent(appReadyEvent);
  }

  /**
   * Handle initialization errors
   * @param {Error} error - The error that occurred
   */
  handleInitializationError(error) {
    // Create user-friendly error message
    const errorContainer = DOMUtils.createElement('div', 'error-container', {
      style: `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        color: white;
        font-family: system-ui;
      `
    });

    const errorMessage = DOMUtils.createElement('div', 'error-message', {
      style: `
        background: #EF4444;
        padding: 2rem;
        border-radius: 8px;
        max-width: 500px;
        text-align: center;
      `
    });

    errorMessage.innerHTML = `
      <h2>Application Failed to Load</h2>
      <p>We're sorry, but there was an error loading the Kanban Board application.</p>
      <p><strong>Error:</strong> ${error.message}</p>
      <button onclick="window.location.reload()" 
              style="background: white; color: #EF4444; border: none; padding: 8px 16px; 
                     border-radius: 4px; margin-top: 1rem; cursor: pointer;">
        Reload Page
      </button>
    `;

    errorContainer.appendChild(errorMessage);
    document.body.appendChild(errorContainer);
  }

  /**
   * Handle runtime errors
   * @param {Error} error - The error that occurred
   */
  handleRuntimeError(error) {
    // Log error for debugging
    console.error('Runtime error in Kanban App:', error);
    
    // Show user-friendly notification (could be enhanced with a proper notification system)
    if (this.eventHandlers && this.eventHandlers.showSuccessMessage) {
      // Reuse the notification system for errors
      const notification = DOMUtils.createElement('div', 'error-notification', {
        style: `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #EF4444;
          color: white;
          padding: 16px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          max-width: 300px;
        `
      });
      
      notification.innerHTML = `
        <strong>Error:</strong> Something went wrong.<br>
        <small>${error.message || 'Unknown error occurred'}</small>
      `;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 5000);
    }
  }

  /**
   * Show localStorage warning if not available
   */
  showStorageWarning() {
    console.warn('localStorage is not available. Tasks will not persist between sessions.');
    
    // Show warning to user
    const warningElement = DOMUtils.createElement('div', 'storage-warning', {
      style: `
        background: #F59E0B;
        color: white;
        padding: 1rem;
        text-align: center;
        margin-bottom: 1rem;
        border-radius: 8px;
      `
    });
    
    warningElement.innerHTML = `
      <strong>Warning:</strong> Local storage is not available. 
      Your tasks will not be saved between browser sessions.
    `;
    
    // Insert at the top of the container
    const container = DOMUtils.querySelector('.container');
    if (container) {
      container.insertBefore(warningElement, container.firstChild);
    }
  }

  /**
   * Get application status
   * @returns {Object} Application status information
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      taskCount: this.taskManager ? this.taskManager.getTotalTaskCount() : 0,
      storageAvailable: Storage.isAvailable(),
      modules: {
        taskManager: !!this.taskManager,
        dragDrop: !!this.dragDrop,
        eventHandlers: !!this.eventHandlers
      }
    };
  }

  /**
   * Destroy the application and clean up resources
   */
  destroy() {
    console.log('Destroying Kanban Application...');
    
    // Clean up modules (if they have cleanup methods)
    if (this.dragDrop && typeof this.dragDrop.destroy === 'function') {
      this.dragDrop.destroy();
    }
    
    // Clear references
    this.taskManager = null;
    this.dragDrop = null;
    this.eventHandlers = null;
    this.isInitialized = false;
    
    console.log('Kanban Application destroyed');
  }
}

/**
 * Initialize the application when script loads
 */
const app = new KanbanApp();

// Start the application
app.init().catch(error => {
  console.error('Failed to start Kanban application:', error);
});

// Make app instance available globally for debugging and extensibility
window.KanbanApp = app;

// Export for potential module usage
export default KanbanApp;