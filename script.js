const form = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const planningList = document.getElementById('planning-list');
const filter = document.getElementById('filter-tasks');
const dateInput = document.getElementById('task-date');
const storedTasks = localStorage.getItem('campusTasks');
let tasks = storedTasks ? JSON.parse(storedTasks) : [];

const dateLabel = document.getElementById('today-date');
if (dateLabel) {
    dateLabel.textContent = new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long'
    }).format(new Date());
}

function saveTasks() {
    localStorage.setItem('campusTasks', JSON.stringify(tasks));
}

function formatDate(date) {
    return new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
}

function updateSummary() {
    const todoCount = document.getElementById('todo-count');
    const doneCount = document.getElementById('done-count');
    if (todoCount) {
        todoCount.textContent = tasks.filter(function (task) { return !task.done; }).length;
    }
    if (doneCount) {
        doneCount.textContent = tasks.filter(function (task) { return task.done; }).length;
    }

    const upcoming = tasks.filter(function (task) { return !task.done && task.date; })
        .sort(function (a, b) { return a.date.localeCompare(b.date); });
    const nextTitle = document.getElementById('next-title');
    const nextDate = document.getElementById('next-date');
    if (nextTitle) {
        nextTitle.textContent = upcoming.length ? upcoming[0].title : 'Aucune échéance pour le moment.';
    }
    if (nextDate) {
        nextDate.textContent = upcoming.length ? formatDate(upcoming[0].date) : '';
    }

    if (planningList) {
        planningList.innerHTML = '';
        const today = new Date().toISOString().slice(0, 10);
        const futureTasks = upcoming.filter(function (task) { return task.date >= today; });
        document.getElementById('planning-empty').style.display = futureTasks.length ? 'none' : 'block';
        futureTasks.forEach(function (task) {
            const row = document.createElement('div');
            row.className = 'planning-row';
            const title = document.createElement('p');
            title.className = 'task-name';
            title.textContent = task.title + (task.course ? ' · ' + task.course : '');
            const date = document.createElement('span');
            date.className = 'planning-date';
            date.textContent = formatDate(task.date);
            row.append(title, date);
            planningList.appendChild(row);
        });
    }
}

function displayTasks() {
    if (!taskList || !filter) return;
    taskList.innerHTML = '';
    let shownTasks = tasks;

    if (filter.value === 'todo') {
        shownTasks = tasks.filter(function (task) { return !task.done; });
    }
    if (filter.value === 'done') {
        shownTasks = tasks.filter(function (task) { return task.done; });
    }

    document.getElementById('empty-message').style.display = shownTasks.length ? 'none' : 'block';
    shownTasks.forEach(function (task) {
        const row = document.createElement('div');
        row.className = 'task-row' + (task.done ? ' is-done' : '');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-check';
        checkbox.checked = task.done;
        checkbox.setAttribute('aria-label', 'Marquer ' + task.title + ' comme terminée');
        checkbox.addEventListener('change', function () {
            task.done = checkbox.checked;
            saveTasks();
            displayTasks();
            updateSummary();
        });

        const textBox = document.createElement('div');
        const title = document.createElement('p');
        title.className = 'task-name';
        title.textContent = task.title;
        const meta = document.createElement('p');
        meta.className = 'task-meta';
        meta.textContent = (task.course || 'À classer') + (task.date ? ' · ' + formatDate(task.date) : '');
        textBox.append(title, meta);

        const tag = document.createElement('span');
        tag.className = 'task-tag ' + task.priority.toLowerCase();
        tag.textContent = task.priority;
        row.append(checkbox, textBox, tag);
        taskList.appendChild(row);
    });
}

if (form) {
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const title = document.getElementById('task-title').value.trim();
        if (!title) return;
        tasks.push({
            title: title,
            course: document.getElementById('task-course').value.trim(),
            date: dateInput.value,
            priority: document.getElementById('task-priority').value,
            done: false
        });
        saveTasks();
        form.reset();
        displayTasks();
        updateSummary();
    });
}

if (filter) {
    filter.addEventListener('change', displayTasks);
}

displayTasks();
updateSummary();

