// app.js — Bear Todo App

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let todos = [];
let currentFilter = 'All';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------------------------------------------------------------------------
// Bear Face SVG
// ---------------------------------------------------------------------------

function bearFaceSVG(checked) {
  const eyes = checked
    ? `<path d="M9 11 Q11 9 13 11" stroke="#5c3d2e" stroke-width="1.5" fill="none"/>
       <path d="M17 11 Q19 9 21 11" stroke="#5c3d2e" stroke-width="1.5" fill="none"/>`
    : `<circle cx="11" cy="11" r="1.5" fill="#5c3d2e"/>
       <circle cx="19" cy="11" r="1.5" fill="#5c3d2e"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="28" height="28">
    <circle cx="6"  cy="6"  r="5" fill="#c49a6c"/>
    <circle cx="24" cy="6"  r="5" fill="#c49a6c"/>
    <circle cx="15" cy="16" r="13" fill="#e8c49a"/>
    ${eyes}
    <ellipse cx="15" cy="16" rx="3" ry="2" fill="#5c3d2e"/>
  </svg>`;
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

function saveTodos() {
  try {
    localStorage.setItem('bear-todos', JSON.stringify(todos));
  } catch (e) {
    // silently fail — in-memory state stays correct
  }
}

function loadTodos() {
  try {
    const raw = localStorage.getItem('bear-todos');
    todos = raw ? JSON.parse(raw) : [];
  } catch (e) {
    todos = [];
  }
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function renderTodos() {
  const list = document.getElementById('todo-list');
  list.innerHTML = '';

  const visible = todos.filter(function(todo) {
    if (currentFilter === 'Active')    return !todo.completed;
    if (currentFilter === 'Completed') return  todo.completed;
    return true;
  });

  if (visible.length === 0) {
    list.innerHTML = '<li class="todo-list__empty">No todos yet! 🐻</li>';
  } else {
    visible.forEach(function(todo) {
      const li = document.createElement('li');
      li.className = 'todo-item' + (todo.completed ? ' done' : '');
      li.dataset.id = todo.id;
      li.innerHTML =
        '<button class="bear-checkbox" aria-label="' + (todo.completed ? 'Mark incomplete' : 'Mark complete') + '">' +
          bearFaceSVG(todo.completed) +
        '</button>' +
        '<span class="todo-item__label">' + escapeHtml(todo.title) + '</span>' +
        '<button class="todo-item__delete" aria-label="Delete todo">✕</button>';
      list.appendChild(li);
    });
  }

  // sync filter buttons
  document.querySelectorAll('.filter-bar__btn').forEach(function(btn) {
    btn.classList.toggle('filter-bar__btn--active', btn.dataset.filter === currentFilter);
  });
}

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

function addTodo() {
  const input = document.getElementById('todo-input');
  const trimmed = input.value.trim();
  if (!trimmed || trimmed.length > 200) return;
  todos.push({ id: generateId(), title: trimmed, completed: false });
  saveTodos();
  renderTodos();
  input.value = '';
}

function toggleTodo(id) {
  const todo = todos.find(function(t) { return t.id === id; });
  if (!todo) return;
  todo.completed = !todo.completed;
  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  const idx = todos.findIndex(function(t) { return t.id === id; });
  if (idx === -1) return;
  todos.splice(idx, 1);
  saveTodos();
  renderTodos();
}

// ---------------------------------------------------------------------------
// Event wiring — runs after DOM is ready (script has defer attribute)
// ---------------------------------------------------------------------------

document.getElementById('add-btn').addEventListener('click', addTodo);

document.getElementById('todo-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') addTodo();
});

document.getElementById('todo-list').addEventListener('click', function(e) {
  const li = e.target.closest('.todo-item');
  if (!li) return;
  const id = li.dataset.id;
  if (e.target.closest('.bear-checkbox')) {
    toggleTodo(id);
  } else if (e.target.closest('.todo-item__delete')) {
    deleteTodo(id);
  }
});

document.querySelectorAll('.filter-bar__btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    currentFilter = btn.dataset.filter;
    renderTodos();
  });
});

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

loadTodos();
renderTodos();
