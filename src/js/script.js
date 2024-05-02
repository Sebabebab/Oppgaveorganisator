
var modal = document.getElementById("taskModal");


var btn = document.getElementById("addTaskBtn");


var closeModal = document.getElementById("closeModal");


var notStartedTasks = document.getElementById("not-started-tasks");
var inProgressTasks = document.getElementById("in-progress-tasks");
var completedTasks = document.getElementById("completed-tasks");


btn.addEventListener("click", function() {
    modal.style.display = "block"; 
});


closeModal.addEventListener("click", function() {
    modal.style.display = "none"; 
});


var taskForm = document.getElementById("taskForm");
taskForm.addEventListener("submit", function(event) {
    event.preventDefault();


    var taskTitle = document.getElementById("taskTitle").value;
    var taskInfo = document.getElementById("taskInfo").value;
    var bgColor = document.getElementById("bgColor").value;


    var newTaskBox = document.createElement("div");
    newTaskBox.className = "task-box";
    newTaskBox.style.backgroundColor = bgColor;
    newTaskBox.innerHTML = `
        <strong>${taskTitle}</strong><br>
        ${taskInfo}
    `;

    newTaskBox.id = "task-" + Date.now();
    newTaskBox.setAttribute("draggable", "true");


    newTaskBox.addEventListener("dragstart", function(event) {
        event.dataTransfer.setData("text/plain", event.target.id); 
        event.target.style.opacity = "0.5"; 
    });
    newTaskBox.addEventListener("dragend", function(event) {
        event.target.style.opacity = "1"; 
    });


    notStartedTasks.appendChild(newTaskBox);


    modal.style.display = "none";
});


var taskLists = document.querySelectorAll(".task-list");

taskLists.forEach(function(list) {
    list.addEventListener("dragover", function(event) {
        event.preventDefault(); 
    });

    list.addEventListener("drop", function(event) {
        event.preventDefault(); 
        var draggedId = event.dataTransfer.getData("text/plain"); 
        var draggedElement = document.getElementById(draggedId); 
        list.appendChild(draggedElement); 
    });
});
