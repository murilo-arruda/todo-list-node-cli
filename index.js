const readline = require('readline');
const chalk = require('chalk');
const fs = require('fs');

// colors for gui (in terminal)
const success = chalk.cyan;
const waiting = chalk.bold.white;
const guiLines = chalk.white;

// const indexConsole = 20;
const lineHeader = `
 ┌────┬─────┬───────────────────────────────────────────┬────────────────────┐
 │ ID │ Stt │ Todos                                     │ + Date             │
 ├────┼─────┼───────────────────────────────────────────┼────────────────────┤`;
const lineSub =
` └────┴─────┴───────────────────────────────────────────┴────────────────────┘`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function formatTodoTime(time) {
  const date = new Date(time);
  // make date prettier
  let specials = [date.getDate(), (date.getMonth() + 1), date.getHours(), date.getMinutes()];
  specials = specials.map((item) => {
    item = item.toString();
    while (item.length <= 1) item = `0${item}`;
    return item;
  });
  let output = ` ${specials[0]}/${specials[1]}/${date.getFullYear()} ${specials[2]}:${specials[3]}`;
  while (output.length < 16) output = ` ${output}`;
  // console.log(specials);
  return chalk.grey(output);
}

/* Show todos with gui */

function showTodos() {
  console.log(guiLines(lineHeader));
  //const lastIndex = todos.length.toString();
  todos.forEach((todo, index) => {
    // color for the whole console ??? if is checked or not
    const color = todo.isChecked ? success : waiting;
    // bar with normal color...
    const bar = guiLines(` │ `);
    // prettier the index...
    index = index.toString();
    while (index.length < 2) index = ` ${index}`; // 2 => lastIndex.length
    index = color(index);
    // status
    const status = color(`(${todo.isChecked ? 'X' : ' '})`);
    // task and checked symbol
    let task = todo.text;
    // make text adapts when there more than 41 charas per line
    const startString = bar + index + bar + status + bar;
    const actualTime = formatTodoTime(todo.lastUpdated);
    const activity = color(todo.lastActivity);
    if (task.length > 41) {
      const allStrings = task.match(/.{1,41}/g);
      allStrings.forEach( (string, si) => {
        // output final for first item => show data, stt
        if (si === 0) {
			string = color(string);
			console.log(startString + string + bar + activity + actualTime + bar);
		}
        // output final for the rest of items => only task
        else {
          while (string.length < 41) string += ' ';
		  // color string
		  string = color(string);
          console.log(bar + '  ' + bar + '   ' + bar + string + bar + '                  ' + bar);
          return;
        }
      });
      return;
    } else {
      while (task.length < 41) task += ' ';
      task = color(task);
      // output final
      console.log(startString + task + bar + activity + actualTime + bar);
      return;
    }
  });
  return console.log(guiLines(lineSub));
}

/* Redo Method */
function addRedo(command, args) {
  command = command.toLowerCase();
  switch(command) {
    case 'add':
      redos.unshift({
        command,
        index: args
      });
      break;
    case 'rem':
      redos.unshift({
        command,
        object: args
      });
      break;
  }
}

function redoAction() {
  if (redos.length === 0) return;
  const redo = redos[0];
  switch(redo.command) {
    case 'add':
      // remove todo added
      todos.splice(redo.index, 1);
      break;
    case 'check':
      //
      break;
    case 'rem':
      // add todo removed
      todos.push(redo.object);
      break;
    case 'edit':
      //
      break;
  }
  redos.shift();
}

function getNumber(text) {
   // if theres only one word
  if (!/\s/g.test(text)) return text;
  // separate text to get only the number
  let textIterable = text.split(' ');
  const numberIt = textIterable[textIterable.length - 1];
  // get number as [ ' -DIGIT' ]
  let number = text.match(/[^]-\d+\b$/gi);
  // if not finds any -DIGIT
  if (!number) return text;
  // replace number to '-DIGIT';
  number = number.join(' ').replace(/\s/g, '');
  // if the number is in the end of the text and is the same as the ti
  let index = number.replace('-', '');
  index = parseInt(index);
  // if the number given is bigger than the length of todos
  if (index > todos.length) return text;
  textIterable.pop();
  textIterable = textIterable.join(' ');
  const validate = {
     is: number === numberIt,
     text: textIterable,
     index,
  };
  return validate;
}

function addNormalTodo(text) {
  addRedo('add', todos.length);
  todos.push({
    isChecked: false,
    text,
    lastActivity: '>',
    lastUpdated: Date.now(),
  });
}

function addTodo(text) {
  if (text.length > 0) {
    const validate = getNumber(text);
    if (typeof validate === 'string') return addNormalTodo(validate);
    if (validate.is) {
      addRedo('add', validate.index);
      todos.splice(validate.index, 0, {
        isChecked: false,
        text: validate.text,
        lastActivity: '>',
        lastUpdated: Date.now(),
      });
    }
  }
}

function editTodo(text) {
  if (text.length > 0) {
    const validate = getNumber(text);
    if (validate.is) {
      todos.splice(validate.index, 1);
      todos.splice(validate.index, 0, {
        isChecked: false,
        text: validate.text,
        lastActivity: '>',
        lastUpdated: Date.now(),
      });
    }
  }
}

/* Verify two numbers in a method that reads two numbers and returns true if everything is okay :3 */
function verifyTwoNumbers(args) {
  // always need two arguments
  if (args.length !== 2) return false;
  for (item of args) {
    // need always be a number
    if (/[^\d+]/.test(item)) return false;
    // if the number is bigger or lower than expected
    if (item < 0 || item > todos.length) return false;
  }
  return true;
}

/* Switch todo */
function switchTodo(args) {
  // this does not have a default position, it's forced two arguments!!!
  // because for switching you must be careful
  // verify both numbers
  if (verifyTwoNumbers(args) === false) return;
  // first todo you want to switch
  moveTodo([args[0], args[1]]);
  // verify if they are next on other, if so, then just move one is enough...
  if (args[1] - 1 !== args[0]) moveTodo([args[1], args[0]]);
  if (args[0] - 1 !== args[1]) moveTodo([args[1], args[0]]);
}

/* Copy todo */
function copyTodo(args) {
  // if theres only the todo you want to move then default position to move is the last one
  if (args.length === 1) args.push(todos.length);
  // verify both numbers
  if (verifyTwoNumbers(args) === false) return;
  // first is the todo you want to copy
  const todo = todos[args[0]];
  // second the index you want to put
  const index = args[1];
  // copy it
  todos.splice(index, 0, todo); 
}

/* Move todo */
function moveTodo(args) {
  // if theres only the todo you want to move then default position to move is the last one
  if (args.length === 1) args.push(todos.length);
  // verify both numbers
  if (verifyTwoNumbers(args) === false) return;
  // first is the todo you want to move
  const todo = todos[args[0]];
  // second the index you want to put
  const index = args[1];
  // remove the current todo of the todos.json
  todos.splice(args[0], 1);
  // move it
  todos.splice(index, 0, todo); 
}

/* Range In between */
function rangeIn(ids) {
  ids = [ids];
  let [start, end] = ids[0].split('-');
  // if the index given is bigger than how much you have
  if (start > todos.length || todos.length < end) return;
  if (start < 0 && end < 0 ) return;
  start = parseInt(start);
  end = parseInt(end);
  let endN, startN;
  if (end < start) {
    startN = end;
    endN = start;
  }
  start = startN || start;
  end = endN || end;
  let validate = [];
  for (let i = start; i <= end; i++) validate.push(i.toString());
  return validate;;
}

function checkTodos(ids) {
  // verify if there's any item with range in
  ids.forEach((id, index) => {
    id = id.toString();
    if (id.includes('-')) {
      const validate = rangeIn(id);
      ids.splice(index, 1);
      ids = ids.concat(validate);
    };
  });
  // loop for change each id
  ids.forEach((id) => {
    if (todos[id]) {
      const ischecked = !todos[id].isChecked;
      todos[id].isChecked = ischecked;
      todos[id].lastActivity = ischecked ? '»' : '>';
      todos[id].lastUpdated = Date.now();
    }
  });
}

function removeTodos(ids) {
  if (ids.length === 0) return;
  // verify if there's any item with range in
  ids.forEach((item, index) => {
    item = item.toString();
    if (/[a-zA-Z]/g.test(item)) return;
    if (item.includes('-')) {
      const validate = rangeIn(item);
      ids.splice(index, 1);
      ids = ids.concat(validate);
    };
  });
  ids.sort((a, b) => b - a);
  ids.forEach((id) => {
    if (todos[id]) todos.splice(id, 1);
  });
}

function showHelp() {
  const newLine = ' │                                                                           │';
  const helpFull = [
    {
      'commands': ['add', 'a'],
      'explanation': 'Add a new todo. Default is in the main list, if you want to add in a index then add in the end the index number with minus prefix.',
      'example': 'add my new task',
    },
    {
      'commands': ['check', 'x'],
      'explanation': 'Checkmark the items. This will check the first item and the third. If you want to check only one, then just type the index.',
      'example': 'check 0 2',
    },
    {
      'commands': ['edit', 'ed'],
      'explanation': 'This will replace the indexed to-do to another. Same usage of add command.',
      'example': 'edit this one is the new -5',
    },
    {
      'commands': ['switch', 's'],
      'explanation': 'This will switch the indexed to-do to another. There is no default!',
      'example': 'switch 1 5',
    }, 
    {
      'commands': ['copy', 'c'],
      'explanation': 'This will copy the indexed to-do to other position. Default position is the last.',
      'example': 'copy 2 4',
    }, 
    {
      'commands': ['move', 'm'],
      'explanation': 'This will move the indexed to-do to other position.',
      'example': 'move 9 6',
    }, 
    {
      'commands': ['rem', 'r'],
      'explanation': 'This will remove the selected to-do. If you want to remove more, just separate the arguments with spaces.',
      'example': 'rem 0 1',
    },
    {
      'commands': ['redo', 'rd'],
      'explanation': 'This will redo the last action you made.',
      'example': 'redo',
    },
    {
      'commands': ['remcheckeds', 'rc'],
      'explanation': 'This will remove all the the checked to-dos.',
      'example': 'remcheckeds',
    },
    {
      'commands': ['help', 'h'],
      'explanation': 'Show this. Duh :3',
      'example': 'help',
    },
    {
      'commands': ['license', 'l'],
      'explanation': 'Show the license of the software.',
      'example': 'license',
    },
    {
      'commands': ['addgroup', 'ag'],
      'explanation': 'Create a new group of to-dos. This helps you to organize better the types of to-dos you have.',
      'example': 'addgroup NewWorld',
    },
    {
      'commands': ['remgroup', 'rg'],
      'explanation': 'Delete the selected group.',
      'example': 'remgroup NewWorld',
    },
    {
      'commands': ['namegroup', 'ng'],
      'explanation': 'Name the selected group. First is the group you want to rename and then the name you want.',
      'example': 'namegroup NewWorld VidaLouca',
    },
    {
      'commands': ['setwidth', 'sw'],
      'explanation': 'For set a new line width for the gui, it\'s only for resolve design bugs.',
      'example': 'setwidth',
    },
	  {
      'commands': ['restart', 'rs'],
      'explanation': 'Restart the program. :|',
      'example': 'restart',
	  },
	  {
      'commands': ['exit', 'e'],
      'explanation': 'Exit the program. :|',
      'example': 'exit',
	  },
  ];
  console.log(` ┌───────────────────────────────────────────────────────────────────────────┐
 │ ${chalk.bold('TodoNcli v1.0')}                                                        ${chalk.bold(2020)} │
 ├───────────────────────────────────────────────────────────────────────────┤
 │ Manage your todos anytime using command line!                             │
 │ Every change will be saved in your system.                                │
${newLine}
 │ Usage: ${chalk.inverse('command [arguments]')} - the arguments are space separated!           │
 ├───────────────────────────────────────────────────────────────────────────┤`);
  console.log(newLine);
  // console through helps
  helpFull.forEach((item) => {
    let commands = ` │ ${chalk.bold(item.commands[0])} or ${chalk.bold(item.commands[1])}`;
    while (commands.length < 40) commands += ' ';
    let example = `${chalk.inverse(item.example)}`;
    while (example.length < 63) example = ' ' + example;
    console.log(commands + example + ' │ ');
    let explanation = item.explanation;
    while (explanation.length < 73) explanation += ' ';
    if (explanation.length > 73) {
      const allStrings = explanation.match(/.{1,73}/g);
      allStrings.forEach((string) => {
        string = string.replace(/^ /, '');
        while (string.length < 73) string += ' ';
        console.log(` │ ${string} │ `);
      });
    } else console.log(` │ ${explanation} │ `);
    return console.log(newLine);
  });
  return console.log(` └───────────────────────────────────────────────────────────────────────────┘`);
}

function askForATask(withHelp) {
  console.clear();
  if (withHelp) {
    showHelp();
  } else {
    showTodos();
  }
  rl.question(' > ', (answer) => {
    [answer, ...args] = answer.split(' ');
    checkTask(answer, args);
  });
}

function checkTask(answer, args) {
  let help = false;
  answer = answer.toLowerCase(); 4;
  switch (answer) {
    case 'a':
    case 'add':
      addTodo(args.join(' '));
      break;
    case 'x':
    case 'check':
      checkTodos(args);
      break;
    case 's':
    case 'switch':
      switchTodo(args);
      break;
    case 'rd':
    case 'redo':
      redoAction();
      break;
    case 'r':
    case 'rem':
      removeTodos(args);
      break;
    case 'c':
    case 'copy':
      copyTodo(args);
      break;
    case 'm':
    case 'move':
      moveTodo(args);
      break;
    case 'h':
    case 'help':
      help = true;
      break;
    case 'ed':
    case 'edit':
      editTodo(args.join(' '))
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

const templateTodos = `[
  {
    "isChecked": false,
    "text": "Check me to test if is working! ",
    "lastActivity": ">",
    "lastUpdated": ${Date.now()}
  },
  {
    "isChecked": true,
    "text": "You can remove this template todo!",
    "lastActivity": "»",
    "lastUpdated": ${Date.now()}
  }
]`;

const templateRedos = `[]`;

function loadFile() {
  try {
    todos = JSON.parse(fs.readFileSync('todos.json', 'utf8'));
    redos = JSON.parse(fs.readFileSync('redos.json', 'utf8'));
    askForATask(false);
  } catch (err) {
    if (err.code == 'ENOENT') {
      console.log('Todo file and redo file not found. Do you want generate new ones? (Y/N)');
      rl.question('> ', (answer) => {
		answer = answer.toLowerCase();
        switch (answer) {
          case 'y':
          case 'yes':
            fs.writeFileSync('todos.json', templateTodos, 'utf8');
            if (redos) fs.writeFileSync('redos.json', templateRedos, 'utf8');
            redos = JSON.parse(fs.readFileSync('redos.json', 'utf8'));
            todos = JSON.parse(fs.readFileSync('todos.json', 'utf8'));
            askForATask(false);
            break;
          default:
            console.clear();
            console.log('You can\'t use todoncli without creating the todo and redo file.\nExiting...');
            setTimeout(() => {
              process.exit(0);
            }, 1000);
        }
      });
    } else {
      console.log(err);
      process.exit(0);
    }
  }
}

function saveData() {
  fs.writeFileSync('todos.json', JSON.stringify(todos), 'utf8'); // |, null, 2| for prettier output
  fs.writeFileSync('redos.json', JSON.stringify(redos, null, 2), 'utf8'); // |, null, 2| for prettier output
}

console.clear = function() {
  return process.stdout.write('\033c\033[3J');
};

let todos;
let redos;
loadFile();


/*
const text = ['31-33'];
checkTodos(text);
*/
