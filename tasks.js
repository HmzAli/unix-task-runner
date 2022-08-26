import { loadJsonFile } from 'load-json-file';
import { writeJsonFile } from 'write-json-file';
import { exec } from 'child_process';
import parser from 'cron-parser';

const tasksFileName = 'tasks.json';

start();

async function start() {
    const tasks = await getTasks();
    const pendingTasks = await getPendingTasks(tasks);
    const executedTasks = await executeTasks(pendingTasks);
    const updatedTasks = setNextRunDate(executedTasks);

    await saveTasks(tasks, updatedTasks);

    console.log(`\ntask run completed. ${updatedTasks.length} of ${tasks.length} tasks executed`)
}

async function getTasks() {
    return await loadJsonFile(tasksFileName);
}

async function getPendingTasks(tasks) {
    if (!tasks.length) {
        return [];
    }

    return tasks.filter(task => task.nextRunDate < getCurrentDate());
}

async function executeTasks(tasks) {
    if (!tasks.length) {
        return [];
    }

    let executedTasks = [];
    for (let task of tasks) {
        try {
            executedTasks.push(await executeTask(task));
        } catch(error) {
            console.log(`failed to execute task: ${task.name}, `, error);
            continue;
        }
    };

    return executedTasks;
}

async function executeTask(task) {
    return new Promise((resolve, reject) => {
        if (!task) {
            throw new Error('no task to execute');
        }

        exec(`${task.interpreterPath} ${task.scriptPath}`, (error, stdout) => {
            if (error) {
                reject(error);
            }

            resolve(task);
        });
    })
}

function setNextRunDate(tasks) {
    return tasks.map(task => {
        let interval = parser.parseExpression(task.scheduleCron);
        task.nextRunDate = getUnixDate(interval.next().getTime());
        return task;
    })
}

async function saveTasks(savedTasks, executedTasks) {
    const tasksToSave = savedTasks.map(task => {
        for (let et of executedTasks) {
            if (task.id == et.id) {
                return et;
            }
        }

        return task;
    });

    return await writeJsonFile(tasksFileName, tasksToSave);
}

function getCurrentDate () {
    return new Date().getTime() / 1000; // Unix timestamp (seconds)
}

function getUnixDate(date) {
    return date / 1000;
}
