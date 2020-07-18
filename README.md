# 🤍 Todo List CLI
> Todo List CLI build in Node.js

*We are hackers, and hackers have black terminals with gray and white text*

![Template](/preview/template.webp?raw=trueg)

Implementation of a Todo List in Node.js. Manage your todos directly in the terminal with a lot of features.

## ⌨️ Installation

- Install [node](https://nodejs.org/);
- Download the latest version [here](https://github.com/Koetemagie/todoncli/releases/latest)!
- Open it with app.vbs if you are in Windows or in terminal use `node .`.

## TodoNcli Installation

- Download this repository. Or use terminal with git: `git clone https://github.com/Passok11/todo-list-node-cli.git`;
- Open the repository folder locally. Or use terminal: `cd todoncli`;
- If you are using Windows, open **app.vbs**. Or in the terminal run todoncli using any of these commands: `node .`, `node todoncli.js`;
- You can make an alias in Linux to open it faster. Example: `echo 'alias nd="cd ~/TODONCLIFOLDER/ && node todoncli.js"' >> ~/.bashrc`, then `. ~/.bashrc`.

### Windows:

If you're using Windows 7 or lower. I recommend you use another terminal, such as [cmder](http://cmder.net/). ~~Or just update to Windows 10 :3~~

## ✨ Features v3.3

* Real time resize.
* Faster.

## 🖨 Command Cheat

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
* `g` or `get` - This will copy to clipboard the todo.
* `rc` or `remcheckeds` - This will remove all the the checked to-dos.
* `t` or `tab` - Show next group.
* `tr` or `tabreverse` - Show previous group.
* `ng` or `namegroup` - Rename the selected group. First is the group you want to rename, then the name you want.
* `ag` or `addgroup` - Create a new group of to-dos. This helps you to organize better the types of to-dos you have.
* `rg` or `remgroup` - Delete the selected group.
* `sg` or `showgroup` - Show the selected group.
* `cg` or `checkgroup` - Check all todos in the selected group.
* `et` or `edittime` - This will edit the time for repeat todo.
* `at` or `addtime` - Add a todo which will loop in a certain time.
* `as` or `addseparator` - Add a separator which will separe todos in a group.
* `mg` or `movegroup` - Move a group to another.
* `ea` or `editall` - Replace a word or phrase to another.
* `ax` or `addcheck` - Add and check a todo.

## To-do

![Project's to-dos](/preview/todos.png?raw=trueg)


## Tips

* You can use *addtime* and *add* commands to create a todo and put in a index, for example:
`a -5 Add this is in the fifth index`

* You can use *t* command to switch groups quickly.

* You can use flags to add separators in a group. [**line**/**l**, **transparent**/**t**, or custom **"#"**]
* `as line`
* `as l`
* `as X`

* `as -5 line`
* `as l -5`
* `as -5 +`
* `as # -5`

* Fast replace.
* `ea this new`


## 💻 Usage

*Todos are save in the `todos.json` file.*

![Documentation](/preview/documentation.png?raw=trueg)

## Contributors

Initial Work
[@passok11](https://twitter.com/passocabr)

Major Update

[@Koetemagie](https://github.com/Koetemagie)

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

Compatibility
[@mani1soni](https://github.com/mani1soni)

Documentation
[@gattigaga](https://github.com/gattigaga)
[@Ridermansb](https://github.com/Ridermansb)
[@Primogenia](https://github.com/Primogenia)
[@tducasse](https://github.com/tducasse)
[@Koetemagie](https://github.com/Koetemagie)

## 📝 Contributing

Pull requests are always open! Feel free to help!

For asks just create an issue.

For development I recommend you fast exit using `CTRL + c` or `e` and then back with `node .`.
