# Todo List CLI
> Todo List CLI build in Node.js

Simple implementation of a Todo List in Node.js. Manage your todos directly in the terminal. This is an updated ~~forked~~ version from todo-list-node-cli by [@murilo-arruda](https://github.com/murilo-arruda). *I forked this because I wanted to make something unique, something that I don't think everyone the original repository would agree.*

## Installation

- Install [node](https://nodejs.org/);
- Download this repository. Or use terminal with git: `git clone https://github.com/Passok11/todo-list-node-cli.git`;
- Open the repository folder locally. Or use terminal: `cd todoncli`;
- If you are using Windows, open **install.vbs**. Or in the terminal run: `npm install`;
- If you are using Windows, open **app.vbs**. Or in the terminal run todoncli using any of these commands: `node .`, `node index.js`, `npm start`.

### Windows:

If you're using Windows 10/8x, I recommend you: **open the cmd** > **right click in the top tab** > **Layout** > **Screen Buffer Size** > **Height** > **28**.
Do the same thing with the **node terminal** if you open the app using **app.vbs**.

If you're using Windows 7 or lower. I recommend you use another terminal, such as [cmder](http://cmder.net/). ~~Or just update to Windows 10 :3~~

## Command Cheat

> usage: `command [arguments]` - the arguments are space separated!

* `a` or `add` - Add a new todo. Default is in the main list, if you want to add in a index then add in the end the index number with minus prefix.
* `x` or `check` - Checkmark the items. This will check the first item and the third. If you want to check only one, then just type one to-do index.
* `r` or `remove` - This will remove the first two items. If you want to check only one, then just type the index.
* `h` or `help` - Show help. Duh :3
* `e` or `exit` - Exit the program. :|

**Planning to add:**
* `rd` or `redo` - This will redo the last to-do.
* `ag` or `remdones` - This will remove all the the checked to-dos.
* `ag` or `license` - Show the license of the software.
* `ag` or `addgroup` - Create a new group of to-dos. This helps you to organize better the types of to-dos you have.
* `rg` or `remgroup` - Delete the selected group.
* `ng` or `namegroup` - Name the selected group. First is the group you want to rename and then the name you want.
* `sw` or `setwidth` - For set a new line width for the gui, it's only for resolve design bugs.
* `rs` or `restart` - Restart the program. :|

## Usage

*Todos are save in the `todos.json` file*

### Add New Todo

Type `a YOUR_TODO_HERE` to add a new todo. In this example, we will add **'Third Todo'**.

```
    │ 0 │ [X] │ First Todo
    │ 1 │ [ ] │ Second Todo

        Type a command...
     > a Third Todo
```

Which gives:

```
    │ 0 │ [X] │ First Todo
    │ 1 │ [ ] │ Second Todo
    │ 2 │ [ ] │ Third Todo

        Type a command...
     >
```

### Add New Todo in index

Type `a YOUR_TODO_HERE -INDEX` to add a new todo in that index. In this example, we will add **'Third Todo'** in first index (start).

```
    │ 0 │ [X] │ First Todo
    │ 1 │ [ ] │ Second Todo

        Type a command...
     > a Zero Todo -0
```

Which gives:

```
    │ 0 │ [ ] │ Zero Todo
    │ 1 │ [X] │ Second Todo
    │ 2 │ [ ] │ Third Todo

        Type a command...
     >
```

### Check/Uncheck Existing Todo

Type `x TODO_INDEX_HERE` to check/uncheck existing todos. You can check or uncheck more than one todo at once. In this example, we will check **'First Todo'** and **'Third Todo'**.

```
    │ 0 │ [ ] │ Zero Todo
    │ 1 │ [ ] │ Second Todo
    │ 2 │ [ ] │ Third Todo

        Type a command...
    > x 0 2
```

Which gives:

```
    │ 0 │ [X] │ Zero Todo
    │ 1 │ [ ] │ Second Todo
    │ 2 │ [X] │ Third Todo

        Type a command...
    >
```

### Remove Existing Todo

Type `r TODO_INDEX_HERE` to remove an existing todo. You can remove more than one todo at once. In this example, we will remove **'First Todo'** and **'Third Todo'**.

```
    │ 0 │ [X] │ Zero Todo
    │ 1 │ [ ] │ Second Todo
    │ 2 │ [X] │ Third Todo

        Type a command...
    > r 0 2
```

Which gives:

```
    │ 1 │ [ ] │ Second Todo

        Type a command...
    >
```

In this example, we will remove a range of todos(from **'Second Todo'** to **'Third Todo'**)
```
    │ 0 │ [ ] │ First Todo
    │ 1 │ [X] │ Second Todo
    │ 2 │ [X] │ Third Todo
    │ 3 │ [X] │ Fourth Todo
    │ 4 │ [ ] │ Fifth Todo

        Type a command...
    > r 1-3
```

Which gives:

```
    │ 0 │ [ ] │ First Todo
    │ 1 │ [ ] │ Fifth Todo

        Type a command...
    >
```

### Documentation

You can open the built-in documentation by typing `h` as such:

```
    │ 0 │ [ ] │ First Todo
    │ 1 │ [ ] │ Fifth Todo

        Type a command...
    > h
```

## Release History
* 0.3.0
    * Hacktoberfest
* 0.2.0
    * First beta release
* 0.1.0
    * Created a gui

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