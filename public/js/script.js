function colorNameToHex(colorName) {
    const colors = {
        black: "#000000",
        gray: "#808080",
        grey: "#808080",
        darkgray: "#333333",
        red: "#FF0000",
        darkred: "#800000",
        purple: "#800080",
        brown: "#964B00"
    };

    return colors[colorName.toLowerCase()] || colorName; 
}

function shouldUseWhiteText(bgColor) {
    const darkColors = ["#000000", "#808080", "#333333", "#800000", "#FF0000", "#800080", "#964B00"];
    return darkColors.includes(bgColor.toLowerCase());
}

function renderTask(task, targetContainer) {
    const taskBox = document.createElement("div");
    taskBox.className = "task-box";
    const bgColorHex = colorNameToHex(task.color); 
    taskBox.style.backgroundColor = bgColorHex;
    
    const textColor = shouldUseWhiteText(bgColorHex) ? "#FFFFFF" : "#000000";
    taskBox.style.color = textColor;
    
    taskBox.id = `task-${task.id}`;
    taskBox.innerHTML = `
        <strong>${task.title}</strong><br>
        ${task.info}
        <span class="delete-task" style="color: ${textColor};">&times;</span> 
    `;

    taskBox.querySelector(".delete-task").addEventListener("click", function () {
        deleteTask(task.id).then(() => {
            taskBox.remove();
        });
    });

    taskBox.setAttribute("draggable", "true");
    taskBox.addEventListener("dragstart", function (event) {
        event.dataTransfer.setData("text/plain", task.id);
        event.target.style.opacity = "0.5";
    });
    taskBox.addEventListener("dragend", function (event) {
        event.target.style.opacity = "1";
    });

    targetContainer.appendChild(taskBox);
}

function fetchTasks() {
    return fetch("/tasks")
        .then((response) => response.json())
        .catch((error) => console.error("Error fetching tasks:", error));
}

function createTask(taskData) {
    return fetch("/tasks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
    })
    .then((response) => response.json())
    .catch((error) => console.error("Error creating task:", error));
}

function updateTaskStatus(taskId, newStatus) {
    return fetch(`/tasks/${taskId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error("Failed to update task status");
        }
        return response.text();
    })
    .catch((error) => console.error("Error updating task status:", error));
}

function deleteTask(taskId) {
    return fetch(`/tasks/${taskId}`, {
        method: "DELETE",
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error("Failed to delete task");
        }
        return response.text();
    })
    .catch((error) => console.error("Error deleting task:", error));
}

function downloadJSON() {
    fetch("/export-json")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to export data");
            }
            return response.blob();
        })
        .then((blob) => {
            const downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = "tasks.json";
            downloadLink.click();
        })
        .catch((error) => console.error("Error exporting to JSON:", error));
}

function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const jsonData = JSON.parse(e.target.result);
        fetch("/import-json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ tasks: jsonData }),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to import data");
            }
            return response.text();
        })
        .then(() => {
            fetchTasks().then((tasks) => renderTasks(tasks));
        })
        .catch((error) => console.error("Error importing JSON:", error));
    };

    reader.readAsText(file);
}

function renderTasks(tasks) {
    const notStartedTasks = document.getElementById("not-started-tasks");
    const inProgressTasks = document.getElementById("in-progress-tasks");
    const completedTasks = document.getElementById("completed-tasks");

    notStartedTasks.innerHTML = "";
    inProgressTasks.innerHTML = "";
    completedTasks.innerHTML = "";

    tasks.forEach((task) => {
        switch (task.status) {
            case "Ikke startet":
                renderTask(task, notStartedTasks);
                break;
            case "Jobber med":
                renderTask(task, inProgressTasks);
                break;
            case "Ferdig":
                renderTask(task, completedTasks);
                break;
        }
    });

    const taskLists = document.querySelectorAll(".task-list");

    taskLists.forEach((list) => {
        list.addEventListener("dragover", function (event) {
            event.preventDefault();
        });

        list.addEventListener("drop", function (event) {
            event.preventDefault();
            const taskId = event.dataTransfer.getData("text/plain");
            const draggedTaskBox = document.getElementById(`task-${taskId}`);

            if (draggedTaskBox) {
                let newStatus;
                if (list.id === "not-started-tasks") {
                    newStatus = "Ikke startet";
                } else if (list.id === "in-progress-tasks") {
                    newStatus = "Jobber med";
                } else if (list.id === "completed-tasks") {
                    newStatus = "Ferdig";
                }

                updateTaskStatus(taskId, newStatus).then(() => {
                    list.appendChild(draggedTaskBox);
                });
            }
        });
    });
}

fetchTasks().then((tasks) => renderTasks(tasks));

const addTaskBtn = document.getElementById("addTaskBtn");
addTaskBtn.addEventListener("click", function () {
    const title = prompt("Oppgave Tittel:");
    const info = prompt("Oppgave Info:");
    const color = prompt("Velg Bakgrunnsfarge (Engelsk)", "white"); 
    const status = "Ikke startet";

    if (title) {
        createTask({
            title,
            info,
            color,
            status,
        }).then((createdTask) => {
            const notStartedTasks = document.getElementById("not-started-tasks");
            renderTask(createdTask, notStartedTasks);
        });
    }
});

const exportJSONBtn = document.createElement("button");
exportJSONBtn.innerText = "Eksporter til JSON";
exportJSONBtn.className = "export-button";
exportJSONBtn.addEventListener("click", downloadJSON);

const importJSONLabel = document.createElement("label");
importJSONLabel.className = "import-button";
importJSONLabel.innerText = "Import JSON fil";

const importJSONInput = document.createElement("input");
importJSONInput.type = "file";
importJSONInput.accept = "application/json";
importJSONInput.style.display = "none";
importJSONInput.addEventListener("change", importJSON);

importJSONLabel.appendChild(importJSONInput);

const addTaskContainer = document.querySelector(".add-task-button");
addTaskContainer.appendChild(exportJSONBtn);
addTaskContainer.appendChild(importJSONLabel);
