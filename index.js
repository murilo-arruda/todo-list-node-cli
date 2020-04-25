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

const template = `[
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

function showTodos() {
  console.log(guiLines(lineHeader));
  const lastIndex = todos.length.toString();
  todos.forEach((todo, index) => {
    // color for the whole console ??? if is checked or not
    const color = todo.isChecked ? success : waiting;
    // bar with normal color...
    const bar = guiLines(` │ `);
    // prettier the index...
    index = index.toString();
    while (index.length < lastIndex.length) index = ` ${index}`;
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

function askForATask(withHelp) {
  console.clear();
  if (withHelp) {
    showHelp();
  } else {
    showTodos();
    console.log(`
    Type a command:`, chalk.whiteBright(`
    (h)  help                       Show all list of commands and explanations
    (a)  add                        Add to-do (default is main list)
    (x)  check                      Check to-do (default is main list)
    (r)  remove                     Remove to-do (default is main list)
    (ed) edit                       Edit to-do (default is main list)
    (e)  exit                       Close terminal
    `));
    /*     (rd) redo                       Redo last edit */
  }
  rl.question(' > ', (answer) => {
    [answer, ...args] = answer.split(' ');
    checkTask(answer, args);
  });
}

function addNormalTodo(text) {
  todos.push({
    isChecked: false,
    text,
    lastActivity: '>',
    lastUpdated: Date.now(),
  });
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

function addTodo(text) {
  if (text.length > 0) {
    const validate = getNumber(text);
    if (typeof validate === 'string') return addNormalTodo(validate);
    if (validate.is) {
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

function checkTodos(ids) {
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
  if (ids[0].length === 3 && ids[0].includes('-')) {
    const [startRemoval, stopRemoval] = ids[0].split('-');
    if ((startRemoval >= 0 && startRemoval < todos.length) &&
      (stopRemoval >= 0 && stopRemoval < todos.length)) {
      const toRemove = (parseInt(stopRemoval) - parseInt(startRemoval)) + 1;
      todos.splice(startRemoval, toRemove);
    }
  } else {
    ids.sort((a, b) => b - a);
    ids.forEach((id) => {
      if (todos[id]) todos.splice(id, 1);
    });
  }
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
      'explanation': 'This will replace the indexed to-do for another. Same usage of add command.',
      'example': 'edit this one is the new -5',
    },
    {
      'commands': ['rem', 'r'],
      'explanation': 'This will remove the selected to-do. If you want to remove more, just separate the arguments with spaces.',
      'example': 'rem 0 1',
    },
    {
      'commands': ['remdones', 'rd'],
      'explanation': 'This will remove all the the checked to-dos.',
      'example': 'remdones',
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
    case 'r':
    case 'rem':
      removeTodos(args);
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

function loadFile() {
  try {
    todos = JSON.parse(fs.readFileSync('todos.json', 'utf8'));
    askForATask(false);
  } catch (err) {
    if (err.code == 'ENOENT') {
      console.log('Todo file not found. Do you want generate a new one? (Y/N)');
      rl.question('> ', (answer) => {
		answer = answer.toLowerCase();
        switch (answer) {
          case 'y':
          case 'yes':
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
  fs.writeFileSync('todos.json', JSON.stringify(todos, null, 2), 'utf8');
}

console.clear = function() {
  return process.stdout.write('\033c\033[3J');
};

let todos;
loadFile();


/*
const text = 'KEKEKEKE -17';
const validate = getNumber(text);
console.log(validate.is);
*/