const readline = require('readline');
const chalk = require('chalk');
const fs = require('fs');

const success = chalk.green;
const waiting = chalk.blue;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const template = `[
  {
    "isChecked": false,
    "text": "Check me to test if is working! ",
    "lastActivity": "created",
    "lastUpdated": ${Date.now()}
  },
  {
    "isChecked": true,
    "text": "You can remove this template todo!",
    "lastActivity": "checked",
    "lastUpdated": ${Date.now()}

  }
]`;

function formatTodoTime(time) {
  const date = new Date(time);
  return chalk.grey(
    `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`
  );
}

function showTodos() {
  todos.forEach((todo, index)=> {
    const color = todo.isChecked ? success : waiting;
    console.log(color(`${index} - [${todo.isChecked ? 'X' : ' ' }] ${todo.text}\t ${todo.lastActivity} ${formatTodoTime(todo.lastUpdated)}`))
  });
}

function askForATask(withHelp) {
  console.clear();

  if(withHelp) {
    showHelp();
  } else {
    showTodos();
    console.log('Type an option: (a)dd, (c)heck, (r)emove, (h)elp, (e)xit ');
  }
  rl.question('> ', (answer) => {
    [answer, ...args] = answer.split(' ');
    checkTask(answer, args);
  });
}

function addTodo(text) {
  if( text.length > 0){
    todos.push({
      isChecked: false,
      text,
      lastActivity: 'created',
      lastUpdated: Date.now(),
    });
  }
}

function checkTodos(ids){
  ids.forEach((id) => {
    if (todos[id]){
      todos[id].isChecked = !todos[id].isChecked;
      todos[id].lastActivity = 'checked';
      todos[id].lastUpdated = Date.now();
    }
  });
}

function removeTodos(ids){
  if(ids[0].length === 3 && ids[0].includes('-')) {
    const [startRemoval, stopRemoval] = ids[0].split('-');
     if ((startRemoval >= 0 && startRemoval < todos.length)
      && (stopRemoval >= 0 && stopRemoval < todos.length)) {
      const toRemove = (parseInt(stopRemoval) - parseInt(startRemoval)) + 1;
      todos.splice(startRemoval, toRemove);
    }
  } else {
    ids.sort((a, b) => b - a);
    ids.forEach((id) => {
      if (todos[id]) {
        todos.splice(id, 1);
      }
    });
  }
}

function showHelp() {
  console.log(`
  ${chalk.white.bgGreen(' TODO LIST NODE CLI ')}\n
  Manage your todos anytime using command line!\n
  Every change will be saved in your system.\n
  Usage: 'command [arguments]' - the arguments are space separated!\n

  ${chalk.green('add')} - Add a new todo. Example: ${chalk.inverse('add my new task')}\n
  ${chalk.blue('check')} - Checkmark the  items. Example: ${chalk.inverse('check 0 2')}. This will check the first item and the third.\n
  ${chalk.red('remove')} - Remove items from the list. Example: ${chalk.inverse('remove 0 1')}. This will remove the first two items.\n
  You can use the initial letter of each command for a shortcut.\n
  > PRESS ENTER TO CONTINUE < \n
`)
}
function checkTask(answer, args) {
  let help = false;
  switch(answer){
    case 'a':
    case 'A':
    case 'add':
    case 'Add':
      addTodo(args.join(' '));
      break;
    case 'c':
    case 'C':
    case 'check':
    case 'Check':
      checkTodos(args);
      break;
    case 'r':
    case 'R':
    case 'remove':
    case 'Remove':
      removeTodos(args);
      break;
    case 'h':
    case 'H':
    case 'help':
    case 'Help':
      help = true;
      break;
    case 'e':
    case 'E':
    case 'exit':
    case 'Exit':
      console.clear();
      rl.close();
      process.exit();
      break;
    default:
      help = false;
  }
  saveData();
  askForATask(help);
}

function loadFile() {
  try{
    todos = JSON.parse(fs.readFileSync('todos.json', 'utf8'));
    askForATask(false);
  } catch (err){
    if (err.code = 'ENOENT'){

      console.log('Todo file not found. Do you want generate a new one? (Y/N)');
      rl.question('> ', (answer) => {
        switch(answer) {
          case 'y':
          case 'Y':
          case 'YES':
          case 'yes':
          case 'Yes':
            fs.writeFileSync('todos.json', template, 'utf8');
            todos = JSON.parse(fs.readFileSync('todos.json', 'utf8'));
            askForATask(false);
            break;
          default:
            console.log('You can\'t use this app without creating the todo file.\nExiting...');
            process.exit(0);

        }
       });

    } else {
      console.log(err);
      process.exit(0);
    }
  }
}

function saveData() {
  fs.writeFileSync('todos.json', JSON.stringify(todos), 'utf8');
}

let todos;
loadFile();
