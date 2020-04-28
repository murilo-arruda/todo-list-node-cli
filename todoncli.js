const readline = require('readline');
const fs = require('fs');

const colors = (color, m) => {
  const res = '\x1b[0m';
  switch(color) {
    case 'cyan':
      m = `\x1b[36m${m + res}`;
      break;
    case 'white':
      m = `\x1b[90m${m + res}`;
      break
    case 'bwhite':
      m = `\x1b[1m${m + res}`;
      break;
    case 'inverse':
      m = `\x1b[7m${m + res}`;
      break
  }
  return m;
}

// colors for gui (in terminal)
const success = (m) => {
  return colors('cyan', m);
}
const waiting = (m) => {
  return colors('white', m);
}
const guiLines = (m) => {
  return colors('bwhite', m);
}
const inverse = (m) => {
  return colors('inverse', m);
}

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
  return output;
}

/* Show todos with gui */

function showTodos() {
  console.clear();
  console.log(guiLines(lineHeader));
  //const lastIndex = todos.length.toString();
  todos.forEach((todo, index) => {
    // color for the whole console ??? if is checked or not
    const color = todo.isChecked ? success : guiLines;
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
          console.log(startString + string + bar + activity + waiting(actualTime) + bar);
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
      console.log(startString + task + bar + activity + waiting(actualTime) + bar);
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

/* Returns an array with the min value first and the max value at the end */
function organizeTwoNumbers(args) {
  let start = parseInt(args[0]);
  let end = parseInt(args[1]);
  if (end < start) {
    start = parseInt(args[1]);
    end = parseInt(args[0]);
  }
  return [start, end];
}

/* Switch todo */
function switchTodo(args) {
  // this does not have a default position, it's forced two arguments!!!
  // because for switching you must be careful
  // verify both numbers
  if (verifyTwoNumbers(args) === false) return;
  args = organizeTwoNumbers(args);
  if (args[0] === args[1]) return;
  // first todo you want to switch
  moveTodo([args[0], args[1]]);
  // verify if they are next on other, if so, then just move one is enough...
  if (args[1] - 1 < 0) args[1] = 0;
  if (args[1] - 1 !== args[0]) moveTodo([args[1] - 1, args[0]]); 
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
  const args = organizeTwoNumbers([start, end]);
  let validate = [];
  for (let i = args[0]; i <= args[1]; i++) validate.push(i.toString());
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

/* Show documentation */
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
  console.clear();
  console.log(` ┌───────────────────────────────────────────────────────────────────────────┐
 │ ${guiLines('TodoNcli v1.0')}                                                        ${guiLines(2020)} │
 ├───────────────────────────────────────────────────────────────────────────┤
 │ Manage your todos anytime using command line!                             │
 │ Every change will be saved in your system.                                │
${newLine}
 │ Usage: ${inverse('command [arguments]')} - the arguments are space separated!           │
 ├───────────────────────────────────────────────────────────────────────────┤`);
  console.log(newLine);
  // console through helps
  helpFull.forEach((item) => {
    let commands = ` │ ${guiLines(item.commands[0])} or ${guiLines(item.commands[1])}`;
    while (commands.length < 40) commands += ' ';
    let example = `${inverse(item.example)}`;
    while (example.length < 60) example = ' ' + example;
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


/* Show the license :| */
function showLicense() {
  console.clear();
  console.log(`
todoncli

Copyright © 2020-2020 Koetemagie
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without │ restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 `);
}

/* ??? */
function showProtec() {
  console.clear();
  console.log(`
 ┌───────────────────────────────────────────────────────────────────────────┐
 │    -=-                                                                    │
 │ (\\  _  /)                                    The Angel will protec you!   │
 │ ( \\( )/ )                                                :Z               │
 │ (       )                                                                 │
 │  \`>   <´                                                                  │
 │  /     \\                                                                  │
 │  \`-._.-´         fgpfy vjlqb jqihl acuan zogf                             │
 │                                                                           │
 └───────────────────────────────────────────────────────────────────────────┘
 `);
}

/* */
function askForATask(help) {
  if (help === true) showHelp();
  else if (help === 2) showProtec();
  else if (help === 3) showLicense();
  else showTodos();
  rl.question(' > ', (answer) => {
    [answer, ...args] = answer.split(' ');
    checkTask(answer, args);
  });
}

/* Get command and pass to function */
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
    case 'protec':
      help = 2;
      break;
    case 'l':
    case 'license':
      help = 3;
      break;
    case 'ed':
    case 'edit':
      editTodo(args.join(' '))
      break;
    case 'rs':
    case 'restart':
      start();
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

function loadFile() {
  try {
    todos = JSON.parse(fs.readFileSync('todos.json', 'utf8'));
    redos = JSON.parse(fs.readFileSync('redos.json', 'utf8'));
    OTODOS = todos;
    OREDOS = redos;
    askForATask(false);
  } catch (err) {
    if (err.code === 'ENOENT') {
      const templateTodos = ' ' + [
  {
    "isChecked": false,
    "text": "Check me to test if is working!",
    "lastActivity": ">",
    "lastUpdated": Date.now()
  },
  {
    "isChecked": true,
    "text": "You can remove this template todo!",
    "lastActivity": "»",
    "lastUpdated": Date.now()
  }
];
      const templateRedos = '[]';
      // if only is missing redos files
      if (!redos && todos) {
        fs.writeFileSync('redos.json', templateRedos, 'utf8');
        redos = JSON.parse(fs.readFileSync('redos.json', 'utf8'));
        return askForATask(false);
      }
      // if is missing both files generate them
      fs.writeFileSync('todos.json', templateTodos, 'utf8');
      fs.writeFileSync('redos.json', templateRedos, 'utf8');
      redos = JSON.parse(fs.readFileSync('redos.json', 'utf8'));
      todos = JSON.parse(fs.readFileSync('todos.json', 'utf8'));
      return askForATask(false);
    } else {
      console.log(err);
      process.exit(0);
    }
  }
}

function saveData() {
  // just save if there's any change (optimization)
  if (OTODOS !== todos) fs.writeFileSync('todos.json', JSON.stringify(todos), 'utf8');
  if (OREDOS !== redos) fs.writeFileSync('redos.json', JSON.stringify(redos), 'utf8'); // |, null, 2| for prettier output
}

/* Redefines console.clear for better output (windows and linux) */
console.clear = function() {
  process.stdout.write("\u001b[2J\u001b[0;0H");
  return process.stdout.write('\033c\033[3J');
};

/* Initialize todos and redos */
let OTODOS, OREDOS, todos, redos;

/* Start the program */
function start() {
  console.clear();
  OTODOS, OREDOS, todos, redos = undefined;
  loadFile();
}
start();