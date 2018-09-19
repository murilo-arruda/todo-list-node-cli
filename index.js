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
    "text": "Check me to test if is working! "
  },
  {
    "isChecked": true,
    "text": "You can remove this template todo!"
  }
]`;

function showTodos() {
  todos.forEach((todo, index)=> {
    const color = todo.isChecked ? success : waiting;
    console.log(color(`${index} - [${todo.isChecked ? 'X' : ' ' }] ${todo.text}`))
  });
}

function askForATask(withHelp) {
  console.clear();

  if(withHelp) {
    showHelp();
  } else {
    showTodos();
    console.log('type an option: (a)dd, (c)heck, (r)emove, (h)elp, (e)xit ');
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
    });
  }
}
function checkTodos(ids){
  ids.forEach((id) => {
    if (todos[id]){
      todos[id].isChecked = !todos[id].isChecked;
    }
  });
}
function removeTodos(ids){
  ids.sort((a, b) => b - a);
  ids.forEach((id) => {
    if (todos[id]) {
      todos.splice(id, 1);
    }
  });
}
function showHelp() {
  console.log(`
  ${chalk.bgGreen('TODO LIST NODE CLI')}\n
  Manager todos anytime using command line!\n
  Every change will be saved in your system.\n
  usage: 'command [arguments]' - the arguments are space separated!\n

  add - add a new todo. Example ${chalk.inverse('add my new task')}\n
  check - checkmark the  items. Example: ${chalk.inverse('check 0 2')}. this will check the first item and the third.\n
  remove - remove items from the list. Example ${chalk.inverse('remove 0 1')}. this will remove the first two items.\n
  you can use the initial letter of each command for a shortcut\n
  > PRESS ENTER TO CONTINUE < \n
`)
}
function checkTask(answer, args) {
  let help = false;
  switch(answer){
    case 'a':
    case 'add':
      addTodo(args.join(' '));
      break;
    case 'c':
    case 'check':
      checkTodos(args);
      break;
    case 'r':
    case 'remove':
      removeTodos(args);
      break;
    case 'h':
    case 'help':
      help = true;
      break;
    case 'e':
    case 'exit':
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
// try to read data from a json file
function loadFile() {
  try{
    todos = JSON.parse(fs.readFileSync('todos.json', 'utf8'));
    askForATask(false);
  } catch (err){
    if (err.code = 'ENOENT'){
      console.log('Todo file not found. do you want generate a new one? (Y/n)');
      rl.question('> ', (answer) => {
        switch(answer) {
            case 'y':
            case 'Y':
            case 'YES':
            case 'yes':
              fs.writeFileSync('todos.json', template, 'utf8');
              todos = JSON.parse(fs.readFileSync('todos.json', 'utf8'));
              askForATask(false);
              break;
            default:
              console.log('Exiting...');
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

