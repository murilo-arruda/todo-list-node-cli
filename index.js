const readline = require('readline');
const chalk = require('chalk');

const success = chalk.green;
const waiting = chalk.blue;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
// Should get from a file!
const todos = [
  {
    isChecked: false,
    text: 'first todo'
  },
  {
    isChecked: true,
    text: 'second todo'
  },
  {
    isChecked: false,
    text: 'third todo'
  },
];

function showTodos() {
  todos.forEach((todo, index)=> {
    const color = todo.isChecked ? success : waiting;
    console.log(color(`${index} - [${todo.isChecked ? 'X' : ' ' }] ${todo.text}`))
  });
}

function askForATask(withHelp) {
  console.clear();

  if(withHelp) {
    console.log(`
      TODO LIST NODE CLI\n
      Manager todos anytime using command line!\n
      Every change will be saved in your system.\n
      usage: 'command [arguments]'\n

      add - add a new todo: 'add my new task'\n
      check - check itens: 'check 0 2'. this will check the first item and the third.\n
      remove - remove items: 'remove 0 1'. this will remove the first two items.\n

      > PRESS ENTER TO CONTINUE < \n
    `)
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
function showHelp(err) {
  if (err) {
    console.log('invalid input')
  }
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
  askForATask(help);
}
askForATask(false);
