const input_add = document.getElementById('add');
const displayelement = document.getElementById('root');

input_add.addEventListener('click', () => {
    const input = document.getElementById('input');
    const data = {
        text: input.value,
        time: '00:00:00',
        elapsed: 0, // Store elapsed time in milliseconds
        subtasks: [] // Store subtasks
    };
    const todo = localStorage.getItem('todo') || '[]';
    localStorage.setItem('todo', JSON.stringify([...JSON.parse(todo), data]));
    input.value = '';
    render();
});

const render = () => {
    const todo = localStorage.getItem('todo') || '[]';
    const data = JSON.parse(todo);
    displayelement.innerHTML = '';
    data.forEach((element) => {
        const div = document.createElement('div');
        div.className = `todo-item todo_${element.text}`;
        div.innerHTML = `
            <div>
                <div>
                    <p>${element.text}</p>
                    <p class="timer" id="display_time_${element.text}">${element.time}</p>
                </div>
                <div class="timer-controls">
                    <button onclick="startTimer('${element.text}')">Start</button>
                    <button onclick="pauseTimer('${element.text}')">Pause</button>
                    <button onclick="deleteTask('${element.text}')">Delete</button>
                    <button onclick="addSubtask('${element.text}')">Add Subtask</button>
                    <div id="timer_${element.text}">${element.time}</div>
                </div>
            </div>
            <div class="subtasks" id="subtasks_${element.text}"></div>`;
        displayelement.appendChild(div);

        renderSubtasks(element.text, element.subtasks);
    });
}

const renderSubtasks = (taskText, subtasks) => {
    const subtasksDiv = document.getElementById(`subtasks_${taskText}`);
    subtasksDiv.innerHTML = '';
    subtasks.forEach((subtask) => {
        const subtaskDiv = document.createElement('div');
        subtaskDiv.className = 'subtask-item';
        subtaskDiv.innerHTML = `<p>${subtask.text}</p>
                                <p class="subtask-time">Created at: ${subtask.createdTime}</p>`;
        subtasksDiv.appendChild(subtaskDiv);
    });
}

const startTimer = (taskText) => {
    const now = Date.now();
    localStorage.setItem(`start_${taskText}`, now);
    tick();
}

const pauseTimer = (taskText) => {
    const start = localStorage.getItem(`start_${taskText}`);
    if (!start) return; // If the timer wasn't started, do nothing

    const now = Date.now();
    const elapsed = now - parseInt(start);
    const todo = JSON.parse(localStorage.getItem('todo'));

    const updatedData = todo.map((task) => {
        if (task.text === taskText) {
            task.elapsed += elapsed;
            task.time = msToTime(task.elapsed);
            localStorage.removeItem(`start_${taskText}`); // Remove the start time from localStorage
        }
        return task;
    });

    localStorage.setItem('todo', JSON.stringify(updatedData));
    render();
}

const deleteTask = (taskText) => {
    const todo = JSON.parse(localStorage.getItem('todo'));
    const updatedData = todo.filter((task) => task.text !== taskText);
    localStorage.setItem('todo', JSON.stringify(updatedData));
    render();
}

const addSubtask = (taskText) => {
    const subtaskText = prompt('Enter subtask:');
    if (!subtaskText) return;

    const todo = JSON.parse(localStorage.getItem('todo'));
    const task = todo.find(task => task.text === taskText);

    const now = new Date();
    const createdTime = document.getElementById(`timer_${taskText}`).textContent;

    const subtask = {
        text: subtaskText,
        createdTime: createdTime
    };

    const updatedData = todo.map((task) => {
        if (task.text === taskText) {
            task.subtasks.push(subtask);
        }
        return task;
    });

    localStorage.setItem('todo', JSON.stringify(updatedData));
    render();
}

const msToTime = (ms) => {
    let seconds = Math.floor((ms / 1000) % 60);
    let minutes = Math.floor((ms / (1000 * 60)) % 60);
    let hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return `${hours}:${minutes}:${seconds}`;
}

const tick = () => {
    const todo = JSON.parse(localStorage.getItem('todo'));
    todo.forEach((task) => {
        const start = localStorage.getItem(`start_${task.text}`);
        if (start) {
            const now = Date.now();
            const elapsed = now - parseInt(start) + task.elapsed;
            const timerElement = document.getElementById(`timer_${task.text}`);
            timerElement.textContent = msToTime(elapsed);
        }
    });
    setTimeout(tick, 1000);
}

render();

