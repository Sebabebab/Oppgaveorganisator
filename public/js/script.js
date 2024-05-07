function fetchTasks() {
    return fetch('/tasks')
        .then((response) => response.json())
        .catch((error) => console.error('Error fetching tasks:', error));
}

function createTask(taskData) {
    return fetch('/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
    })
    .then((response) => response.json())
    .catch((error) => console.error('Error creating task:', error));
}

function updateTaskStatus(taskId, newStatus) {
    return fetch(`/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Failed to update task status');
        }
        return response.text();
    })
    .catch((error) => console.error('Error updating task status:', error));
}

function deleteTask(taskId) {
    return fetch(`/tasks/${taskId}`, {
        method: 'DELETE',
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
        return response.text();
    })
    .catch((error) => console.error('Error deleting task:', error));
}

function downloadJSON() {
    fetch('/export-json')
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to export data');
            }
            return response.blob();
        })
        .then((blob) => {
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = 'tasks.json';
            downloadLink.click();
        })
        .catch((error) => console.error('Error exporting to JSON:', error));
}

function renderTasks(tasks) {
    const notStartedTasks = document.getElementById('not-started-tasks');
    const inProgressTasks = document.getElementById('in-progress-tasks');
    const completedTasks = document.getElementById('completed-tasks');

    notStartedTasks.innerHTML = '';
    inProgressTasks.innerHTML = '';
    completedTasks.innerHTML = '';

    tasks.forEach((task) => {
        const taskBox = document.createElement('div');
        taskBox.className = 'task-box';
        taskBox.id = `task-${task.id}`;
        taskBox.style.backgroundColor = task.color;
        taskBox.innerHTML = `
            <strong>${task.title}</strong><br>
            ${task.info}
            <span class="delete-task">&times;</span>
        `;

        taskBox.querySelector('.delete-task').addEventListener('click', function () {
            deleteTask(task.id).then(() => {
                taskBox.remove();
            });
        });

        taskBox.setAttribute('draggable', 'true');
        taskBox.addEventListener('dragstart', function (event) {
            event.dataTransfer.setData('text/plain', task.id);
            event.target.style.opacity = '0.5';
        });
        taskBox.addEventListener('dragend', function (event) {
            event.target.style.opacity = '1';
        });

        switch (task.status) {
            case 'Ikke startet':
                notStartedTasks.appendChild(taskBox);
                break;
            case 'Jobber med':
                inProgressTasks.appendChild(taskBox);
                break;
            case 'Ferdig':
                completedTasks.appendChild(taskBox);
                break;
        }
    });

    const taskLists = document.querySelectorAll('.task-list');

    taskLists.forEach((list) => {
        list.addEventListener('dragover', function (event) {
            event.preventDefault();
        });

        list.addEventListener('drop', function (event) {
            event.preventDefault();
            const taskId = event.dataTransfer.getData('text/plain');
            const draggedTaskBox = document.getElementById(`task-${taskId}`);

            if (draggedTaskBox) {
                let newStatus;
                if (list.id === 'not-started-tasks') {
                    newStatus = 'Ikke startet';
                } else if (list.id === 'in-progress-tasks') {
                    newStatus = 'Jobber med';
                } else if (list.id === 'completed-tasks') {
                    newStatus = 'Ferdig';
                }

                updateTaskStatus(taskId, newStatus).then(() => {
                    list.appendChild(draggedTaskBox);
                });
            }
        });
    });
}

fetchTasks().then((tasks) => {
    renderTasks(tasks);
});

const addTaskBtn = document.getElementById('addTaskBtn');
addTaskBtn.addEventListener('click', function () {
    const title = prompt('Oppgave Tittel:');
    const info = prompt('Oppgave Info:');
    const color = prompt('Velg Bakgrunnsfarge (Engelsk):', 'white');
    const status = 'Ikke startet';

    if (title) {
        const newTask = {
            title,
            info,
            color,
            status,
        };

        createTask(newTask).then((createdTask) => {
            const taskBox = document.createElement('div');
            taskBox.className = 'task-box';
            taskBox.id = `task-${createdTask.id}`;
            taskBox.style.backgroundColor = createdTask.color;
            taskBox.innerHTML = `
                <strong>${createdTask.title}</strong><br>
                ${createdTask.info}
                <span class="delete-task">&times;</span>
            `;

            taskBox.querySelector('.delete-task').addEventListener('click', function () {
                deleteTask(createdTask.id).then(() => {
                    taskBox.remove();
                });
            });

            taskBox.setAttribute('draggable', 'true');
            taskBox.addEventListener('dragstart', function (event) {
                event.dataTransfer.setData('text/plain', createdTask.id);
                event.target.style.opacity = '0.5';
            });
            taskBox.addEventListener('dragend', function (event) {
                event.target.style.opacity = '1';
            });

            const notStartedTasks = document.getElementById('not-started-tasks');
            notStartedTasks.appendChild(taskBox);
        });
    }
});

const exportJSONBtn = document.createElement('button');
exportJSONBtn.innerText = 'Eksporter til JSON';
exportJSONBtn.className = 'export-button';
exportJSONBtn.addEventListener('click', downloadJSON);
const addTaskContainer = document.querySelector('.add-task-button');
addTaskContainer.appendChild(exportJSONBtn);



