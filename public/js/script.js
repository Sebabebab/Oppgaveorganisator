// Function to fetch all existing tasks from the backend
function fetchTasks() {
    return fetch('/tasks')
        .then((response) => response.json()) // Parse JSON response
        .catch((error) => console.error('Error fetching tasks:', error));
}

// Function to create a new task and send it to the backend
function createTask(taskData) {
    return fetch('/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
    })
    .then((response) => response.json()) // Parse JSON response
    .catch((error) => console.error('Error creating task:', error));
}

// Function to delete a task from the backend
function deleteTask(taskId) {
    return fetch(`/tasks/${taskId}`, {
        method: 'DELETE',
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Failed to delete task'); // Handle non-200 response
        }
        return response.text(); // Return response text for confirmation
    })
    .catch((error) => console.error('Error deleting task:', error));
}

// Function to render tasks on the page
function renderTasks(tasks) {
    const notStartedTasks = document.getElementById('not-started-tasks');
    notStartedTasks.innerHTML = ''; // Clear existing content

    tasks.forEach((task) => {
        const taskBox = document.createElement('div');
        taskBox.className = 'task-box';
        taskBox.style.backgroundColor = task.color;
        taskBox.innerHTML = `
            <strong>${task.title}</strong><br>
            ${task.info}
            <span class="delete-task">&times;</span> <!-- Delete button -->
        `;

        // Set delete functionality
        taskBox.querySelector('.delete-task').addEventListener('click', function () {
            deleteTask(task.id).then(() => {
                taskBox.remove(); // Remove from the DOM if successful
            });
        });

        // Draggable attributes for "drag-and-drop"
        taskBox.setAttribute('draggable', 'true');
        taskBox.addEventListener('dragstart', function (event) {
            event.dataTransfer.setData('text/plain', task.id); // Store the task ID for "drag-and-drop"
            event.target.style.opacity = '0.5'; // Visual feedback when dragging
        });
        taskBox.addEventListener('dragend', function (event) {
            event.target.style.opacity = '1'; 
        });

        notStartedTasks.appendChild(taskBox); // Add task to the DOM
    });
}

// Fetch tasks on page load and render them
fetchTasks().then((tasks) => {
    renderTasks(tasks);
});

// Handle "Add Task" button click
const addTaskBtn = document.getElementById('addTaskBtn');
addTaskBtn.addEventListener('click', function () {
    const title = prompt('Enter task title:');
    const info = prompt('Enter task info:');
    const color = '#ffffff'; // Default color
    const status = 'Ikke startet'; // Default status

    if (title) {
        const newTask = {
            title,
            info,
            color,
            status,
        };

        // Create the task and add it to the frontend
        createTask(newTask).then((createdTask) => {
            const taskBox = document.createElement('div');
            taskBox.className = 'task-box';
            taskBox.style.backgroundColor = createdTask.color;
            taskBox.innerHTML = `
                <strong>${createdTask.title}</strong><br>
                ${createdTask.info}
                <span class="delete-task">&times;</span> <!-- Delete button -->
            `;

            // Set delete functionality
            taskBox.querySelector('.delete-task').addEventListener('click', function () {
                deleteTask(createdTask.id).then(() => {
                    taskBox.remove(); // Remove from the DOM if successful
                });
            });

            // Draggable attributes
            taskBox.setAttribute('draggable', 'true');
            taskBox.addEventListener('dragstart', function (event) {
                event.dataTransfer.setData('text/plain', createdTask.id); 
                event.target.style.opacity = '0.5'; // Visual feedback when dragging
            });
            taskBox.addEventListener('dragend', function (event) {
                event.target.style.opacity = '1'; 
            });

            const notStartedTasks = document.getElementById('not-started-tasks');
            notStartedTasks.appendChild(taskBox); // Append to the DOM
        });
    }
});
