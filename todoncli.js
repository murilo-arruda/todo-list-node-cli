const readline = require('readline');
const fs = require('fs');
const sleep = require('util').promisify(setTimeout);

const TODOS_PATH = 'todos.json';
// TODOS     = file of todos
// GROUPS    = array with the name of all groups
// CUR_NAME  = <current id> of the group in <groups>
// CUR_GROUP = all the current todos of the current group
let TODOS, groups, CUR_GROUP, CUR_NAME;





//
// Data Functions
//

// Load all the files or create them
const loadFile = () => {
  try {
    TODOS = JSON.parse(fs.readFileSync(TODOS_PATH, 'utf8'));
    // load all the groups and return their names
    groups = Object.keys(TODOS);
    // choose the first group (default)
    CUR_NAME = 0;
    CUR_GROUP = TODOS[groups[CUR_NAME]];
    askForATask();

  } catch (err) {

    if (err.code === 'ENOENT') {

      const TEMPLATE_TODOS = ' ' + {
        "default": [
          {
            "isChecked": false,
            "text": "Check me to test if is working!",
            "lastUpdated": Date.now()
          },
          {
            "isChecked": true,
            "text": "You can remove this template todo!",
            "lastUpdated": Date.now()
          }
        ]
      };

      // if is missing both files generate them
      fs.writeFileSync(TODOS_PATH, TEMPLATE_TODOS, 'utf8');

      TODOS = JSON.parse(fs.readFileSync(TODOS_PATH, 'utf8'));
      // load all the groups and return their names
      groups = Object.keys(TODOS);
      // choose the first group (default)
      CUR_GROUP = TODOS[groups[0]];

      return askForATask();
    } else {
      console.log(err);
      process.exit(0);
    }
  }
}

// Save files
const saveData = () => {
  // just save if there's any change (optimization)
    fs.writeFileSync(TODOS_PATH, JSON.stringify(TODOS, null, 2), 'utf8');
    
    // |, null, 2| for prettier output
}


//
// Initialize
//

// Colors method for colorize terminal output
const res = '\x1b[0m';
const colors = {
  white: m => {
    return `\x1b[90m${m + res}`;
  },
  bwhite: m => {
    return `\x1b[1m${m + res}`;
  },
  inverse: m => {
    return `\x1b[7m${m + res}`;
  },
  underline: m => {
    return `\x1b[4m${m + res}`;
  }
}

// To get commands and ouputs
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Redefines console.clear for full clean output (windows and linux)
console.clear = () => {
  process.stdout.write("\u001b[2J\u001b[0;0H");
  process.stdout.write('\033c\033[3J');
};

// Start the program
const start = () => {
  console.clear();
  TODOS, groups, CUR_GROUP, CUR_NAME = undefined;
  loadFile();
}


// CONST FUNCTIONS = Program functions
// NORMAL FUNCTIONS = Commands functions

//
// Methods and functions
//

// Group Functions

const updateGroups = all => {
  groups = Object.keys(TODOS);
  // if just needs to load the groups
  // then pass 1 to all (param)
  if (all !== 1) CUR_GROUP = TODOS[groups[CUR_NAME]];
}

// show group to see now
function showGroup(WANTED) {
  // if group exists
  if (TODOS[WANTED]) {
    groups.every((group, index) => {
      // Do your thing, then:
      if (WANTED === group) {
        CUR_NAME = index;
        // break loop
        return false;
      }
      else return true;
    });
    updateGroups();
  }
  else return alert('This group doesn\'t exist');
}

// tab to next group
function tabGroup(reverse) {
  if (groups.length > 1) {
    if (reverse) {
      // if gets in the start then back to end
      if (0 === CUR_NAME)
        CUR_NAME = groups.length - 1;
      // or just back
      else CUR_NAME--;
    } else {
      // if gets in the end then back to start
      if (groups.length - 1 === CUR_NAME)
        CUR_NAME = 0;
      // or just go to next
      else CUR_NAME++;
    }
  }
}

async function nameGroup(args) {
  // must be only two args
  if (args.length === 2) {
    const NAME = args[0];
    const WANTED = args[1];

    try {
      if (TODOS[WANTED])
        throw 'You have to chose a name that isn\' taken.';

      else if (TODOS[NAME]) {
        TODOS[WANTED] = TODOS[NAME];
        // select the new group
        // > groups list
        CUR_NAME = groups.length - 1;
        // > TODOS list
        CUR_GROUP = TODOS[WANTED];

        // delete old group
        delete TODOS[NAME];
      }

      else
        throw 'Please, chose a group that exists.';
        
    }
    catch (e) {
      await alert(e);
    }
  }
}


async function removeGroup(args) {
  // must be only one arg
  // and always have to exist at least two groups
  if (args.length === 1 && groups.length > 1) {
    try {

      const GROUP = args[0];

      // verify if this group exist
      if (!TODOS[GROUP]) return await alert('This group doesn\'t exist.');

      switch (GROUP) {

        // if it's the first group then just back to normal
        case groups[0]:
          CUR_NAME = 0;
          break;

        // verify if there's the same group 
        // that is being used right now
        case groups[CUR_NAME]:
          CUR_NAME = CUR_NAME - 1;
          break;

        // does nothing if you are not
        // removing a group that is
        // being used
        default: 
      }

      // delete group
      return delete TODOS[GROUP];

    }
    catch (e) {
      return alert(e, true);
    }
  }
}

async function addGroup(args) {
  // must be only one arg
  if (args.length === 1) {
    const NAME = args[0];
    // verify if group already exists
    if (TODOS[NAME]) return await alert('This group already exists...');

    // create group with the name
    else return TODOS[NAME] = [];
  }
}

async function checkGroup(args) {
  if (args.length === 1) {
    const NAME = args[0];

    // verify if the group exists
    if (!TODOS[NAME]) return await alert('This group doesn\'t exist.');

    // show group if isn't selected
    if (groups[CUR_NAME] !== NAME) showGroup(NAME);

    // check them all
    checkTodos([`0-${TODOS[NAME].length}`]);

    return;
  }
}

// Todos Functions

// retrieve index of an number argument
const getIndex = (text) => {
  const patt = /^-\d+\b|-\d/;
  const lastWord = text[text.length - 1];
  let index;
  if (patt.test(text[0])) {
    index = text[0];
    text.splice(0, 1);
  }
  else if (patt.test(lastWord)) {
    index = lastWord;
    text.splice(text.length - 1, 1);
  }
  // returns if there is no index
  else return 1;
  // remove minus
  index = parseInt(index.replace('-', ''));
  // if returns that the number return is not in the rules
  if (index > CUR_GROUP.length - 1 || index < 0) return 2;
  return {
     text: text.join(' '),
     index,
  };
}

// add normally in todos files (by pushing)
function addNormalTodo(text) {
  CUR_GROUP.push({
    isChecked: false,
    text,
    lastUpdated: Date.now(),
  });
}

// Timed Todos Functions

// parse minutes and index for a timed todo
const parseMinutesIndex = (args) => {
  const textJ = args;
  let time;
  // pattern for number with minus as prefix
  const patt = /^-\d+\b|-\d/;
  let index, minutes, text;
  let lastArg = textJ[textJ.length - 1];
  let penultArg = textJ[textJ.length - 2];
  // if the input is like (at todo -minutes)
  if (patt.test(lastArg) && patt.test(penultArg) === false && patt.test(args[0]) === false) {
    // parse as normal number for index
    minutes = parseInt(lastArg.replace('-', ''));
    // remove minutes of the text
    textJ.splice(textJ.length - 1, 1);
  }
  // if the input is like (at -minutes todo)
  else if (patt.test(args[0]) && patt.test(lastArg) === false) {
    // parse as normal number for index
    minutes = parseInt(args[0].replace('-', ''));
    // remove minutes of the text
    textJ.splice(0, 1);
  }
  // if the input is like (at todo -minutes -index) then
  else if (patt.test(penultArg) && patt.test(lastArg)) {
    // parse as normal number for minutes
    penultArg = parseInt(penultArg.replace('-', ''));
    // convert minutes to miliseconds
    minutes = penultArg;
    // parse as normal number for index
    index = parseInt(lastArg.replace('-', ''));
    // if index is invalidate
    if (index < 0 || index > CUR_GROUP.length - 1) return 1;
    // remove index and minutes of the text
    textJ.splice(textJ.length - 2, 1);
    textJ.splice(textJ.length - 1, 1);
  }
  // or if the input is like (at -minutes todo -index)
  else if (patt.test(args[0]) && patt.test(lastArg)) {
    // parse as normal number for minutes and convert it to miliseconds
    minutes = parseInt(args[0].replace('-', ''));
    // parse as normal number for index
    index = parseInt(lastArg.replace('-', ''));
    // if index is invalidate
    if (index < 0 || index > CUR_GROUP.length - 1) return 1;
    // remove index and minutes of the text
    textJ.shift();
    textJ.splice(textJ.length - 1, 1);
  };
  text = textJ.join(' ');
  minutes = minutes * 60000;
  return { text, index, minutes };
} 

// Add todo to be repeated
function addTodoTimed(args) {
  if (args.length > 1) {
    // validate the args with every unique possibility
    const validate = parseMinutesIndex(args);
    // if index is invalidate returns nothing
    if (validate === 1) return false; 
    // if has index then add with index
    if (validate.index !== undefined && validate.minutes && validate.text) {
      const dateNow = Date.now();
      CUR_GROUP.splice(validate.index, 0, {
        isChecked: false,
        text: validate.text,
        repeatTime: validate.minutes,
        lastRepeated: dateNow,
        lastUpdated: dateNow,
      });
    }
    // if just has minutes and text then add
    else if (validate.text && validate.minutes) {
      const dateNow = Date.now();
      CUR_GROUP.push({
        isChecked: false,
        text: validate.text,
        repeatTime: validate.minutes,
        lastRepeated: dateNow,
        lastUpdated: dateNow,
      });
    }
  }
  // command output:
  // NORMAL
  // at todo -minutes
  // at -minutes todo
  // at todo -minutes -index
  // at -minutes todo -index
}

// Edit the old time of the loopable todo to a new one
function editTimed(args) {
  // always two args (first: todo; second: time in minutes)
  if (args.length === 2) {
    // need always be a number
    if (/[^\d+]/.test(args[0])) return false;
    // if the number is bigger or lower than expected
    if (args[0] < 0 || args[0] > CUR_GROUP.length - 1) return false;
    // make todo easier for code
    const todo = CUR_GROUP[args[0]];
    // if todo is loopabe
    const loopable = todo.repeatTime;
    // change repeat Time to the new
    if (loopable) {
      // convert to miliseconds
      const newTime = args[1] * 60000;
      // change the old time to the new one
      todo.repeatTime = newTime;
    }
  }
}

// Test todos if their time already passed
const testTimedTodos = () => {
  // verify each todo in the actual group
  CUR_GROUP.forEach(todo => {
    // if todo is loopable
    const loopable = todo.repeatTime;
    if (loopable) {
      const dateNow = Date.now();
      const lastTimeTodo = todo.lastRepeated + todo.repeatTime;
      // if that already passed then resets it
      if (dateNow >= lastTimeTodo) {
        todo.isChecked = false;
        todo.lastRepeated = dateNow;
        todo.lastUpdated = dateNow;
      }
    }
  });
}

const alert = async (message, critical, time) => {
  // types
  // false = warning  = warn user to use correctly 
  // true  = error    = break program

  let out = critical ? 'CRITICAL' : 'WARNING';
  const TIMEOUT = time ? time : 1500;

  // prettier type with terminal size
  while (out.length < process.stdout.columns)
    out = out + ' ';

  console.clear();

  // top bar
  console.log(colors.inverse(out) + '\n');

  console.log(message + '\n');

  console.log(colors.inverse(out) + '\n');

  // if it's critical then just stop the program
  if (critical) return process.exit();

  // 1.5 segunds timeout
  await sleep(TIMEOUT);

  return;
  
}

const testSeparator = (type, index) => {
  // if exists index
  if (typeof index === 'number') {
    switch (type) {
      case 'line':
      case 'l':
        CUR_GROUP.splice(index, 0, {
          separator: true,
          text: '-'
        });
        break;
      case 'transparent':
      case 'tr':
        CUR_GROUP.splice(index, 0, {
          separator: true,
          text: ' '
        });
        break;
      default:
        CUR_GROUP.splice(index, 0, {
          separator: true,
          text: type
      });
    }
  } else {
    switch (type) {
      case 'line':
      case 'l':
        CUR_GROUP.push({
          separator: true,
          text: '-'
        });
        break;
      case 'transparent':
      case 'tr':
        CUR_GROUP.push({
          separator: true,
          text: ' '
        });
        break;
      default:
        CUR_GROUP.push({
          separator: true,
          text: type
        });
    }
  }
}

// People now doesn't care more about getting
// offended, they are just searching something that
// they can be offended.
// Normal Todos Functions

// Add separator todo in todos files
function addSeparator(text) {
  if (text.length === 1) {
    // if the type doesn't have anything at
    // all just reload
    if (text[0].length === 0) return;
    // ...
    return testSeparator(text[0]);

  } else if (text.length >= 2) {
    const validate = getIndex(text);

    if (typeof validate.index === 'number')
      return testSeparator(validate.text, validate.index);

    else return testSeparator(text.join(' '));
  }
  else {  
    return CUR_GROUP.push({
      separator: true,
      text: '-'
    });
  };
}

// Add todo in todos files (command check and index) 
function addTodo(text) {
  if (text.length > 0) {
    // parse text and return index if theres any
    const validate = getIndex(text);
    switch (validate) {
      case 1: // if returns that there is no index
      case 2: // if returns that the given index is not in the rules
              // (bigger than actual length of the group)
        return addNormalTodo(text.join(' '));
        break;
      default:
        CUR_GROUP.splice(validate.index, 0, {
          isChecked: false,
          text: validate.text,
          lastUpdated: Date.now(),
        });
    };
  }
}

// Edit todo method
function editTodo(text) {
  if (text.length > 0) {
    // parse text and return index if theres any
    const validate = getIndex(text);
    // if returns that there is no index
    if (validate === 1) return addNormalTodo(text.join(' '));
    // if returns that the number return is not in the rules
    else if (validate === 2) return;
    CUR_GROUP[validate.index].text = validate.text;
  }
}

// Verify two numbers in a method that reads two numbers and returns true if everything is okay :3 
function verifyTwoNumbers(args) {
  // always need two arguments
  if (args.length !== 2) return false;
  for (item of args) {
    // need always be a number
    if (/[^\d+]/.test(item)) return false;
    // if the number is bigger or lower than expected
    if (item < 0 || item > CUR_GROUP.length - 1) return false;
  }
  return true;
}

// Returns an array with the min value first and the max value at the end
function organizeTwoNumbers(args) {
  // parse to numbers
  const first = parseInt(args[0]);
  const second = parseInt(args[1]);
  // if the end is lower than the start switch and then return their values
  if (second < first) return [second, first];
  else return [first, second];
}

// Switch todo
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

// Copy a todo to another place
function copyTodo(args) {
  // if theres only the todo you want to move then default position to move is the last one
  if (args.length === 1) args.push(CUR_GROUP.length);
  // verify both numbers
  if (verifyTwoNumbers(args) === false) return;
  // first is the todo you want to copy
  const todo = CUR_GROUP[args[0]];
  // second the index you want to put
  const index = args[1];
  // copy it
  CUR_GROUP.splice(index, 0, todo); 
}

function moveTodo(args) {
  // if theres only the todo you want to move then default position to move is the last one
  if (args.length === 1) args.push(CUR_GROUP.length);
  // verify both numbers
  if (verifyTwoNumbers(args) === false) return;
  // first is the todo you want to move
  const todo = CUR_GROUP[args[0]];
  // second the index you want to put
  const index = args[1];
  // remove the current todo of the todos.json
  CUR_GROUP.splice(args[0], 1);
  // move it
  CUR_GROUP.splice(index, 0, todo); 
}

// Range In between two numbers and return their indexes
function rangeIn(ids) {
  ids = [ids];
  let [start, end] = ids[0].split('-');
  // if the index given is bigger than how much you have
  if (start > CUR_GROUP.length || CUR_GROUP.length < end) return;
  if (start < 0 && end < 0 ) return;
  const args = organizeTwoNumbers([start, end]);
  let validate = [];
  for (let i = args[0]; i <= args[1]; i++) validate.push(i.toString());
  return validate;
}

function checkTodos(ids) {
  // verify if there's any item with range in
  ids.forEach((id, index) => {
    id = id.toString();
    // 13-45 match
    if (/\d+-\d+/g.test(id)) {
      // range the item
      const validate = rangeIn(id);
      // remove range item
      ids.splice(index, 1);
      // add ranged items
      ids = ids.concat(validate);
    };
  });
  // loop for change each id
  ids.forEach(id => {
    if (CUR_GROUP[id] && !CUR_GROUP[id].separator) {
      const ischecked = !CUR_GROUP[id].isChecked;
      CUR_GROUP[id].isChecked = ischecked;
      CUR_GROUP[id].lastUpdated = Date.now();
    }
  });
}

function removeTodos(ids) {
  if (ids.length === 0) return;
  // verify if there's any item with range in
  ids.forEach((item, index) => {
    item = item.toString();
    if (/[a-zA-Z]/g.test(item)) return;
    // 13-45 match
    if (/\d+-\d+/g.test(item)) {
      // range the item
      const validate = rangeIn(item);
      // remove range item
      ids.splice(index, 1);
      // add ranged items
      ids = ids.concat(validate);
    };
  });
  ids.sort((a, b) => b - a);
  ids.forEach(id => {
    id = parseInt(id);
    if (CUR_GROUP[id]) CUR_GROUP.splice(id, 1);
  });
}

// Copy to clipboard method
async function getCopy(ids) {
  if (ids.length === 1 // always one argument (todo to get text)
      && CUR_GROUP[ids[0]]) { // the id has to exist, of course

    const TEXT = CUR_GROUP[ids[0]].text;
    const EXEC = require('child_process').exec;
  
    switch (process.platform) {
      case 'linux':
        EXEC(`echo -n "${TEXT}" | xclip -sel clip`);
        break;
      case 'win32':
          proc = require('child_process').spawn('clip'); 
          proc.stdin.write(TEXT);
          proc.stdin.end();
        break;
      case 'darwin':
        EXEC(`echo -n ${TEXT} | pbcopy`);
        break;
      default:
        await alert('Please report the OS you use in the our repository!\nhttps://github.com/Koetemagie/todoncli.git');
    }
  }
}

// Delete all the checked todos
function remCheckedTodos() {
  let ids = CUR_GROUP.map((item, index) => {
    if (item.isChecked === true) return index;
  });
  ids = ids.filter(item => item !== undefined);
  removeTodos(ids);
}


//
// Predefined Outputs
//

const roundIt = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

// Format todo time for showTodos function
const formatTodoTime = (time, repeatTime, lastRepeated) => {
  let output;
  if (repeatTime === undefined) {
    const date = new Date(time);
    // make date prettier
    let specials = [date.getDate(), (date.getMonth() + 1), date.getHours(), date.getMinutes()];
    specials = specials.map(item => {
      item = item.toString();
      while (item.length <= 1) item = `0${item}`;
      return item;
    });
    output = `${specials[0]}/${specials[1]}/${date.getFullYear()} ${specials[2]}:${specials[3]}`;
  }
  else {
    const now = Date.now();
    let time = ((repeatTime + lastRepeated) - now) / 60000;
    if (time > 60 && time < 1440)
      time = `-${roundIt(time / 60)}h`;    // Hours
    else if (time > 1440 && time < 10080)
      time = `-${roundIt(time / 1440)}d`;  // Days
    else if (time > 10080 && time < 43800)
      time = `-${roundIt(time / 10080)}w`; // Weeks
    else if (time > 43800)
      time = `-${roundIt(time / 43800)}m`; // Months
    output = time;
  }
  // make output prettier
  while (output.length < 16) output = ` ${output}`;
  return output;
}

// Show documentation
function showHelp() {
  const HELP_ALL_COMMANDS = [
    [ ['add', 'a'],
      'Add a new todo. Default is in the main list, if you want to add in a index then add in the end the index number with minus   prefix.',
      'add my new task',
    ],
    [ ['check', 'x'],
      'Checkmark the items. This will check the first item and the third. If you want to check only one, then just type the index.',
      'check 0 2',
    ],
    [ ['edit', 'ed'],
      'This will replace the indexed to-do to another. Same usage of add command.',
      'edit this one is the new -5',
    ],
    [ ['switch', 's'],
      'This will switch the indexed to-do to another. There is no default!',
      'switch 1 5',
    ], 
    [ ['copy', 'c'],
      'This will copy the indexed to-do to other position. Default position is the last.',
      'copy 2 4',
    ], 
    [ ['move', 'm'],
      'This will move the indexed to-do to other position.',
      'move 9 6',
    ], 
    [ ['rem', 'r'],
      'This will remove the selected to-do. If you want to remove more, just separate the arguments with spaces.',
      'rem 0 1',
    ],
    [ ['get', 'g'],
      'This will copy to clipboard the indexed todo.',
      'get 5',
    ],
    [ ['remcheckeds', 'rc'],
      'This will remove all the the checked to-dos.',
      'remcheckeds',
    ],
    [ ['help', 'h'],
      'Show this. Duh :3',
      'help',
    ],
    [ ['license', 'l'],
      'Show the license of the software.',
      'license',
    ],
    [ ['remcheckeds', 'rc'],
      'Remove the checkeds to-dos.',
      'remcheckeds',
    ],
    [ ['addgroup', 'ag'],
      'Create a new group of to-dos. This helps you to organize better the types of to-dos you have.',
      'addgroup NewWorld',
    ],
    [ ['showgroup', 'sg'],
      'Show the selected group.',
      'showgroup VidaLouca',
    ],
    [ ['remgroup', 'rg'],
      'Delete the selected group.',
      'remgroup NewWorld',
    ],
    [ ['checkgroup', 'cg'],
      'Check the todos of the selected group.',
      'checkgroup NewWorld',
    ],
    [ ['namegroup', 'ng'],
      'Name the selected group. First is the group you want to rename and then the name you want.',
      'namegroup NewWorld VidaLouca',
    ],
    [ ['edittime', 'et'],
      'Edit the time of the selected todo to a new one. In example change the time of 5th todo to 60 minutes.',
      'et 5 60',
    ],
    [ ['addseparator', 'as'],
      'Add a line to separate todos in a group. You can use them as titles or just white spaces.',
      'as -0 New Title',
    ],
    [ ['addtime', 'at'],
      'Add a todo which will loop in a certain time.',
      'addtime Do this every hour -60',
    ],
    [ ['tab', 't'],
      'Show next group.',
      'tab',
    ],
    [ ['restart', 'rs'],
      'Restart the program. :|',
      'restart',
    ],
    [ ['exit', 'e'],
      'Exit the program. :|',
      'exit',
    ],
  ];

  let VERSION = '2.0';
  const NAME = 'TodoNcli (^o^)/';
  const SYNOPSIS = 'Manage your todos anytime using command line!\r\nEvery change will be saved in your drive.';
  const USAGE = `Usage: ${colors.inverse('command [arguments]')} - the arguments are space separated!`;
  const LEAVE = 'To leave, just press anything!';

  const TWO_BWHITE_LENGTH = `${colors.inverse('')}`.length
                          + `${colors.inverse('')}`.length;

  // put version in the right
  while (VERSION.length < process.stdout.columns - NAME.length)
    VERSION = ' ' + VERSION;

  console.log(NAME + VERSION + '\n');
  console.log(SYNOPSIS + '\n' + USAGE + '\n' + LEAVE + '\n');

  HELP_ALL_COMMANDS.forEach(ITEM => {
    const COMMANDS = ITEM[0];
    const EXPLANATION = ITEM[1];
    let example = ITEM[2];

    const COMMANDS_OUTPUT = `${colors.bwhite(COMMANDS[0])} or ${colors.bwhite(COMMANDS[1])}`;

    // 0X0001 please see "const topBarTodos = ()"'s comments for the explanation
    // put example in right
    while (example.length < (process.stdout.columns
                             - COMMANDS_OUTPUT.length + TWO_BWHITE_LENGTH) )
           example = ' ' + example;

    console.log(COMMANDS_OUTPUT + example);

    return console.log(EXPLANATION + '\n');

  });

}

// Show the license :|
function showLicense() {
  return console.log(`
  todoncli

  Copyright © 2020-2020 Koetemagie
  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without │ restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 `);
}

// ???
function showProtec() {
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

const topBarTodos = maxIdLength => {
  let id = 'ID';                                                         // inconstant length item
  let check = 'Check';                                                   // 3 length item
  //let brazilianDateType = false;                                       // day first | true or false
  let todosName = groups[CUR_NAME];                                    // inconstant length item
  let date = 'Date';                                                     // 2 to 18 length item
  const maxTodosLength = (function () {                                  // inconstant length
    const texts = CUR_GROUP.map(t => t.text);
    return Math.max(...(texts.map(el => el.length)));
  })();

  const minColumns = 15;                                                 // min column task size

  // make ID have the same size of the largest item
  while (id.length < maxIdLength) id = ` ${id}`;
  // make date have the same size of the items
  while (date.length < 16) date += ' ';

  // part without group's name

  // 0X0001 when adding colors in a string we have to add characters for the terminal
  // read them as colors
  // because of that they are counted when getting they length
  // for fix this we have to call the functions that add colors and remove them the times
  // that wee add to the string
  // in this case it is 3, then we call them 3 and remove them length to not be counted
  // yes
  // its weird
  // but what can i do, right?
  // its javascript afterall
  const lengthColorsRemove = `${colors.inverse('')}`.length +
                             `${colors.inverse('')}`.length +
                             `${colors.inverse('')}`.length + 1;
  
  const startPart = `${colors.inverse(id)} ${colors.inverse(check)} ${colors.inverse(date)}`;


  const startPartLength = startPart.length - lengthColorsRemove;
  // -1 because terminal sometimes read more one line with a custom rezise
  let columnsTerminal = process.stdout.columns - startPartLength;

  // make check have the same size of the largest item
  // minus 2 because this has to count the 2 spaces
  while (todosName.length < columnsTerminal - 2) todosName += ' ';
  // min length for task string...
  if (columnsTerminal < minColumns) columnsTerminal = minColumns;

  // top bar
  console.log(`${startPart} ${colors.inverse(todosName)}\n`);
  return startPartLength; // Return columsTerminal
}

// show groups in showTodos function
const bottomPartGroups = () => {
  const COLUMNS = process.stdout.columns;

  // map array to underline the actual group
  const newGroups = groups.map((group) => {

    // colorize group that already is fully checked
    const isComplete = (function() {
      // return if is checked of every item
      const MAP_IS_CHECKED = TODOS[group].map(todo => todo.isChecked);

      // if theres one false then returns false
      for (item of MAP_IS_CHECKED)
        if (item === false) return false;

      // if everything goes perfectly then returns true
      return true;

    })();
    
    switch (group) {
      // is selected?
      case groups[CUR_NAME]:
        // colorize group that is fully checked 
        if (isComplete) return colors.underline(colors.white(group));
        // just underline it if it's selected
        else return colors.underline(group);
        break;

      default:
        // return group that is fully checked
        if (isComplete) return colors.white(group);
        else return group;
    }

  });

  // put groups in center
  let groupsString = newGroups.join(' ');
  while (groupsString.length < COLUMNS)
    groupsString = ` ${groupsString} `;

  return console.log(`\n${groupsString}\n`);

};

const showTodos = () => {
  // inconstant length
  let maxIdLength = (CUR_GROUP.length.toString()).length;
  // group information
  const startPartLength = topBarTodos(maxIdLength);
  const columnsTerminal = process.stdout.columns - startPartLength - 2;
  const columnsSeparator = process.stdout.columns - maxIdLength - 2;

  // Todos
  CUR_GROUP.forEach((todo, index) => {
    // prettier the index in the output to be
    // the exactly width of the last todo's index
    index = index.toString();
    while (index.length < maxIdLength || index.length < 2) index = ` ${index}`;

    // if it is a separator
    if (todo.separator) {
      let separator = todo.text;

      if (separator.length === 1)
        while (separator.length <= columnsSeparator - 1) separator += todo.text;
      else
        while (separator.length <= columnsSeparator - 2) separator = ` ${separator} `;

      return console.log(colors.white(`${index} ${separator}`));
    };


    const task = todo.text;
    const activity = todo.isChecked ? '»' : '>';
    const status = todo.isChecked ? '(+)' : '( )';
    const color = todo.isChecked ? colors.white : colors.bwhite;
    const actualTime = formatTodoTime(
      todo.lastUpdated,
      todo.repeatTime,
      todo.lastRepeated);


    // for every todo there's a start string 
    const startString = `${index} ${color(status)} ${color(activity)} ${colors.white(actualTime)}`;


    if (task.length > columnsTerminal) {
      let separator = '';
      while (separator.length <= startPartLength + 1) separator += ' ';

      const matchLimit = new RegExp(`.{1,${columnsTerminal}}`, 'g');
      const allStrings = task.match(matchLimit);

      allStrings.forEach((string, si) => {
        // output final for the first line of the task > show data, status
        if (si === 0)
          console.log(`${startString} ${color(string)}`);
        // output final for the rest of the lines > only task
        else {
          string = string.replace(/^\s/, '');
          while (string.length < columnsTerminal) string += ' ';
          console.log(separator + color(string));
        }
      });
    } else console.log(`${startString} ${color(task)}`);
  });


  // groups
  bottomPartGroups();
};

//
// Read Arguments
//

// Ask for a command
const askForATask = TYPE => {
  console.clear();
  // show
  // 1 = documentation, commands
  // 2 = ???
  // 3 = license
  //   = todos of the group
  switch (TYPE) {
    case 1: showHelp();
      break;
    case 2: showProtec();
      break;
    case 3: showLicense();
      break;
    default: showTodos();
  }

  // test timed todos to update their times
  testTimedTodos();

  rl.question('> ', ANSWER => {
    let [answer, ...args] = ANSWER.split(' ');
    checkTask(answer, args);
  });

  return;
}

// Get command and pass to function
const checkTask = async (answer, args) => {
  let TYPE;

  // make it always lowercase to be read
  answer = answer.toLowerCase();

  switch (answer) {

    //
    // groups
    //
    case 'showgroup':
    case 'sg':
      await showGroup(args.toString());
      TYPE = 0;
      break;
    case 'checkgroup':
    case 'cg':
      await checkGroup(args);
      updateGroups();
      break;
    case 'addgroup':
    case 'ag':
      await addGroup(args);
      updateGroups(1);
      break;
    case 'remgroup':
    case 'rg':
      await removeGroup(args);
      updateGroups();
      break;
    case 'namegroup':
    case 'ng':
      await nameGroup(args);
      updateGroups(1);
      // the group is selected in the function
      // since it's referring to a object name
      // and it's easier and faster to use this way.
      break;

    case 'rc':
    case 'remcheckeds':
      if (args.length > 0) await alert(
        'This command does not accept arguments, please if you are not in the selected group, go there and use from there.'
        , false, 3000);
      else remCheckedTodos();
      break;

    case 'tab':
    case 't':
      tabGroup();
      updateGroups();
      TYPE = 0;
      break;
    case 'tabreverse':
    case 'tr':
      tabGroup(true); // true > reverse true
      updateGroups();
      TYPE = 0;
      break;

    //
    // todos
    // 
    case 'a':
    case 'add':
      addTodo(args);
      break;
    case 'x':
    case 'check':
      checkTodos(args);
      break;
    case 's':
    case 'switch':
      switchTodo(args);
      break;
    case 'as':
    case 'addseparator':
      addSeparator(args);
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
    case 'g':
    case 'get':
      getCopy(args);
      TYPE = 0;
      break;
    case 'h':
    case 'help':
      TYPE = 1;
      break;
    case 'protec':
      TYPE = 2;
      break;
    case 'l':
    case 'license':
      TYPE = 3;
      break;
    case 'ed':
    case 'edit':
      editTodo(args);
      break;

    case 'et':
    case 'edittime':
      editTimed(args);
      break;
    case 'at':
    case 'addtime':
      addTodoTimed(args);
      break;

    // 
    // program
    // 
    case 'rs': 
    case 'restart':
      start();
      break;
    case 'e':
    case 'exit':
      saveData();
      console.clear();
      rl.close();
      process.exit();
      break;

    default: TYPE = 0;
  }

  if (TYPE === undefined)
    saveData();
  askForATask(TYPE);
  return;
}

start();