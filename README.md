

# Todo List CLI
> Todo List CLI build in Node.js

Simple implementation of a Todo List in Node.js. Manage your todos directly in the terminal.

## Installation

- Clone the repo: `git clone https://github.com/Passok11/todo-list-node-cli.git`
- Go into the repo folder locally: `cd todo-list-node-cli`
- Run `npm install` from the terminal to install **node_modules**.
- And finally, run `node index.js` from the terminal to run Todo List CLI.

Windows:

If you're using Windows, do yourself a favor and use [`cmder`](http://cmder.net/) instead of `cmd.exe`.


## Usage

### Add New Todo

Type `a YOUR_TODO_HERE` to add a new todo. In this example, we will add **'Third Todo'**.

```
    0 - [X] First Todo
    1 - [ ] Second Todo

    type an option: (a)dd, (c)heck, (r)emove, (h)elp, (e)xit
    > a Third Todo
```

Which gives:

```
    0 - [X] First Todo
    1 - [ ] Second Todo
    2 - [ ] Third Todo

    type an option: (a)dd, (c)heck, (r)emove, (h)elp, (e)xit
    >
```

### Check/Uncheck Existing Todo

Type `c TODO_INDEX_HERE` to check/uncheck existing todos. You can check or uncheck more than one todo at once. In this example, we will check **'First Todo'** and **'Third Todo'**.

```
    0 - [ ] First Todo
    1 - [ ] Second Todo
    2 - [ ] Third Todo

    type an option: (a)dd, (c)heck, (r)emove, (h)elp, (e)xit
    > c 0 2
```

Which gives:

```
    0 - [X] First Todo
    1 - [ ] Second Todo
    2 - [X] Third Todo

    type an option: (a)dd, (c)heck, (r)emove, (h)elp, (e)xit
    >
```

### Remove Existing Todo

Type `r TODO_INDEX_HERE` to remove an existing todo. You can remove more than one todo at once. In this example, we will remove **'First Todo'** and **'Third Todo'**.

```
    0 - [X] First Todo
    1 - [ ] Second Todo
    2 - [X] Third Todo

    type an option: (a)dd, (c)heck, (r)emove, (h)elp, (e)xit
    > r 0 2
```

Which gives:

```
    0 - [ ] Second Todo

    type an option: (a)dd, (c)heck, (r)emove, (h)elp, (e)xit
    >
```

### Documentation

You can open the built-in documentation by typing `h` as such:

```
    0 - [X] First Todo

    type an option: (a)dd, (c)heck, (r)emove, (h)elp, (e)xit
    > h
```

Which gives:

```
  TODO LIST NODE CLI

  Manage your todos anytime using command line!

  Every change will be saved in your system.

  usage: 'command [arguments]' - the arguments are space separated!


  add - add a new todo. Example add my new task

  check - checkmark the  items. Example: check 0 2. this will check the first item and the third.

  remove - remove items from the list. Example remove 0 1. this will remove the first two items.

  you can use the initial letter of each command for a shortcut

  > PRESS ENTER TO CONTINUE <
```

  > usage: `command [arguments]` - the arguments are space separated!

* `a` or `add` - add a new todo. Example add my new task
* `c` or `check` - checkmark the items. Example: `check 0 2`. this will check the first item and the third.
* `r` or `remove` - remove items from the list. Example `remove 0 1`. this will remove the first two items.
* `h` or `help` - get available commands
* `e` or `exit` - exit cli

*Todos are save in the `todos.json` file*

## Release History
* 0.3.0
    * Hacktoberfest
* 0.2.0
    * First beta release
* 0.1.0
    * Work in progress

## Contributors

Initial Work - [@passok11](https://twitter.com/passocabr)
Code improvements - [@Johnb21](https://github.com/Johnb21)

Documentation - [@gattigaga](https://github.com/gattigaga)
[@Ridermansb](https://github.com/Ridermansb)
[@Primogenia](https://github.com/Ridermansb)
[@tducasse](https://github.com/tducasse)

## Contributing

Pull requests are always open! Feel free to help!
