const readline = require("readline");
const fs = require("fs");
const {
  createTodo,
  addTodo,
  checkTodos,
  removeTodos,
  showTodos,
  showHelp,
  save
} = require("./helper");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const template = `[
  {
    "isChecked": false,
    "text": "Wake Up Early"
  },
  {
    "isChecked": true,
    "text": "Learn to Code"
  }
]`;

let todos = [];

const ask = withHelp => {
  console.clear();

  if (withHelp) {
    showHelp();
  } else {
    showTodos(todos);
    console.log("Type an option: (a)dd, (c)heck, (r)emove, (h)elp, (e)xit ");
  }

  rl.question("> ", answer => {
    checkTask(...answer.split(" "));
  });
};

const checkTask = (answer, ...args) => {
  let withHelp = false;

  switch (answer) {
    case "a":
    case "add":
      const text = args.join(" ");

      if (text.length) {
        const todo = createTodo(text);
        todos = addTodo(todos, todo);
      }
      break;
    case "c":
    case "check":
      todos = checkTodos(todos, args.map(Number));
      break;
    case "r":
    case "remove":
      todos = removeTodos(todos, args.map(Number));
      break;
    case "h":
    case "help":
      withHelp = true;
      break;
    case "e":
    case "exit":
      console.clear();
      rl.close();
      process.exit();
    default:
      withHelp = false;
      break;
  }

  save(todos);
  ask(withHelp);
};

try {
  todos = JSON.parse(fs.readFileSync("todos.json", "utf8"));
  ask(false);
} catch (err) {
  if (err.code === "ENOENT") {
    console.log("Todo file not found. do you want generate a new one ? (Y/n)");

    rl.question("> ", answer => {
      switch (answer) {
        case "y":
        case "Y":
        case "YES":
        case "yes":
          fs.writeFileSync("todos.json", template, "utf8");
          todos = JSON.parse(fs.readFileSync("todos.json", "utf8"));
          ask(false);
          break;
        default:
          console.log("Exiting...");
          process.exit(0);
      }
    });
  } else {
    console.log(err);
    process.exit(0);
  }
}
