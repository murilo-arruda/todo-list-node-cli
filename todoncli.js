const readline = require('readline');
const fs = require('fs');
const sleep = require('util').promisify(setTimeout);

const TODOS_PATH = 'todos.json';

// TODOS      = file of todos
// GROUPS     = array with the name of all groups
// CUR_NAME   = <current id> of the group in <groups>
// CUR_GROUP  = all the current todos of the current group
// CUR_COLUMS = current colums of terminal, to change it if update
let TODOS, GROUPS, CUR_GROUP, CUR_NAME, CUR_COLUMNS;

// Colors method for colorize terminal output
const colors = {
  res: '\x1b[0m',
  white: m => `\x1b[90m${m + colors.res}`,
  bwhite: m => `\x1b[1m${m + colors.res}`,
  inverse: m => `\x1b[7m${m + colors.res}`,
  underline: m => `\x1b[4m${m + colors.res}`,
  strike: m => `\x1b[9m${m + colors.res}`, }


// get true length of a a string with colors
// this is necessary since javascript thinks
// this is a  Hexadecimal escape sequence
// or even Octal escape sequence
// counting only what he wants to
// so this is the only solution to count this correctly
// javascript is very weird, isn't?
String.prototype.trueLength = function () {
 if (this === null) return 0;

 let matches = this.match(/\[\d+m/g);

 if (matches !== null)
    matches = matches.join('').length;

  let lengthHex = 0;

  const hexs = this.split('');

  if (hexs !== null) {
    for (l of hexs) {
      if (l === '\x1B')
        lengthHex++;
    }
  }

  return (lengthHex + matches - this.length) * -1;
}

// move an item to another position
Array.prototype.move = function (from, to) {
  if (to === from) return this;

  let target = this[from];                         
  let increment = to < from ? -1 : 1;

  for(let k = from; k != to; k += increment){
    this[k] = this[k + increment];
  }

  this[to] = target;
  return this;
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

//
// Data Functions
//

const todoncli = {
  // previous: save
  start: function () {
    console.clear();
    CUR_COLUMNS = process.stdout.columns;
    TODOS, GROUPS, CUR_GROUP, CUR_NAME = undefined;
    this.load();
  },
  alert: async (message, critical, time) => {
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
    console.log(colors.inverse(out) + '\n\n'
                                + message + '\n\n'
                                + colors.inverse(out) + '\n');
  
    // if it's critical then just stop the program
    if (critical)
      return process.exit();
  
    // 1.5 segunds timeout
    await sleep(TIMEOUT);
  },
  // previous: saveData
  // |, null, 2| for prettier output
  save: () => fs.writeFileSync(TODOS_PATH, JSON.stringify(TODOS), 'utf8'),
  // previous: loadFile
  load: function () {
    try {
      TODOS = JSON.parse(fs.readFileSync(TODOS_PATH, 'utf8'));
      // return the group's names
      GROUPS = Object.keys(TODOS);
      // choose the first group (default)
      CUR_NAME = 0;

      // load group
      CUR_GROUP = TODOS[GROUPS[CUR_NAME]];

      this.ask();
  
    } catch (err) {
  
      if (err.code === 'ENOENT') {
    
      const TEMPLATE_TODOS = `{
          "default": [
            {
              "isChecked": false,
              "text": "Check me to test if is working!",
              "lastUpdated": ${Date.now()}
            },
            {
              "isChecked": true,
              "text": "You can remove this template todo!",
              "lastUpdated": ${Date.now()}
            }
          ]
        }`;
    
      // if is missing both files generate them
      fs.writeFileSync(TODOS_PATH, TEMPLATE_TODOS, 'utf8');
    
      // parse todos to program
      TODOS = JSON.parse(fs.readFileSync(TODOS_PATH, 'utf8'));

      // load all the groups and return their names
      GROUPS = Object.keys(TODOS);

      // change id
      CUR_NAME = 0;

      // choose the first group (default)
      CUR_GROUP = TODOS[GROUPS[CUR_NAME]];
    
      return this.ask();
      // unknown error closes the process
    } else {
      console.log(err);
      process.exit(0);
    }
    }
  },
  // showHelp
  // Show documentation
  help: () => {
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
      [ ['tabreverse', 'tr'],
        'Show previous group.',
        'tr',
      ],
      [ ['editall', 'ea'],
        'Replace a word or phrase to another.',
        'ea "book" "new book"'
      ],
      [ ['addcheck', 'ax'],
        'Add and check a todo. Same usage as add.',
        'ax -1 This new'
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
  
    let VERSION = '3.3';
    const NAME = 'TodoNcli (^o^)/';
    const SYNOPSIS = 'Manage your todos anytime using command line!\r\nEvery change will be saved in your drive.';
    const USAGE = `Usage: ${colors.inverse('command [arguments]')} - the arguments are space separated!`;
    const LEAVE = 'To leave, just press anything!';
  
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
  
      // put example in right
      while (example.length < process.stdout.columns - COMMANDS_OUTPUT.trueLength())
             example = ' ' + example;
  
      console.log(COMMANDS_OUTPUT + example);
  
      return console.log(EXPLANATION + '\n');
  
    });
  },
  // showLicense
  // Show the license :|
  license: () => {
    console.log(`
    todoncli
  
    Copyright © 2020-2020 Koetemagie
    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without │ restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
  
    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
  
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
   `);
  },
  // ???
  // showProtec
  protec: () => {
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
  },
  // previous: topPartTodos
  todosInformation: maxIdLength => {
    let id = 'ID';                                                         // inconstant length item
    let check = 'Check';                                                   // 3 length item
    //let brazilianDateType = false;                                       // day first | true or false
    let todosName = GROUPS[CUR_NAME];                                      // inconstant length item
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
    const startPart = `${colors.inverse(id)} ${colors.inverse(check)} ${colors.inverse(date)}`;

    // -1 because terminal sometimes read more one line with a custom rezise
    let columnsTerminal = process.stdout.columns - startPart.trueLength();
  
    // make check have the same size of the largest item
    // minus 2 because this has to count the 2 spaces
    while (todosName.length < columnsTerminal - 2) todosName += ' ';
    // min length for task string...
    if (columnsTerminal < minColumns) columnsTerminal = minColumns;
  
    // top bar
    console.log(`${startPart} ${colors.inverse(todosName)}\n`);
    return startPart.trueLength(); // Return columsTerminal
  },
  // show groups name
  // bottomPartGroups
  groupsList: () => {
    // map array to underline the actual group
    const newGroups = GROUPS.map(group => {
  
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
        case GROUPS[CUR_NAME]:
          // colorize group that is fully checked 
          if (isComplete)
            return colors.strike(group);
          // just underline it if it's selected
          else
            return colors.inverse(colors.underline(group));
          break;
  
        default:
          // return group that is fully checked
          if (isComplete) 
            return colors.strike(colors.inverse(group));
          else
            return colors.inverse(group);
      }
  
    });
  
    // center
    let groupsString = newGroups.join(colors.inverse(' '));

    // put groups in center
    while (groupsString.trueLength()  < process.stdout.columns - 1)
      // -1 trick when colums of terminal is odd
      groupsString = ` ${groupsString} `;

    while (groupsString.trueLength() < process.stdout.columns)
      groupsString += ' ';
  
    groupsString = groupsString.replace(/  +/g, s => colors.inverse(s));


    console.log(`\n${groupsString}\n`);

  },
  // show todos information, todos and groups
  todos: function () {
    // inconstant length
    let maxIdLength = (CUR_GROUP.length.toString()).length;
    // min = 2
    if (maxIdLength < 2)
      maxIdLength = 2;

    // group information
    const startPartLength = this.todosInformation(maxIdLength);
    const TODO_LENGTH = process.stdout.columns - startPartLength - 1; // space for space

    let space = '';
    while (space.length <= startPartLength)
        space += ' ';

    const SEPARATOR_LENGTH = process.stdout.columns // columns
                                                              - maxIdLength // space for id (start)
                                                              - 1 // space for space, lol

    // Todos
    CUR_GROUP.forEach((todo, index) =>  {
      // prettier the index in the output to be
      // the exactly width of the last todo's index
      index = index.toString();
      while (index.length < maxIdLength
                     || index.length < 2) // min length is 2 because ID = 2
        index = ` ${index}`;
  
      // if it is a separator
      if (todo.separator) {
        let separator = todo.text;
  
        // if it's just a letter
        if (separator.length === 1) {
          // repeat the separator to the end of the terminal columns
          while (separator.length < SEPARATOR_LENGTH)
            // -1 trick when colums of terminal is odd
            separator += todo.text;

        }
  
        // if it's an word
        else {
          // put separator in center
          // -1 because it adds more
          while (separator.length < SEPARATOR_LENGTH - 1)
            // -1 trick when colums of terminal is odd
            separator = ` ${separator} `;
          // if needs more one character add space in end
          while (separator.length < SEPARATOR_LENGTH)
            separator += ' ';
        }
  
        return console.log(`${colors.white(index)} ${colors.white(separator)}`);
      };
  
  
      const task = todo.text;
      const activity = todo.isChecked ? '»' : '>';
      const status = todo.isChecked ? '(+)' : '( )';
      const color = todo.isChecked ? colors.white : colors.bwhite;
      const actualTime = itemsParse.time(
        todo.lastUpdated,
        todo.repeatTime,
        todo.lastRepeated);
  
  
      // for every todo there's a start string 
      const startString = `${index} ${color(status)} ${color(activity)} ${colors.white(actualTime)}`;
  
      // when text is bigger than terminal separate in lines
      if (task.length > TODO_LENGTH) {
  
        const matchLimit = new RegExp(`.{1,${TODO_LENGTH}}`, 'g');
        const allStrings = task.match(matchLimit);

        // loop to print all lines
        allStrings.forEach((string, si) => {

          // output final for the first line of the task
          // > show data, status
          if (si === 0)
            console.log(`${startString} ${color(string)}`);

          // output final for the rest of the lines > only task
          else {
            string = string.replace(/^\s/, '');
            console.log(space + color(string));
          }

        });

      // if everything is normal just print the todo
      } else console.log(`${startString} ${color(task)}`);

    });
  
  
    // groups
    this.groupsList();
  },
  promptNothing: function () {
    rl.question(colors.white('<') + ' ', A => this.ask());
  },
  promptQuestion: function () {
    rl.question(colors.white('>') + ' ', ANSWER => {
      let [answer, ...args] = ANSWER.split(' ');
      this.check(answer, args);
    });
  },
  ask: function (TYPE) {
    console.clear();
    // show
    // 1 = documentation, commands
    // 2 = ???
    // 3 = license
    //   = todos of the group
    switch (TYPE) {
      case 1:
        this.help();
        break;
      case 2:
        this.protec();
        break;
      case 3:
        this.license();
        break;
      default:
        this.todos();
    }
  
    // test timed todos to update their times
    itemsParse.updateTimeds();
    
    if (!TYPE)
      this.promptQuestion();
    else
      this.promptNothing();
  },
  restartPrompt: function (answer, args) {
    if (CUR_COLUMNS !== process.stdout.columns) {
      CUR_COLUMNS = process.stdout.columns;
      this.ask();
    }
    else {
      const LINES_LENGTH = (function () {
        let LINE = '> ' + answer + args;
        const patt = new RegExp(`.{${process.stdout.columns}}`, 'g');
    
        let arrLength = LINE.match(patt);
    
        if (arrLength === null)
          return 1;
    
        else
          return arrLength.length + 1;
      })();
    
      process.stdout.moveCursor(0, LINES_LENGTH * -1);
      readline.clearScreenDown(process.stdout, () => this.promptQuestion());
    }
  },
  // Get command and pass to function
  // previous: checkTask
  check: async function (answer, args) {
    let TYPE;
  
    // make it always lowercase to be read
    answer = answer.toLowerCase();

    switch (answer) {

      //
      // groups
      //
      case 'movegroup':
      case 'mg':
        await groups.move(args);
        groups.update();
        break;

      case 'showgroup':
      case 'sg':
        await groups.show(args.toString());
        TYPE = 0;
        break;
      case 'checkgroup':
      case 'cg':
        await groups.check(args);
        groups.update();
        break;
      case 'addgroup':
      case 'ag':
        await groups.add(args);
        groups.update(1);
        break;
      case 'remgroup':
      case 'rg':
        await groups.remove(args);
        groups.update();
        break;
      case 'namegroup':
      case 'ng':
        await groups.name(args);
        groups.update(1);
        // the group is selected in the function
        // since it's referring to a object name
        // and it's easier and faster to use this way.
        break;
  
      case 'rc':
      case 'remcheckeds':
        if (args.length > 0) await todoncli.alert(
          'This command does not accept arguments, please if you are not in the selected group, go there and use from there.'
          , false, 3000);
        else groups.remCheckeds();
        break;
      case 'ea':
      case 'editall':
        groups.editAll(args);
        break
      case 'tab':
      case 't':
        groups.tab();
        groups.update();
        TYPE = 0;
        break;
      case 'tabreverse':
      case 'tr':
        groups.tab(true); // true > reverse true
        groups.update();
        TYPE = 0;
        break;
  
      //
      // todos
      // 
      case 'ax':
      case 'addcheck':
        items.add(args, true); // true to check
        break;
      case 'a':
      case 'add':
        items.add(args);
        break;
      case 'x':
      case 'check':
        items.check(args);
        break;
      case 's':
      case 'switch':
        items.switch(args);
        break;
      case 'as':
      case 'addseparator':
        items.addSeparator(args);
        break;
      case 'r':
      case 'rem':
        items.remove(args);
        break;
      case 'c':
      case 'copy':
        items.copy(args);
        break;
      case 'm':
      case 'move':
        items.move(args);
        break;
      case 'g':
      case 'get':
        items.get(args);
        return this.restartPrompt(answer, args);
        break;
      case 'ed':
      case 'edit':
        items.edit(args);
        break;
  
      case 'et':
      case 'edittime':
        items.editTime(args);
        break;
      case 'at':
      case 'addtime':
        items.addTimed(args);
        break;
      //
      // outputs
      //
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

      // 
      // todoncli
      // 
      case 'rs': 
      case 'restart':
        this.start();
        break;
      case 'e':
      case 'exit':
        todoncli.save();
        console.clear();
        rl.close();
        process.exit();
        break;
  
      default:
        return this.restartPrompt(answer, args);
    }
  
    if (TYPE === undefined)
      todoncli.save();
  
    this.ask(TYPE);
  }
}

//
// Group Functions
//

// shortcut
process.stdin.on('keypress', (ch, key) => {
  // alt + > === tab
  if (key.name === 'right' && key.shift === true)
    todoncli.check('tab');
  // alt + < === tabreverse
  if (key.name === 'left' && key.shift === true) {
    todoncli.check('tabreverse');
  }
});

// real time update to resize
process.stdout.on('resize', () =>  {
    rl.pause();
    todoncli.ask();
})

const groups = {

  restoreMsg: 'Restoring todos with backup... ',

  // search by letters and replace them
  editAll: async function (args) {
    const BAK_TODOS = TODOS;

    const text = args.join(' ');
    const count = ((text.split('')).filter(x => x === '"')).length;

    try {
      // INPUT: 'ea "KOP" "LEL"'
      if (count === 4 && args.length > 1) {
        args = (args.join(' ')).split('" "');
        args[0] = args[0].replace(/^"|"$/g, '');
        args[1] = args[1].replace(/^"|"$/g, '');
      }

      // INPUT: 'ea lol lel'
      const [REPLACE, NEW] = [args[0], args[1]];

      // for in each todo to change the patt
      for (let i = 0; i < CUR_GROUP.length; i++)
        CUR_GROUP[i].text = (CUR_GROUP[i].text).replace(REPLACE, NEW);

    }
    catch (e) {
      TODOS = BAK_TODOS;
      await todoncli.alert(this.restoreMsg + e.message, 2000);

    }
  },
  // previous updateGroups
  update: all => {
    GROUPS = Object.keys(TODOS);
    // if just needs to load the groups
    // then pass 1 to all (param)
    if (all !== 1) CUR_GROUP = TODOS[GROUPS[CUR_NAME]];
  },
  // move a group recreating the todos
  move: async args => {

    if (args.length !== 2) return;

    // GROUP: group to move
    // WANTED: group where the old group will be
    const GROUP = args[0];
    const WANTED = args[1];

    try {

      if (!TODOS[GROUP]
          || !TODOS[WANTED])
        throw 'Some group doesn\'t exist.';


  
      let groupPos, wantedPos;
  
      let NEW_TODOS = {};
      let NEW_GROUPS = GROUPS;


      // get pos
      NEW_GROUPS.forEach((gr, i) => {
        switch (gr) {
          case GROUP: groupPos = i;
            break;
          case WANTED: wantedPos = i;
  
            break;
  
          default:
        }
      });  
  
  
      NEW_GROUPS = NEW_GROUPS.move(groupPos, wantedPos);


      NEW_GROUPS.forEach((gr, i) => {
        NEW_TODOS[gr] = TODOS[gr];
      });

      TODOS = NEW_TODOS;
    }

    catch (e) {
      await todoncli.alert(e);
    }

     

  },
  // showGroup
  show: function (WANTED) {
    // if group exists
    if (TODOS[WANTED]) {
      GROUPS.every((group, index) => {
        // Do your thing, then:
        if (WANTED === group) {
          CUR_NAME = index;
          // break loop
          return false;
        }
        else return true;
      });
      this.update();

    } else return todoncli.alert('This group doesn\'t exist');
  },
  // show next group
  tab: reverse => {
    if (GROUPS.length < 1) return;

    if (reverse) {
      // if gets in the start then back to end
      if (0 === CUR_NAME)
        CUR_NAME = GROUPS.length - 1;
      // or just back
      else CUR_NAME--;

    } else {
      // if gets in the end then back to start
      if (GROUPS.length - 1 === CUR_NAME)
        CUR_NAME = 0;
      // or just go to next
      else CUR_NAME++;
    }
  },
  // nameGroup
  name: async args => {
    // must be only two args
    if (args.length !== 2) return;
    const NAME = args[0];
    const WANTED = args[1];
  
    try {
      if (TODOS[WANTED])
        throw 'You have to chose a name that isn\' taken.';
  
      else if (TODOS[NAME]) {
        TODOS[WANTED] = TODOS[NAME];
        // select the new group
        // > groups list
        CUR_NAME = GROUPS.length - 1;
        // > TODOS list
        CUR_GROUP = TODOS[WANTED];
  
        // delete old group
        delete TODOS[NAME];
      }
  
      else
        throw 'Please, chose a group that exists.';
        
    }
    catch (e) {
      await todoncli.alert(e);
    }
  },
  // previous: removeGroup
  remove: async args => {
    // must be only one arg
    // and always have to exist at least two groups
    if (args.length !== 1 || GROUPS.length < 2) return;
  
    try {
      const GROUP = args[0];
      // verify if this group exist
      if (!TODOS[GROUP]) return await todoncli.alert('This group doesn\'t exist.');
      switch (GROUP) {
        // if it's the first group then just back to normal
        case GROUPS[0]:
          CUR_NAME = 0;
          break;
        // verify if there's the same group 
        // that is being used right now
        case GROUPS[CUR_NAME]:
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
      return todoncli.alert(e, true);
    }
  },
  // previous: addGroup
  add: async args => {
    if (args.length !== 1) return;
    const NAME = args[0];
    // verify if group already exists
    if (TODOS[NAME])
      return await todoncli.alert('This group already exists...');
    // create group with the name
    else
      return TODOS[NAME] = [];
  },
  // previous: checkGroup
  check: async args => {
    if (args.length !== 1) return;
    const NAME = args[0];

    // verify if the group exists
    if (!TODOS[NAME]) return await todoncli.alert('This group doesn\'t exist.');

    // show group if isn't selected
    if (GROUPS[CUR_NAME] !== NAME) groups.show(NAME);

    // check them all
    items.check([`0-${TODOS[NAME].length}`]);
    return;
  },
  // remove checked todos
  // previous: rem
  remCheckeds: () => {
    let ids = CUR_GROUP.map((item, index) => {
      if (item.isChecked === true) return index;
    });
    ids = ids.filter(item => item !== undefined);
    items.remove(ids);
  }
}

//
// Todos Functions
//

const items = {
  // add separator 
  addSeparator: function (text) {
    if (text.length === 1) {
      // if the type doesn't have anything at
      // all just reload
      if (text[0].length === 0) return;
      // ...
      return itemsParse.addDirectSeparator(text[0]);
  
    } else if (text.length >= 2) {
      const validate = getIndex(text);
  
      if (typeof validate.index === 'number')
        return itemsParse.addDirectSeparator(validate.text, validate.index);
  
      else return itemsParse.addDirectSeparator(text.join(' '));
    }
    else {  
      return CUR_GROUP.push({
        separator: true,
        text: '-'
      });
    }
  },
  // Add todo in todos files (command check and index)
  // previous: addTodo
  add: function (text, check) {
    if (text.length === 0) return;
    // parse text and return index if theres any
    const validate = itemsParse.index(text);

    switch (validate) {
      case 1: // if returns that there is no index
      case 2: // if returns that the given index is not in the rules
              // (bigger than actual length of the group)
        itemsParse.addDirect(text.join(' '));
        // if it's to check too
        if (check)
          this.check([CUR_GROUP.length - 1]);

        break;
      default:
        CUR_GROUP.splice(validate.index, 0, {
          isChecked: false,
          text: validate.text,
          lastUpdated: Date.now(),
        });
        // if it's to check too
        if (check)
          this.check([validate.index]);
    };
  },
  // previous: editTodo
  edit: function (text) {
    if (text.length < 1) return;
    // parse text and return index if theres any
    const validate = itemsParse.index(text);
    // if returns that there is no index
    if (validate === 1) return itemsParse.addDirect(text.join(' '));
    // if returns that the number return is not in the rules
    else if (validate === 2) return;
    CUR_GROUP[validate.index].text = validate.text;
  },
  // previous: switchTodo
  switch: function (args) {
    // this does not have a default position, it's forced   two arguments!!!
    // because for switching you must be careful
    // verify both numbers

    if (itemsParse.verifyTwoNumbers(args) === false) 
      return;
    args = itemsParse.twoNumbers(args);

    if (args[0] === args[1]) return;

    // first todo you want to switch
    this.move([args[0], args[1]]);
    // verify if they are next on other, if so, then just   move one is enough...
    if (args[1] - 1 < 0)
      args[1] = 0;

    if (args[1] - 1 !== args[0])
      this.move([args[1] - 1, args[0]]); 
  },

  // previous: copyTodo
  copy: args => {
    // if theres only the todo you want to move then default   position to move is the last one
    if (args.length === 1)
      args.push(CUR_GROUP.length);
    // verify both numbers
    if (itemsParse.verifyTwoNumbers(args) === false)
      return;
    // first is the todo you want to copy
    const todo = CUR_GROUP[args[0]];
    // second the index you want to put
    const index = args[1];
    // copy it
    CUR_GROUP.splice(index, 0, todo); 
  },
  // previous: moveTodo
  move: args => {
    // if theres only the todo you want to move then default   position to move is the last one
    if (args.length === 1) args.push(CUR_GROUP.length);
    // verify both numbers
    if (itemsParse.verifyTwoNumbers(args) === false) return;
    // first is the todo you want to move
    const todo = CUR_GROUP[args[0]];
    // second the index you want to put
    const index = args[1];
    // remove the current todo of the todos.json
    CUR_GROUP.splice(args[0], 1);
    // move it
    CUR_GROUP.splice(index, 0, todo); 
  },
  // previous: checkTodos
  check: ids => {
    // verify if there's any item with range in
    ids.forEach((id, index) => {
      id = id.toString();
      // 13-45 match
      if (/\d+-\d+/g.test(id)) {
        // range the item
        const validate = itemsParse.rangeIn(id);
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
  },
  remove: ids => {
    if (ids.length === 0) return;
    // verify if there's any item with range in
    ids.forEach((item, index) => {
      item = item.toString();
      if (/[a-zA-Z]/g.test(item)) return;
      // 13-45 match
      if (/\d+-\d+/g.test(item)) {
        // range the item
        const validate = itemsParse.rangeIn(item);
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
  },
  // Copy a text of todo to clipboard
  get: async ids => {
    // always one argument (todo to get text)
    if (ids.length === 1
        // the id has to exist, of course
        && CUR_GROUP[ids[0]]) {

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
          await todoncli.alert('Please report the OS you use   in the our repository!\nhttps://github.com/  Koetemagie/todoncli.git');
      }
    }
  },
  // Edit the old time of the loopable todo to a new one
  // previous: editTimed
  editTime: args => {
    // always two args (first: todo; second: time in minutes)
    if (args.length !== 2) return;
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
  },
  // Add todo to be repeated
  // previous: addTodoTimed
  addTimed: (args) => {
    if (args.length < 2) return;
    // validate the args with every unique possibility
    const validate = itemsParse.timed(args);
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
}

const itemsParse = {
  // retrieve index of an number argument
  index: args => {
    const patt = /^-\d+\b|-\d/;
    const lastWord = args[args.length - 1];
    let index;
    if (patt.test(args[0])) {
      index = args[0];
      args.splice(0, 1);
    }
    else if (patt.test(lastWord)) {
      index = lastWord;
      args.splice(args.length - 1, 1);
    }
    // returns if there is no index
    else return 1;
    // remove minus
    index = parseInt(index.replace('-', ''));
    // if returns that the number return is not in the rules
    if (index > CUR_GROUP.length - 1 || index < 0)
      return 2;
    return {
       text: args.join(' '),
       index,
    };
  },
  // previous: parseMinutesIndex 
  timed: args => {
    const textJ = args;
    let time;
    // pattern for number with minus as prefix
    const patt = /^-\d+\b|-\d/;
    let index, minutes, text;
    let lastArg = textJ[textJ.length - 1];
    let penultArg = textJ[textJ.length - 2];
    // if the input is like (at todo -minutes)
    if (patt.test(lastArg) && patt.test(penultArg) === false   && patt.test(args[0]) === false) {
      // parse as normal number for index
      minutes = parseInt(lastArg.replace('-', ''));
      // remove minutes of the text
      textJ.splice(textJ.length - 1, 1);
    }
    // if the input is like (at -minutes todo)
    else if (patt.test(args[0]) && patt.test(lastArg) ===   false) {
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
      if (index < 0 || index > CUR_GROUP.length - 1) return 1  ;
      // remove index and minutes of the text
      textJ.splice(textJ.length - 2, 1);
      textJ.splice(textJ.length - 1, 1);
    }
    // or if the input is like (at -minutes todo -index)
    else if (patt.test(args[0]) && patt.test(lastArg)) {
      // parse as normal number for minutes and convert it   to miliseconds
      minutes = parseInt(args[0].replace('-', ''));
      // parse as normal number for index
      index = parseInt(lastArg.replace('-', ''));
      // if index is invalidate
      if (index < 0 || index > CUR_GROUP.length - 1) return 1  ;
      // remove index and minutes of the text
      textJ.shift();
      textJ.splice(textJ.length - 1, 1);
    };
    text = textJ.join(' ');
    minutes = minutes * 60000;
    return { text, index, minutes };
  },
  // previous: addNormalTodo
  addDirect: text => {
    CUR_GROUP.push({
      isChecked: false,
      text,
      lastUpdated: Date.now(),
    });
  },
  // update todos if their time already passed
  // previous: testTimedTodos
  updateTimeds: () => {
    CUR_GROUP.forEach(todo => {
      // if todo is loopable
      const loopable = todo.repeatTime;

      if (loopable) {
        const dateNow = Date.now();
        const lastTimeTodo = todo.lastRepeated + todo.  repeatTime;
        // if that already passed then resets it
        if (dateNow >= lastTimeTodo) {
          todo.isChecked = false;
          todo.lastRepeated = dateNow;
          todo.lastUpdated = dateNow;
        }
      }
    });
  },
  // previous: testSeparator
  addDirectSeparator: (type, index) => {
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
    // if not, then just add in the end
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
  },
  // previous: verifyTwoNumbers
  // Verify two numbers in a function that reads two numbers and returns true if everything is okay :3 
  verifyTwoNumbers: args => {
    // always need two arguments
    if (args.length !== 2) return false;
    for (item of args) {
      // need always be a number
      if (/[^\d+]/.test(item))
        return false;
      // if the number is bigger or lower than expected
      if (item < 0 || item > CUR_GROUP.length - 1)
        return   false;
    }
    return true;
  },
  // Returns an array with the min value first and the max value at the end
  // previous: organizeTwoNumbers
  twoNumbers: args => {
    // parse to numbers
    const first = parseInt(args[0]);
    const second = parseInt(args[1]);
    // if the end is lower than the start switch and then   return their values
    if (second < first) return [second, first];
    else return [first, second];
  },
  // Range In between two numbers and return their indexes
  // previous: rangeIn
  rangeIn: function (ids) {
    ids = [ids];
    let [start, end] = ids[0].split('-');
    // if the index given is bigger than how much you have
    if (start > CUR_GROUP.length || CUR_GROUP.length < end)
      return;
    if (start < 0 && end < 0 ) return;
    const args = this.twoNumbers([start, end]);
    let validate = [];
    for (let i = args[0]; i <= args[1]; i++)
      validate.push(i.toString());
    return validate;
  },
  // round number to 2 dec
  roundIt: n => Math.round((n + Number.EPSILON) * 100) / 100,
  // Format todo time for showTodos function
  // previous: formatTodoTime
  time: function (time, repeatTime, lastRepeated) {
    let output;
    if (repeatTime === undefined) {
      const date = new Date(time);
      // make date prettier
      let specials = [date.getDate(),(date.getMonth() + 1),
                      date.getHours(), date.getMinutes()];
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
        time = `-${this.roundIt(time / 60)}h`;    // Hours
      else if (time > 1440 && time < 10080)
        time = `-${this.roundIt(time / 1440)}d`;  // Days
      else if (time > 10080 && time < 43800)
        time = `-${this.roundIt(time / 10080)}w`; // Weeks
      else if (time > 43800)
        time = `-${this.roundIt(time / 43800)}mo`; // Months
      else
        time = this.roundIt(time + 'm');

      output = time;
    }
    // make output prettier
    while (output.length < 16) output = ` ${output}`;
    return output;
  }
}



todoncli.start();