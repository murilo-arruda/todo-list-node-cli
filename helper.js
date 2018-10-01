const { green, black, blue, bgGreen, inverse } = require("chalk");
const fs = require("fs");
const { stripIndents } = require("common-tags");

/**
 * Create new todo item
 *
 * @param {string} text New todo label
 * @return {object} Todo item
 */
const createTodo = text => ({
  isChecked: false,
  text
});

/**
 * Add new todo item
 *
 * @param {object} items All todo items
 * @param {object} newItem New todo will be added
 * @return {object[]} New todo items
 */
const addTodo = (items, newItem) => [...items, newItem];

/**
 * Check/Uncheck todos
 *
 * @param {object[]} items All todo items
 * @param {number[]} indices Item indices you want to check/uncheck
 * @returns {object[]} New todo items
 */
const checkTodos = (items, indices) => {
  return items.map((item, index) => {
    if (indices.includes(index)) {
      return {
        ...item,
        isChecked: !item.isChecked
      };
    }

    return item;
  });
};

/**
 * Remove existing todos
 *
 * @param {object[]} items All todo items
 * @param {number[]} indices Item indices you want to remove
 * @returns {object[]} New todo items
 */
const removeTodos = (items, indices) => {
  return items.filter((_, index) => !indices.includes(index));
};

/**
 * Show all todo items
 *
 * @param {object[]} items All todo items
 */
const showTodos = items => {
  items.forEach((item, index) => {
    const color = item.isChecked ? green : blue;
    const mark = item.isChecked ? "X" : " ";

    console.log(color(`${index} - [${mark}] ${item.text}`));
  });
};

/**
 * Show help on screen
 *
 */
const showHelp = () => {
  const text = stripIndents`
    ${bgGreen(black("TODO LIST NODE CLI"))}\n
    Manage todo list anytime with command line !
    Every change will be saved in your system.
    usage: 'command [arguments]' - the arguments are space separated!\n\n
    ${blue("add")}\t\tAdd a new todo item. Example: ${inverse(
    "add My First Todo"
  )}.
    ${blue("check")}\t\tCheck or uncheck the items. Example: ${inverse(
    "check 0 2"
  )}. This will check the first item and the third.
    ${blue("remove")}\t\tRemove items from the list. Example: ${inverse(
    "remove 0 1"
  )}. This will remove the first two items.\n\n
    You can use the initial letter of each command for a shortcut.
    > PRESS ENTER TO CONTINUE <\n\n
  `;

  console.log(text);
};

/**
 * Save all todo items into a file
 *
 * @param {object[]} items All todo items
 */
const save = items => {
  fs.writeFileSync("todos.json", JSON.stringify(items), "utf8");
};

module.exports = {
  createTodo,
  addTodo,
  checkTodos,
  removeTodos,
  showTodos,
  showHelp,
  save
};
