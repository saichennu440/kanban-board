/**
 * Drag and Drop Module
 * Handles all drag and drop functionality for the Kanban board
 */

import { DOMUtils } from './domUtils.js';

/**
 * DragDrop class manages drag and drop operations for task cards
 */
export class DragDrop {
  constructor(taskManager) {
    this.taskManager = taskManager;
    this.draggedElement = null;
    this.placeholder = null;
    this.init();
  }

  /**
   * Initialize drag and drop event listeners
   */
  init() {
    this.setupGlobalEventListeners();
  }

  /**
   * Setup global event listeners for drag and drop
   */
  setupGlobalEventListeners() {
    // Handle drag over for columns
    DOMUtils.addEventListener(document, 'dragover', (e) => {
      e.preventDefault();
      this.handleDragOver(e);
    });

    // Handle drop events
    DOMUtils.addEventListener(document, 'drop', (e) => {
      e.preventDefault();
      this.handleDrop(e);
    });

    // Clean up drag state on drag end
    DOMUtils.addEventListener(document, 'dragend', (e) => {
      this.handleDragEnd(e);
    });
  }

  /**
   * Make a task card draggable
   * @param {HTMLElement} taskCard - Task card element to make draggable
   * @param {Object} taskData - Task data object
   */
  makeTaskDraggable(taskCard, taskData) {
    taskCard.setAttribute('draggable', 'true');
    taskCard.dataset.taskId = taskData.id;

    // Drag start event
    DOMUtils.addEventListener(taskCard, 'dragstart', (e) => {
      this.handleDragStart(e, taskCard, taskData);
    });

    // Visual feedback on drag enter/leave
    DOMUtils.addEventListener(taskCard, 'dragenter', (e) => {
      if (e.target !== this.draggedElement) {
        e.target.classList.add('drag-over');
      }
    });

    DOMUtils.addEventListener(taskCard, 'dragleave', (e) => {
      e.target.classList.remove('drag-over');
    });
  }

  /**
   * Handle drag start event
   * @param {DragEvent} e - Drag event
   * @param {HTMLElement} taskCard - Task card being dragged
   * @param {Object} taskData - Task data
   */
  handleDragStart(e, taskCard, taskData) {
    this.draggedElement = taskCard;
    taskCard.classList.add('dragging');

    // Set drag data
    e.dataTransfer.setData('text/plain', taskData.id);
    e.dataTransfer.effectAllowed = 'move';

    // Create visual placeholder
    this.createPlaceholder();

    console.log('Drag started for task:', taskData.id);
  }

  /**
   * Handle drag over event
   * @param {DragEvent} e - Drag event
   */
  handleDragOver(e) {
    if (!this.draggedElement) return;

    const column = e.target.closest('.column');
    if (!column) return;

    // Add visual feedback to column
    column.classList.add('drag-over');

    // Remove drag-over class from other columns
    DOMUtils.querySelectorAll('.column').forEach(col => {
      if (col !== column) {
        col.classList.remove('drag-over');
      }
    });

    // Handle insertion point within column
    this.handleInsertionPoint(e, column);
  }

  /**
   * Handle insertion point within column for better UX
   * @param {DragEvent} e - Drag event
   * @param {HTMLElement} column - Target column
   */
  handleInsertionPoint(e, column) {
    const columnContent = column.querySelector('.column-content');
    if (!columnContent) return;

    const taskCards = Array.from(columnContent.querySelectorAll('.task-card:not(.dragging)'));
    const mouseY = e.clientY;

    let insertAfter = null;

    for (let i = 0; i < taskCards.length; i++) {
      const card = taskCards[i];
      const rect = card.getBoundingClientRect();
      const cardMiddle = rect.top + rect.height / 2;

      if (mouseY > cardMiddle) {
        insertAfter = card;
      } else {
        break;
      }
    }

    // Update placeholder position
    this.updatePlaceholderPosition(columnContent, insertAfter);
  }

  /**
   * Create visual placeholder for drag operation
   */
  createPlaceholder() {
    if (this.placeholder) {
      this.placeholder.remove();
    }

    this.placeholder = DOMUtils.createElement('div', 'task-card-placeholder', {
      style: 'height: 80px; border: 2px dashed #3B82F6; background: rgba(59, 130, 246, 0.1); margin-bottom: 16px; border-radius: 8px;'
    });
  }

  /**
   * Update placeholder position
   * @param {HTMLElement} columnContent - Column content element
   * @param {HTMLElement} insertAfter - Element to insert after
   */
  updatePlaceholderPosition(columnContent, insertAfter) {
    if (!this.placeholder) return;

    // Remove placeholder from current position
    if (this.placeholder.parentNode) {
      this.placeholder.remove();
    }

    // Insert placeholder at new position
    if (insertAfter) {
      insertAfter.insertAdjacentElement('afterend', this.placeholder);
    } else {
      columnContent.insertBefore(this.placeholder, columnContent.firstChild);
    }
  }

  /**
   * Handle drop event
   * @param {DragEvent} e - Drop event
   */
  handleDrop(e) {
    if (!this.draggedElement) return;

    const column = e.target.closest('.column');
    if (!column) return;

    const newStatus = column.dataset.status;
    const taskId = e.dataTransfer.getData('text/plain');

    console.log(`Dropping task ${taskId} into ${newStatus} column`);

    // Update task status and move element
    if (this.taskManager) {
      this.taskManager.updateTaskStatus(taskId, newStatus);
      
      // Determine insertion position
      const insertionIndex = this.getInsertionIndex(column);
      this.taskManager.moveTaskToPosition(taskId, newStatus, insertionIndex);
    }

    // Clean up drag state
    this.cleanupDragState();
  }

  /**
   * Get insertion index based on placeholder position
   * @param {HTMLElement} column - Target column
   * @returns {number} Insertion index
   */
  getInsertionIndex(column) {
    if (!this.placeholder || !this.placeholder.parentNode) return -1;

    const columnContent = column.querySelector('.column-content');
    const children = Array.from(columnContent.children);
    
    return children.indexOf(this.placeholder);
  }

  /**
   * Handle drag end event
   * @param {DragEvent} e - Drag event
   */
  handleDragEnd(e) {
    this.cleanupDragState();
  }

  /**
   * Clean up drag state and visual feedback
   */
  cleanupDragState() {
    // Remove dragging class from all elements
    DOMUtils.querySelectorAll('.dragging').forEach(el => {
      el.classList.remove('dragging');
    });

    // Remove drag-over class from all columns
    DOMUtils.querySelectorAll('.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });

    // Remove placeholder
    if (this.placeholder && this.placeholder.parentNode) {
      this.placeholder.remove();
    }

    // Reset drag state
    this.draggedElement = null;
    this.placeholder = null;
  }
}

// Make DragDrop available globally
window.KanbanDragDrop = DragDrop;