const readline = require('readline');
const fs = require('fs');

//
// Methods and functions
//

// Group Functions

// show group to see now
function showGroup(wanted) {
  if (wanted.length > 0) {
    groups.forEach((group, i) => {
      if (wanted === group) actualName = i;
    });
  }
}

// tab to next group
function tabGroup() {
  if (groups.length > 1) {
    if (groups.length - 1 === actualName) actualName = 0;
    else actualName++;
    // reload actual group
    actualGroup = todos[groups[actualName]];
  }
}

function nameGroup(args) {
  // must be only two args
  if (args.length === 2) {
    //todos.Prop3 = a.Prop1;
    const wanted = args[0].toString();
    const name = args[1].toString();
    groups.forEach((group, i) => {
      if (wanted === group) {
        try {
          if (i === actualName) actualName = groups.length - 1;
          todos[name] = todos[wanted];
          delete todos[wanted];
        }
        catch (e) { 
          console.log("An error occured trying to copy the group with a new name. ", e);
        }
      }
    });
  } 
}

function remGroup(args) {
  // must be only one arg
  if (args.length === 1) {
    try {
      groups.forEach((group, i) => {
      if (group === args[0]) actualName = i - 1;
      });
      delete todos[args[0]];
    }
    catch (e) {
      console.log("An error occured trying to remove this group.", e);
    }
  }
}

function addGroup(args) {
  // must be only one arg
  if (args.length === 1) {
    todos[args[0]] = [];
  }
}

function checkGroup(args) {
  if (args.length === 1) {
    showGroup(args[0]);
    checkTodos([`0-${actualGroup.length}`]);
  }
}

// Redo Functions

// add redo to file
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

// test todo if it's getting any alteration
function testTodoRedo(command, id) {
  redos.forEach((item, ii) =>{
    if (id === item.index) {
      switch(command) {
        case 'rem':
          redos.splice(ii, 1);
        break;
      }
    }
  });
}

// retrieve redo of file
function redoAction() {
  if (redos.length === 0) return;
  const redo = redos[0];
  switch(redo.command) {
    case 'add':
      // remove todo added
      actualGroup.splice(redo.index, 1);
      break;
    case 'check':
      //
      break;
    case 'rem':
      // add todo removed
      actualGroup.push(redo.object);
      break;
    case 'edit':
      //
      break;
  }
  redos.shift();
}

// Todos Functions

// retrieve index of an number argument
function getIndex(text) {
  const patt = /^-\d+\b|-\d/;
  const lastWord = text[text.length - 1];
  let index;
  // get index in the start or in the end of the text
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
  if (index > actualGroup.length - 1 || index < 0) return 2;
  return {
     text: text.join(' '),
     index,
  };
}

// add normally in todos files (by pushing)
function addNormalTodo(text) {
  addRedo('add', actualGroup.length);
  actualGroup.push({
    isChecked: false,
    text,
    lastActivity: '>',
    lastUpdated: Date.now(),
  });
}

// Timed Todos Functions

// parse minutes and index for a timed todo
function parseMinutesIndex(args) {
  const textJ = args;
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
    if (index < 0 || index > actualGroup.length - 1) return 1;
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
    if (index < 0 || index > actualGroup.length - 1) return 1;
    // remove index and minutes of the text
    textJ.shift();
    textJ.splice(textJ.length - 1, 1);
  };
  text = textJ.join(' ');
  return {
    text,
    index,
    minutes: minutes * 60000
  }
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
      actualGroup.splice(validate.index, 0, {
        isChecked: false,
        text: validate.text,
        lastActivity: '>',
        repeatTime: validate.minutes,
        lastRepeated: dateNow,
        lastUpdated: dateNow,
      });
    }
    // if just has minutes and text then add
    else if (validate.text && validate.minutes) {
      const dateNow = Date.now();
      actualGroup.push({
        isChecked: false,
        text: validate.text,
        lastActivity: '>',
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
  // NEVER
  // at -index todo          => at -minutes todo
  // at todo -index          => at todo -minutes
  // at -index todo -minutes => at -minutes todo -index
  // at todo                 => nothing
}

// Edit the old time of the loopable todo to a new one
function editTimed(args) {
  // always two args (first: todo; second: time in minutes)
  if (args.length === 2) {
    // need always be a number
    if (/[^\d+]/.test(args[0])) return false;
    // if the number is bigger or lower than expected
    if (args[0] < 0 || args[0] > actualGroup.length - 1) return false;
    // make todo easier for code
    const todo = actualGroup[args[0]];
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
function testTodos() {
  // verify each todo in the actual group
  actualGroup.forEach(todo => {
    // if todo is loopable
    const loopable = todo.repeatTime;
    if (loopable) {
      const dateNow = Date.now();
      const lastTimeTodo = todo.lastRepeated + todo.repeatTime;
      // if that already passed then resets it
      if (dateNow >= lastTimeTodo) {
        todo.lastActivity = '>';
        todo.isChecked = false;
        todo.lastRepeated = dateNow;
        todo.lastUpdated = dateNow;
      }
    }
  });
}

// Normal Todos Functions

// Add todo in todos files (command check and index) 
function addTodo(text) {
  if (text.length > 0) {
    // parse text and return index if theres any
    const validate = getIndex(text);
    // if returns that there is no index
    if (validate === 1) return addNormalTodo(text.join(' '));
    // if returns that the number return is not in the rules
    else if (validate === 2) return addNormalTodo(text.join(' '));
    else {
      actualGroup.splice(validate.index, 0, {
        isChecked: false,
        text: validate.text,
        lastActivity: '>',
        lastUpdated: Date.now(),
      });
    }
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
    actualGroup[validate.index].text = validate.text;
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
    if (item < 0 || item > actualGroup.length - 1) return false;
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
  if (args.length === 1) args.push(actualGroup.length);
  // verify both numbers
  if (verifyTwoNumbers(args) === false) return;
  // first is the todo you want to copy
  const todo = actualGroup[args[0]];
  // second the index you want to put
  const index = args[1];
  // copy it
  actualGroup.splice(index, 0, todo); 
}

// Move todo
function moveTodo(args) {
  // if theres only the todo you want to move then default position to move is the last one
  if (args.length === 1) args.push(actualGroup.length);
  // verify both numbers
  if (verifyTwoNumbers(args) === false) return;
  // first is the todo you want to move
  const todo = actualGroup[args[0]];
  // second the index you want to put
  const index = args[1];
  // remove the current todo of the todos.json
  actualGroup.splice(args[0], 1);
  // move it
  actualGroup.splice(index, 0, todo); 
}

/* Range In between and return their indexes*/
function rangeIn(ids) {
  ids = [ids];
  let [start, end] = ids[0].split('-');
  // if the index given is bigger than how much you have
  if (start > actualGroup.length || actualGroup.length < end) return;
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
  ids.forEach((id) => {
    if (actualGroup[id]) {
      const ischecked = !actualGroup[id].isChecked;
      actualGroup[id].isChecked = ischecked;
      actualGroup[id].lastActivity = ischecked ? '»' : '>';
      actualGroup[id].lastUpdated = Date.now();
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
    testTodoRedo("rem", id);
    if (actualGroup[id]) actualGroup.splice(id, 1);
  });
}

/* Copy to clipboard method */
function getCopy(ids) {
  if (ids.length === 0) return;
  if (actualGroup[ids[0]]) {
    const data = actualGroup[ids[0]].text;

    switch (process.platform) {
      case 'linux':
        require('child_process').exec(`echo ${data} | xclip -sel clip`,
          (err, stdout, stderr) => console.log(stdout)
        );
        break;
      case 'win32':
          proc = require('child_process').spawn('clip'); 
          proc.stdin.write(data);
          proc.stdin.end();
        break;
      case 'darwin':
        require('child_process').exec(`echo ${data} | pbcopy`,
          (err, stdout, stderr) => console.log(stdout)
        );
        break;
      default:
        console.log('Please report the OS you use in the our repository! > (Koetemagie/todoncli)')
    }
  };
};

/* Delete all the checked todos */
function remCheckedTodos() {
  let ids = actualGroup.map((item, index) => {
    if (item.isChecked === true) return index;
  });
  ids = ids.filter(item => item !== undefined);
  removeTodos(ids);
}


//
// Predefined Outputs
//

// Show documentation
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
      'commands': ['get', 'g'],
      'explanation': 'This will copy to clipboard the indexed todo.',
      'example': 'get 5',
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
      'commands': ['remcheckeds', 'rc'],
      'explanation': 'Remove the checkeds to-dos.',
      'example': 'remcheckeds',
    },
    {
      'commands': ['addgroup', 'ag'],
      'explanation': 'Create a new group of to-dos. This helps you to organize better the types of to-dos you have.',
      'example': 'addgroup NewWorld',
    },
    {
      'commands': ['showgroup', 'sg'],
      'explanation': 'Show the selected group.',
      'example': 'showgroup VidaLouca',
    },
    {
      'commands': ['remgroup', 'rg'],
      'explanation': 'Delete the selected group.',
      'example': 'remgroup NewWorld',
    },
    {
      'commands': ['checkgroup', 'cg'],
      'explanation': 'Check the todos of the selected group.',
      'example': 'checkgroup NewWorld',
    },
    {
      'commands': ['namegroup', 'ng'],
      'explanation': 'Name the selected group. First is the group you want to rename and then the name you want.',
      'example': 'namegroup NewWorld VidaLouca',
    },
    {
      'commands': ['edittime', 'et'],
      'explanation': 'Edit the time of the selected todo to a new one. In example change the time of 5th todo to 60 minutes.',
      'example': 'et 5 60',
    },
    {
      'commands': ['addtime', 'at'],
      'explanation': 'Add a todo which will loop in a certain time.',
      'example': 'addtime Do this every hour -60',
    },
    {
      'commands': ['tab', 't'],
      'explanation': 'Show next group.',
      'example': 'tab',
    },
    /*{
      'commands': ['setwidth', 'sw'],
      'explanation': 'For set a new line width for the gui, it\'s only for resolve design bugs.',
      'example': 'setwidth',
    },*/
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
 │ ${colors.bwhite('TodoNcli v1.4')}                                                        ${colors.bwhite(2020)} │
 ├───────────────────────────────────────────────────────────────────────────┤
 │ Manage your todos anytime using command line!                             │
 │ Every change will be saved in your system.                                │\n${newLine}
 │ Usage: ${colors.inverse('command [arguments]')} - the arguments are space separated!           │
 ├───────────────────────────────────────────────────────────────────────────┤`);
  console.log(newLine);
  // console through helps
  helpFull.forEach(item => {
    let commands = ` │ ${colors.bwhite(item.commands[0])} or ${colors.bwhite(item.commands[1])}`;
    while (commands.length < 40) commands += ' ';
    let example = `${colors.inverse(item.example)}`;
    while (example.length < 60) example = ' ' + example;
    console.log(commands + example + ' │ ');
    let explanation = item.explanation;
    while (explanation.length < 73) explanation += ' ';
    if (explanation.length > 73) {
      const allStrings = explanation.match(/.{1,73}/g);
      allStrings.forEach(string => {
        string = string.replace(/^ /, '');
        while (string.length < 73) string += ' ';
        console.log(` │ ${string} │ `);
      });
    } else console.log(` │ ${explanation} │ `);
    return console.log(newLine);
  });
  return console.log(` └───────────────────────────────────────────────────────────────────────────┘`);
}

// Show the license :|
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

// ???
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

// Format todo time for showTodos() function
function formatTodoTime(time, repeatTime, lastRepeated) {
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
    let timeLeft = ((repeatTime + lastRepeated) - now) / 60000;
    // round number up to better output to 2 dec
    timeLeft = Math.round((timeLeft + Number.EPSILON) * 100) / 100;
    output = `-${timeLeft}m`;
  }
  // make output prettier
  while (output.length < 17) output = ` ${output}`;
  return output;
}

// Show todos with gui
function showTodos() {
  console.clear();
  const lineHeader = `
 ┌────┬─────┬───────────────────────────────────────────┬────────────────────┐
 │ ID │ Stt │ Todos                                     │ + Date             │
 ├────┼─────┼───────────────────────────────────────────┼────────────────────┤`;
  const lineSub =
  ` └────┴─────┴───────────────────────────────────────────┴────────────────────┘`;
  console.log(colors.bwhite(lineHeader));
  //const lastIndex = actualGroup.length.toString();
  actualGroup.forEach((todo, index) => {
    // color for the whole console ??? if is checked or not
    const color = todo.isChecked ? colors.white : colors.bwhite;
    // bar with normal color...
    const bar = colors.bwhite(` │ `);
    // prettier the index...
    index = index.toString();
    while (index.length < 2) index = ` ${index}`; // 2 => lastIndex.length
    index = color(index);
    // status
    const status = color(`(${todo.isChecked ? 'X' : ' '})`);
    // task and checked symbol
    let task = todo.text;
    // make text adapts when there more than 41 charas per line
    const startString = bar + index + bar + colors.white(status) + bar;
    // make actual time (if the todo has loop then uses the left time to repeat)
    const actualTime = formatTodoTime(todo.lastUpdated, todo.repeatTime, todo.lastRepeated);
    const activity = color(todo.lastActivity);
    if (task.length > 41) {
      const allStrings = task.match(/.{1,41}/g);
      allStrings.forEach( (string, si) => {
        // output final for first item => show data, stt
        if (si === 0) {
          string = color(string);
          console.log(startString + string + bar + activity + colors.white(actualTime) + bar);
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
      console.log(startString + task + bar + activity + colors.white(actualTime) + bar);
      return;
    }
  });
  // show groups
  console.log(colors.bwhite(lineSub));
  // map array to make the group selected more visible
  const newGroups = groups.map((group) => {
    if (group === groups[actualName]) return colors.underline(group);
    else return group;
  });
  let groupsString = `      ${newGroups.join(' ')}      `;
  // show list more organized
  while (groupsString.length < 78) groupsString = ` ${groupsString} `;
  return console.log(groupsString);
}

//
// Read Arguments
//

// Ask for a command
function askForATask(help) {
  if (help === true) showHelp();
  else if (help === 2) showProtec();
  else if (help === 3) showLicense();
  else showTodos();
  testTodos();
  rl.question(colors.white(' > '), (answer) => {
    [answer, ...args] = answer.split(' ');
    checkTask(answer, args);
  });
}

// Get command and pass to function
function checkTask(answer, args) {
  let help = false;
  answer = answer.toLowerCase();
  switch (answer) {
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
    case 'rd':
    case 'redo':
      redoAction();
      break;
    case 'r':
    case 'rem':
      removeTodos(args);
      break;
    case 'et':
    case 'edittime':
      editTimed(args);
      break;
    case 'at':
    case 'addtime':
      addTodoTimed(args);
      break;
    case 'checkgroup':
    case 'cg':
      checkGroup(args);
      groups = Object.keys(todos);
      actualGroup = todos[groups[actualName]];
      break;
    case 'addgroup':
    case 'ag':
      addGroup(args);
      groups = Object.keys(todos);
      break;
    case 'remgroup':
    case 'rg':
      remGroup(args);
      groups = Object.keys(todos);
      actualGroup = todos[groups[actualName]];
      break;
    case 'namegroup':
    case 'ng':
      nameGroup(args);
      groups = Object.keys(todos);
      actualGroup = todos[groups[actualName]];
      break;
    case 'tab':
    case 't':
      tabGroup();
      groups = Object.keys(todos);
      break;
    case 'showgroup':
    case 'sg':
      showGroup(args.join(' '));
      actualGroup = todos[groups[actualName]];
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
      break;
    case 'h':
    case 'help':
      help = true;
      break;
    case 'rc':
    case 'remcheckeds':
      remCheckedTodos();
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
      editTodo(args);
      break;
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
    default:
      help = false;
  }
  saveData();
  askForATask(help);
}

//
// Data Functions
//

// Load all the files or create them
function loadFile() {
  try {
    redos = JSON.parse(fs.readFileSync('redos.json', 'utf8'));
    OTODOS = JSON.parse(fs.readFileSync('todos.json', 'utf8'));
    todos = JSON.parse(fs.readFileSync('todos.json', 'utf8'));
    // load all the groups and return their names
    groups = Object.keys(todos);
    // choose the first group (default)
    actualName = 0;
    actualGroup = todos[groups[actualName]];
    askForATask(false);
  } catch (err) {
    if (err.code === 'ENOENT') {
      //
      // Templates
      //
      // ! Remember that the templates must be STRING to parse through fs.writeFileSync
      const templateTodos = ' ' + {
        "default": [
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
        ]
      };
      const templateRedos = '[]';

      // 
      // Code Run
      //
      // if only is missing redos files
      if (!redos && todos) {
        fs.writeFileSync('config.json', templateConfig, 'utf8');
        fs.writeFileSync('redos.json', templateRedos, 'utf8');
        redos = JSON.parse(fs.readFileSync('redos.json', 'utf8'));
        return askForATask(false);
      }
      // if is missing both files generate them
      fs.writeFileSync('todos.json', templateTodos, 'utf8');
      fs.writeFileSync('redos.json', templateRedos, 'utf8');
      redos = JSON.parse(fs.readFileSync('redos.json', 'utf8'));
      todos = JSON.parse(fs.readFileSync('todos.json', 'utf8'));
      // load all the groups and return their names
      groups = Object.keys(todos);
      // choose the first group (default)
      actualGroup = todos[groups[0]];
      return askForATask(false);
    } else {
      console.log(err);
      process.exit(0);
    }
  }
}

// Save files
function saveData() {
  // just save if there's any change (optimization)
  if (todos !== OTODOS) {
    fs.writeFileSync('todos.json', JSON.stringify(todos, null, 2), 'utf8');
    fs.writeFileSync('redos.json', JSON.stringify(redos, null, 2), 'utf8'); 
    // |, null, 2| for prettier output
  };
}

//
// Initialize
//

// const indexConsole = 20;

// Colors method for colorize terminal output
const res = '\x1b[0m';
const colors = {
  /*cyan: m => {
    return `\x1b[36m${m + res}`;
  },*/
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

// Redefines console.clear for better output (windows and linux)
console.clear = () => {
  process.stdout.write("\u001b[2J\u001b[0;0H");
  return process.stdout.write('\033c\033[3J');
};

// todos = file of todos
// redos = file of redos
// groups = array with the name of all groups
// actualName = current id of the group
// actualGroup = all the current todos of the actual group
let OTODOS, todos, redos, groups, actualGroup, actualName;

// Start the program
function start() {
  console.clear();
  OTODOS, todos, redos, groups, actualGroup, actualName = undefined;
  loadFile();
}

start();