/**
 * Task Manager Module
 * Handles task creation, rendering, updating, and deletion
 */

import { DOMUtils } from './domUtils.js';
import { Storage } from './storage.js';

/**
 * TaskManager class handles all task-related operations
 */
export class TaskManager {
  constructor() {
    this.tasks = [];
    this.dragDrop = null; // Will be set by main.js
    this.init();
  }

  /**
   * Initialize task manager
   */
  init() {
    this.loadTasks();
    this.renderAllTasks();
    this.updateTaskCounts();
  }

  /**
   * Set drag and drop handler
   * @param {DragDrop} dragDrop - DragDrop instance
   */
  setDragDrop(dragDrop) {
    this.dragDrop = dragDrop;
  }

  /**
   * Load tasks from storage
   */
  loadTasks() {
    this.tasks = Storage.loadTasks();
    console.log('Loaded tasks:', this.tasks);
  }

  /**
   * Save tasks to storage
   */
  saveTasks() {
    Storage.saveTasks(this.tasks);
    console.log('Tasks saved:', this.tasks);
  }

  /**
   * Create a new task
   * @param {string} title - Task title
   * @param {string} description - Task description
   * @returns {Object} Created task object
   */
  createTask(title, description) {
    if (!title.trim()) {
      throw new Error('Task title is required');
    }

    const task = {
      id: DOMUtils.generateUniqueId('task'),
      title: title.trim(),
      description: description.trim(),
      status: 'todo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.tasks.push(task);
    this.saveTasks();
    this.renderTask(task);
    this.updateTaskCounts();

    console.log('Task created:', task);
    return task;
  }

  /**
   * Update task status
   * @param {string} taskId - Task ID
   * @param {string} newStatus - New status (todo, inprogress, done)
   */
  updateTaskStatus(taskId, newStatus) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) {
      console.error('Task not found:', taskId);
      return;
    }

    const oldStatus = task.status;
    task.status = newStatus;
    task.updatedAt = new Date().toISOString();

    this.saveTasks();
    this.updateTaskCounts();

    console.log(`Task ${taskId} moved from ${oldStatus} to ${newStatus}`);
  }

  /**
   * Move task to specific position within a column
   * @param {string} taskId - Task ID
   * @param {string} status - Target status
   * @param {number} position - Target position
   */
  moveTaskToPosition(taskId, status, position) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Remove task from tasks array
    const taskIndex = this.tasks.indexOf(task);
    this.tasks.splice(taskIndex, 1);

    // Find tasks with the same status
    const statusTasks = this.tasks.filter(t => t.status === status);
    const otherTasks = this.tasks.filter(t => t.status !== status);

    // Insert at specific position
    if (position >= 0 && position <= statusTasks.length) {
      statusTasks.splice(position, 0, task);
    } else {
      statusTasks.push(task);
    }

    // Rebuild tasks array maintaining order
    this.tasks = [...otherTasks, ...statusTasks];
    this.saveTasks();
    this.renderAllTasks();
  }

  /**
   * Delete a task
   * @param {string} taskId - Task ID to delete
   */
  deleteTask(taskId) {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      console.error('Task not found for deletion:', taskId);
      return;
    }

    // Remove from tasks array
    this.tasks.splice(taskIndex, 1);
    this.saveTasks();

    // Remove from DOM
    const taskElement = DOMUtils.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
      taskElement.remove();
    }

    this.updateTaskCounts();
    console.log('Task deleted:', taskId);
  }

  /**
   * Render a single task
   * @param {Object} task - Task object to render
   * @returns {HTMLElement} Task card element
   */
  renderTask(task) {
    const taskCard = this.createTaskElement(task);
    const targetColumn = DOMUtils.querySelector(`#${task.status}Column`);
    
    if (targetColumn) {
      targetColumn.appendChild(taskCard);
    }

    return taskCard;
  }

  /**
   * Create task DOM element
   * @param {Object} task - Task object
   * @returns {HTMLElement} Task card element
   */
  createTaskElement(task) {
    // Main task card container
    const taskCard = DOMUtils.createElement('div', 'task-card', {
      'data-task-id': task.id
    });

    // Task title
    const title = DOMUtils.createElement('h3');
    title.textContent = DOMUtils.truncateText(task.title, 60);

    // Task description
    const description = DOMUtils.createElement('p');
    description.textContent = task.description || 'No description';

    // Task metadata
    const taskMeta = DOMUtils.createElement('div', 'task-meta');

    // Task ID display
    const taskId = DOMUtils.createElement('span', 'task-id');
    taskId.textContent = `#${task.id.split('_')[1] || task.id.substring(0, 8)}`;

    // Delete button
    const deleteBtn = DOMUtils.createElement('button', 'delete-btn');
    deleteBtn.textContent = 'Delete';
    deleteBtn.title = 'Delete this task';

    // Delete button event listener
    DOMUtils.addEventListener(deleteBtn, 'click', (e) => {
      e.stopPropagation();
      this.handleDeleteTask(task.id);
    });

    // Assemble task card
    taskMeta.appendChild(taskId);
    taskMeta.appendChild(deleteBtn);
    
    taskCard.appendChild(title);
    taskCard.appendChild(description);
    taskCard.appendChild(taskMeta);

    // Make task draggable
    if (this.dragDrop) {
      this.dragDrop.makeTaskDraggable(taskCard, task);
    }

    return taskCard;
  }

  /**
   * Handle task deletion with confirmation
   * @param {string} taskId - Task ID to delete
   */
  handleDeleteTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    const confirmDelete = confirm(`Are you sure you want to delete "${task.title}"?`);
    if (confirmDelete) {
      this.deleteTask(taskId);
    }
  }

  /**
   * Render all tasks
   */
  renderAllTasks() {
    // Clear all columns
    const columns = ['todoColumn', 'inprogressColumn', 'doneColumn'];
    columns.forEach(columnId => {
      const column = DOMUtils.querySelector(`#${columnId}`);
      if (column) {
        column.innerHTML = '';
      }
    });

    // Render tasks
    this.tasks.forEach(task => {
      this.renderTask(task);
    });

    // Add empty state messages
    this.addEmptyStateMessages();
  }

  /**
   * Add empty state messages to empty columns
   */
  addEmptyStateMessages() {
    const columnMappings = {
      'todoColumn': 'todo',
      'inprogressColumn': 'inprogress',
      'doneColumn': 'done'
    };

    Object.entries(columnMappings).forEach(([columnId, status]) => {
      const column = DOMUtils.querySelector(`#${columnId}`);
      if (!column) return;

      const hasTasksInStatus = this.tasks.some(task => task.status === status);
      
      if (!hasTasksInStatus) {
        const emptyState = DOMUtils.createElement('div', 'empty-state');
        emptyState.textContent = 'No tasks yet. Drag tasks here or create new ones.';
        column.appendChild(emptyState);
      }
    });
  }

  /**
   * Update task counts in column headers
   */
  updateTaskCounts() {
    const counts = {
      todo: this.tasks.filter(t => t.status === 'todo').length,
      inprogress: this.tasks.filter(t => t.status === 'inprogress').length,
      done: this.tasks.filter(t => t.status === 'done').length
    };

    // Update count displays
    const todoCount = DOMUtils.querySelector('#todoCount');
    const inprogressCount = DOMUtils.querySelector('#inprogressCount');
    const doneCount = DOMUtils.querySelector('#doneCount');

    if (todoCount) todoCount.textContent = counts.todo;
    if (inprogressCount) inprogressCount.textContent = counts.inprogress;
    if (doneCount) doneCount.textContent = counts.done;
  }

  /**
   * Get tasks by status
   * @param {string} status - Status to filter by
   * @returns {Array} Filtered tasks
   */
  getTasksByStatus(status) {
    return this.tasks.filter(task => task.status === status);
  }

  /**
   * Get total task count
   * @returns {number} Total number of tasks
   */
  getTotalTaskCount() {
    return this.tasks.length;
  }

  /**
   * Search tasks by title or description
   * @param {string} query - Search query
   * @returns {Array} Matching tasks
   */
  searchTasks(query) {
    if (!query.trim()) return this.tasks;

    const lowercaseQuery = query.toLowerCase();
    return this.tasks.filter(task => 
      task.title.toLowerCase().includes(lowercaseQuery) ||
      task.description.toLowerCase().includes(lowercaseQuery)
    );
  }
}

// Make TaskManager available globally
window.KanbanTaskManager = TaskManager;