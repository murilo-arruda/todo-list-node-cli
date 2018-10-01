

# Todo List CLI
> Todo List CLI build in Node.js

Simple implementation Todo List in Node.js. Manage yours todos directly on terminal.

## Installation

- Clone the repo
- Go into the repo folder locally
- Run **npm install** from Terminal to install node_modules.
- Run **npm install** chalk
- Run **npm install** each-async
- Run **npm install** indent-string
- And finally, Run **node index.js** from Terminal to run Todo List CLI.

Windows:

If you're on Windows, do yourself a favor and use [`cmder`](http://cmder.net/) instead of `cmd.exe`.




## Usage

- **Add New Todo**

Type **a YOUR_TODO_HERE** to add new todo. In the example, it will be add Third Todo.

```sh
    0 - [X] First Todo
    1 - [ ] Second Todo

    type an option: (a)dd, (c)heck, (r)emove, (h)elp, (e)xit
    > a Third Todo
```

It will be :

```sh
    0 - [X] First Todo
    1 - [ ] Second Todo
    2 - [ ] Third Todo

    type an option: (a)dd, (c)heck, (r)emove, (h)elp, (e)xit
    >
```

- **Check/Uncheck Existing Todo**

Type **c TODO_INDEX_HERE** to check/uncheck existing todos. You can check/uncheck more than one todo. In the example, It will be check First Todo and Third Todo.

```sh
    0 - [ ] First Todo
    1 - [ ] Second Todo
    2 - [ ] Third Todo

    type an option: (a)dd, (c)heck, (r)emove, (h)elp, (e)xit
    > c 0 2
```

It will be :

```sh
    0 - [X] First Todo
    1 - [ ] Second Todo
    2 - [X] Third Todo

    type an option: (a)dd, (c)heck, (r)emove, (h)elp, (e)xit
    >
```

- **Remove Existing Todo**

Type **r TODO_INDEX_HERE** to remove existing todos. You can remove more than one todo. In the example, It will be remove First Todo and Third Todo.

```sh
    0 - [X] First Todo
    1 - [ ] Second Todo
    2 - [X] Third Todo

    type an option: (a)dd, (c)heck, (r)emove, (h)elp, (e)xit
    > r 0 2
```

It will be :

```sh
    0 - [ ] Second Todo

    type an option: (a)dd, (c)heck, (r)emove, (h)elp, (e)xit
    >
```

- **Documentation**

You can open built-in documentation with typing **h** like :

```sh
    0 - [X] First Todo

    type an option: (a)dd, (c)heck, (r)emove, (h)elp, (e)xit
    > h
```

It will be :

Firt configuraiton..

```sh
  TODO LIST NODE CLI

  Manager todos anytime using command line!

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
* `c` or `check` - checkmark the  items. Example: `check 0 2`. this will check the first item and the third.
* `r` or `remove` - remove items from the list. Example `remove 0 1`. this will remove the first two items.
* `h` or `help` - get available commands
* `e` or `exit` - exit cli

*Todos are save on `todos.json` file*

## Release History

* 0.2.0
    * First beta release
* 0.1.0
    * Work in progress

## Contributors

Initial Work - [@passok11](https://twitter.com/passocabr)

Documentation - [@gattigaga](https://github.com/gattigaga)
[@Ridermansb](https://github.com/Ridermansb)
[@Primogenia](https://github.com/Ridermansb)

## Contributing

Pull requests are always open! Feel free to help!
