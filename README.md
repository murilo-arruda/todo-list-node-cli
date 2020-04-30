# Todo List CLI
> Todo List CLI build in Node.js

*We are hackers, and hackers have black terminals with ~~green~~ gray and blue text*

![Template](/preview/template.png?raw=trueg)

Simple implementation of a Todo List in Node.js. Manage your todos directly in the terminal. This is an updated ~~forked~~ version from todo-list-node-cli by [@murilo-arruda](https://github.com/murilo-arruda). *I forked this because I wanted to make something unique, something that I don't think everyone the original repository would agree.*

## Installation

- Install [node](https://nodejs.org/);
- Download the latest version [here](https://github.com/Koetemagie/todoncli/releases/latest)!

## Source Installation

- Install [node](https://nodejs.org/);
- Download this repository. Or use terminal with git: `git clone https://github.com/Passok11/todo-list-node-cli.git`;
- Open the repository folder locally. Or use terminal: `cd todoncli`;
- If you are using Windows, open **app.vbs**. Or in the terminal run todoncli using any of these commands: `node .`, `node index.js`, `npm start`.

### Windows:

If you're using Windows 10/8x: 
- **open the cmd** > **right click on the top tab** > **Properties** > **Terminal** > check **Disable Scroll-Forward**.
- If you don't have that option on Terminal, update your Windows 10 to the last one. If you can't I recommend you: **Layout** > **Screen Buffer Size** > **Height** > **50**.
Unfornately the last tip changes the Screen Buffer Size, so the help command won't show properly the documentation. Don't know how to resolve this bug. 
Do the same thing with the **node terminal** if you open the app using **app.vbs**.

If you're using Windows 7 or lower. I recommend you use another terminal, such as [cmder](http://cmder.net/). ~~Or just update to Windows 10 :3~~

## Features v1.3

* Extremely light (4.2KB);
* Easy to use;
* All you need is node installed;
* No more nstallation with npm or yarn. Just open and use it!
* Minimalist gui;
* Redo command (only is working with add and remove commands);
* Add todo in the place you want (or how many todos you want);
* Check the todo you want (or how many you want);
* Remove the todo you want (or how many you want);
* See the time you last updated your todo.
* Switch any todo with another.
* Copy any todo.
* Only saves the file if there's any changes.
* Remove the todos you already completed.
* Get the todo to your clipboard.
* Restart the program.

## Command Cheat

> usage: `command [arguments]` - the arguments are space separated!

* `a` or `add` - Add a new todo. Default is in the main list, if you want to add in a index then add in the end the index number with minus prefix.
* `x` or `check` - Checkmark the items. This will check the first item and the third. If you want to check only one, then just type one to-do index.
* `r` or `remove` - This will remove the first two items. If you want to check only one, then just type the index.
* `h` or `help` - Show help. Duh :3
* `e` or `exit` - Exit the program. :|
* `rd` or `redo` - This will redo the last to-do. Only working add e remove (with bugs).
* `m` or `move` - This will move the todo.
* `s` or `switch` - Switch the todo with another.
* `c` or `copy` - This will copy the todo.
* `rs` or `restart` - Restart the program. :|
* `l` or `license` - Show the license of the software.
* `rc` or `remcheckeds` - Remove checked to-dos.
* `get` or `g` - This will copy to clipboard the todo.

**Planning to add:**
* `at` or `addtime` - This will loop the todo in the time you put.
* `rc` or `remcheckeds` - This will remove all the the checked to-dos.
* `sg` or `showgroup` - Show the selected group.
* `ag` or `addgroup` - Create a new group of to-dos. This helps you to organize better the types of to-dos you have.
* `rg` or `remgroup` - Delete the selected group.
* `cg` or `checkgroup` - Check all todos in the selected group.
* `ng` or `namegroup` - Name the selected group. First is the group you want to rename and then the name you want.
* `sw` or `setwidth` - For set a new line width for the gui, it's only for resolve design bugs.

## Usage

*Todos are save in the `todos.json` file*
*Redos are save in the `redos.json` file*

For development I recommend you use [nodemon](https://nodemon.io/). Or just fast exit using `CTRL + c` or `e` and then back with `node .`.

![Documentation](/preview/documentation.png?raw=trueg)

## Contributors

Initial Work
[@passok11](https://twitter.com/passocabr)

Features
[@IAMOTZ](https://github.com/IAMOTZ)
[@Koetemagie](https://github.com/Koetemagie)

Code improvements
[@Johnb21](https://github.com/Johnb21)
[@JackieCalapristi](https://github.com/JackieCalapristi)
[@Koetemagie](https://github.com/Koetemagie)

Minor Update
[@ywpark1](https://github.com/ywpark1)
[@zjael](https://github.com/zjael)
[@Koetemagie](https://github.com/Koetemagie)

Compatibility
[@mani1soni](https://github.com/mani1soni)

Documentation
[@gattigaga](https://github.com/gattigaga)
[@Ridermansb](https://github.com/Ridermansb)
[@Primogenia](https://github.com/Primogenia)
[@tducasse](https://github.com/tducasse)
[@Koetemagie](https://github.com/Koetemagie)

## Contributing

Pull requests are always open! Feel free to help!

## License

[MIT](/LICENSE.md?raw=trueg).