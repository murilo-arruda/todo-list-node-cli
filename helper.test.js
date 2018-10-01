const {
  createTodo,
  addTodo,
  checkTodos,
  removeTodos,
  showTodos,
  showHelp
} = require("./helper");

jest.mock("chalk", () => {
  return {
    green: jest.fn(text => `${text} (green)`),
    blue: jest.fn(text => `${text} (blue)`),
    bgGreen: jest.fn(text => `${text} (bgGreen)`),
    inverse: jest.fn(text => `${text} (inverse)`)
  };
});

jest.mock("fs", () => {
  return {
    writeFileSync: jest.fn(() => {})
  };
});

describe("createTodo()", () => {
  it("should return new todo", () => {
    const text = "Early Wake Up";
    const newTodo = createTodo("Early Wake Up");

    expect(newTodo).toMatchObject({
      isChecked: false,
      text
    });
  });
});

describe("addTodo()", () => {
  it("should return todos with new item", () => {
    const newItem = {
      isChecked: false,
      text: "I will try it"
    };

    const items = [
      {
        isChecked: false,
        text: "Hello"
      },
      {
        isChecked: false,
        text: "World"
      }
    ];

    const expected = [...items, newItem];
    const todos = addTodo(items, newItem);

    expect(todos).toEqual(expected);
  });
});

describe("checkTodos()", () => {
  it("should return todos with checked item", () => {
    const items = [
      {
        isChecked: false,
        text: "Hello"
      },
      {
        isChecked: false,
        text: "World"
      }
    ];

    const expected = [
      items[0],
      {
        isChecked: true,
        text: "World"
      }
    ];

    const todos = checkTodos(items, [1]);

    expect(todos).toEqual(expected);
  });

  it("should return todos with unchecked item", () => {
    const items = [
      {
        isChecked: false,
        text: "Hello"
      },
      {
        isChecked: true,
        text: "World"
      }
    ];

    const expected = [
      items[0],
      {
        isChecked: false,
        text: "World"
      }
    ];

    const todos = checkTodos(items, [1]);

    expect(todos).toEqual(expected);
  });
});

describe("removeTodos()", () => {
  it("should return todos without removed items", () => {
    const items = [
      {
        isChecked: false,
        text: "Hello"
      },
      {
        isChecked: false,
        text: "World"
      },
      {
        isChecked: false,
        text: "Yay"
      }
    ];

    const expected = [items[1]];
    const todos = removeTodos(items, [0, 2]);

    expect(todos).toEqual(expected);
  });
});

describe("showTodos()", () => {
  global.console = { log: jest.fn() };

  it("should show todos on screen", () => {
    const items = [
      {
        isChecked: true,
        text: "Hello"
      },
      {
        isChecked: false,
        text: "World"
      },
      {
        isChecked: false,
        text: "Yay"
      }
    ];

    showTodos(items);

    expect(console.log).toBeCalledWith("0 - [X] Hello (green)");
    expect(console.log).toBeCalledWith("1 - [ ] World (blue)");
    expect(console.log).toBeCalledWith("2 - [ ] Yay (blue)");
  });
});

describe("showHelp()", () => {
  global.console = { log: jest.fn() };

  it("should show help on screen", () => {
    showHelp();

    expect(console.log).toBeCalledWith(expect.any(String));
  });
});
