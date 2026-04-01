import { render, screen, fireEvent } from "@testing-library/react";
import Habits from "../components/Habits";
import { vi, describe, beforeEach, expect, afterEach, test } from "vitest";
import { copySelection } from "@testing-library/user-event/dist/cjs/document/copySelection.js";

function setup() {
  render(<Habits />);
  const input = screen.getByLabelText(/new habit/i);
  const addButton = screen.getByRole("button", { name: /add/i });
  return { input, addButton };
}

function addHabit(input, addButton, text) {
  fireEvent.change(input, { target: { value: text } });
  fireEvent.click(addButton);
}

// small helpers (keep tests super readable)
function toggleDone(habitText) {
  const checkbox = screen.getByRole("checkbox", {
    name: new RegExp(`mark\\s+${habitText}\\s+done`, "i"),
  });
  fireEvent.click(checkbox);
  return checkbox;
}

function clickFilter(name) {
  fireEvent.click(screen.getByRole("button", { name }));
}

function clearCompletedBtn() {
  return screen.getByRole("button", { name: /clear completed/i });
}

describe("add/Update", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("shows empty state when no habits exist", () => {
    render(<Habits />);
    expect(screen.getByText(/no habits/i)).toBeInTheDocument();
  });

  test("adds a habit and shows it in the list", () => {
    const { input, addButton } = setup();
    addHabit(input, addButton, "Drink water");

    expect(screen.getByDisplayValue("Drink water")).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  test("delete habit", () => {
    const { input, addButton } = setup();
    addHabit(input, addButton, "Meditate");
    addHabit(input, addButton, "Read book");

    fireEvent.click(screen.getByRole("button", { name: /delete meditate/i }));

    expect(screen.queryByDisplayValue("Meditate")).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("Read book")).toBeInTheDocument();
  });

  test("add textbox should not allow empty spaces at the start", () => {
    const { input, addButton } = setup();

    // IMPORTANT: don't click add. Just type spaces and confirm button disabled.
    fireEvent.change(input, { target: { value: " " } });

    expect(addButton).toBeDisabled();
  });

  test("if habit is not completed then the input box allows edit", () => {
    const { input, addButton } = setup();
    addHabit(input, addButton, "test input box editing");

    const habitInputBox = screen.getByDisplayValue("test input box editing");
    expect(habitInputBox).not.toBeDisabled();

    toggleDone("test input box editing");
    expect(habitInputBox).toBeDisabled();

    toggleDone("test input box editing");
    expect(habitInputBox).not.toBeDisabled();
  });

  test("if habit is completed then disable the input box", () => {
    const { input, addButton } = setup();
    addHabit(input, addButton, "complete run");

    toggleDone("complete run");

    expect(screen.getByDisplayValue("complete run")).toBeDisabled();
  });

  test("inline edit on habit updates the habit", () => {
    const { input, addButton } = setup();
    addHabit(input, addButton, "test inline edit");

    const habitInputBox = screen.getByDisplayValue(/test inline edit/i);
    fireEvent.change(habitInputBox, {
      target: { value: "test inline edit update" },
    });

    expect(habitInputBox).toHaveValue("test inline edit update");
  });
});

describe("Filters", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("Active filter shows active habits", () => {
    const { input, addButton } = setup();
    expect(screen.getByText(/no habits/i)).toBeInTheDocument();

    addHabit(input, addButton, "first habit");
    addHabit(input, addButton, "second habit");

    toggleDone("second habit");
    clickFilter(/active/i);

    expect(screen.getByDisplayValue("first habit")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("second habit")).not.toBeInTheDocument();
  });

  test("Completed filter shows completed habits", () => {
    const { input, addButton } = setup();
    expect(screen.getByText(/no habits/i)).toBeInTheDocument();

    addHabit(input, addButton, "first habit");
    addHabit(input, addButton, "second habit");

    toggleDone("second habit");
    clickFilter("Completed");

    expect(screen.queryByDisplayValue("first habit")).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("second habit")).toBeInTheDocument();
  });

  test("All filter shows all habits", () => {
    const { input, addButton } = setup();
    expect(screen.getByText(/no habits/i)).toBeInTheDocument();

    addHabit(input, addButton, "first habit");
    addHabit(input, addButton, "second habit");

    toggleDone("second habit");
    clickFilter(/all/i);

    expect(screen.getByDisplayValue("first habit")).toBeInTheDocument();
    expect(screen.getByDisplayValue("second habit")).toBeInTheDocument();
  });
});

describe("Clear Completed", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("Button disabled when no completed habits", () => {
    const { input, addButton } = setup();

    addHabit(input, addButton, "active habit");
    addHabit(input, addButton, "second ac habit");

    expect(clearCompletedBtn()).toBeDisabled();
  });

  test("After completing one habit: button enabled", () => {
    const { input, addButton } = setup();

    addHabit(input, addButton, "active habit");
    addHabit(input, addButton, "second ac habit");

    expect(clearCompletedBtn()).toBeDisabled();

    toggleDone("active habit");
    expect(clearCompletedBtn()).not.toBeDisabled();
  });

  test("Click it: completed habit removed, active remains", () => {
    const { input, addButton } = setup();

    addHabit(input, addButton, "active habit");
    addHabit(input, addButton, "second ac habit");

    toggleDone("active habit");
    fireEvent.click(clearCompletedBtn());

    expect(screen.getByDisplayValue("second ac habit")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("active habit")).not.toBeInTheDocument();
  });

  test("Filter resets to All", () => {
    const { input, addButton } = setup();

    addHabit(input, addButton, "active habit");
    addHabit(input, addButton, "second ac habit");

    toggleDone("active habit");
    fireEvent.click(clearCompletedBtn());

    expect(screen.getByRole("button", { name: /all/i })).toHaveClass(
      "activeFilter"
    );
  });
});
describe("local storage persistence", () => {
  let store;
  let getItem;
  let setItem;

  beforeEach(() => {
    store = {};
    getItem = vi.fn((key) => (key in store ? store[key] : null));
    setItem = vi.fn((key, value) => {
      store[key] = String(value);
    });

    vi.stubGlobal("localStorage", {
      getItem,
      setItem,
      removeItem: vi.fn((key) => delete store[key]),
      clear: vi.fn(() => (store = {})),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("loads initial habits from localStorage on mount", () => {
    store.savedHabits = JSON.stringify([
      { id: "1", value: "Drink water", done: false, completedDates: [] },
    ]);

    render(<Habits />);

    expect(getItem).toHaveBeenCalledWith("savedHabits");

    // More stable than getByDisplayValue (avoids matching the wrong input)
    expect(screen.getByLabelText(/edit drink water/i)).toBeInTheDocument();
  });

  test("saves to localStorage when habits change", () => {
    render(<Habits />);

    const input = screen.getByLabelText(/new habit/i);
    const addButton = screen.getByRole("button", { name: /add/i });

    fireEvent.change(input, { target: { value: " Read 5 pages" } });
    fireEvent.click(addButton);

    // Find latest save to the correct key (doesn't rely on "last call overall")
    const savedCalls = setItem.mock.calls.filter(([key]) => key === "savedHabits");
    expect(savedCalls.length).toBeGreaterThan(0);

    const [, json] = savedCalls.at(-1);
    const saved = JSON.parse(json);

    expect(saved).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          done: false,
          value: expect.stringMatching(/^read 5 pages$/i),
        }),
      ])
    );
  });
});

//   let getSpy, setSpy;

//   beforeEach(() => {
//     localStorage.clear();
//     getSpy = vi.spyOn(Storage.prototype, "getItem");
//     setSpy = vi.spyOn(Storage.prototype, "setItem");
//   });

//   afterEach(() => {
//     vi.restoreAllMocks();
//     localStorage.clear();
//   });

//   test("loads initial habits from localStorage on mount", () => {
//     getSpy.mockReturnValueOnce(
//       JSON.stringify([{ id: "1", value: "Drink water", done: false }])
//     );

//     render(<Habits />);

//     expect(getSpy).toHaveBeenCalledWith("savedHabits");
//     expect(screen.getByDisplayValue("Drink water")).toBeInTheDocument();
//   });

//   test("saves to localStorage when habits change", () => {
//     getSpy.mockReturnValueOnce(null);

//     const { input, addButton } = setup();
//     addHabit(input, addButton, " Read 5 pages"); // your app trims

//     expect(setSpy).toHaveBeenCalled();

//     const [key, json] = setSpy.mock.calls.at(-1);
//     expect(key).toBe("savedHabits");

//     const saved = JSON.parse(json);
//     expect(saved).toEqual(
//       expect.arrayContaining([
//         expect.objectContaining({
//           done: false,
//           value: expect.stringMatching(/^read 5 pages$/i), // robust to casing
//         }),
//       ])
//     );
//   });
// });

describe("Empty state per filter", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('With no completed habits, go to "Completed" → shows "No completed habits yet"', () => {
    const { input, addButton } = setup();

    addHabit(input, addButton, "Read 5 pages");

    clickFilter("Completed");
    expect(screen.getByText(/no completed habits yet/i)).toBeInTheDocument();
  });

  test('With no active habits, go to "Active" → shows "No active habits yet"', () => {
    const { input, addButton } = setup();

    addHabit(input, addButton, "Read 5 pages");
    toggleDone("Read 5 pages");

    clickFilter("Active");
    expect(screen.getByText(/no active habits yet/i)).toBeInTheDocument();
  });
});

describe("Import/Export", () => {
  beforeEach(() => {
    localStorage.clear();
     window.alert = vi.fn();

     URL.createObjectURL = vi.fn(() => "blob:mock-url");
     URL.revokeObjectURL = vi.fn();
  });

  test("Import button should import habits", async() => {
    render(<Habits />);
     const fileInput = document.querySelector('input[type="file"]');
     const file = new File([
       JSON.stringify([
        { id: "1", value: "Read book", done: false, completedDates: [] },
        { id: "2", value: "Workout", done: true, completedDates: [] }
      ])
     ],"habit.json", {type: "application/json"})

    fireEvent.change(fileInput, {
    target: { files: [file] },
    });
      expect(await screen.findByDisplayValue("Read book")).toBeInTheDocument();
      expect(await screen.findByDisplayValue("Workout")).toBeInTheDocument();
  });

    test("Invalid json does not update habit", async() => {
    const { input, addButton } = setup();
    addHabit(input, addButton, "Drink water");
     const fileInput = document.querySelector('input[type="file"]');
     const file = new File([
        '{ invalid: "json" }'
     ],"habit.json", {type: "application/json"})

    fireEvent.change(fileInput, {
    target: { files: [file] },
    });
      expect(screen.getByDisplayValue("Drink water")).toBeInTheDocument();
  });

  test("wrong schema does not update habit", async() => {
    const { input, addButton } = setup();
    addHabit(input, addButton, "Drink water");
     const fileInput = document.querySelector('input[type="file"]');
    const file = new File([
       JSON.stringify([
        {"wrong": "schema" }
      ])
     ],"habit.json", {type: "application/json"})

    fireEvent.change(fileInput, {
    target: { files: [file] },
    });
      expect(screen.getByDisplayValue("Drink water")).toBeInTheDocument();
  });
 test("clicking export downloads habits as json file", () => {
  // mock function to track if "download" (click) was triggered
  const clickMock = vi.fn();

  // save original createElement so we can still use it for non-"a" elements
  // bind ensures "this" remains document
  const originalCreateElement = document.createElement.bind(document);

  // this will act like our fake <a> tag
  const fakeLink = {
    href: "",       // will hold the blob URL
    download: "",   // will hold file name
    click: clickMock, // we track if click was called
  };

  // intercept document.createElement
  vi.spyOn(document, "createElement").mockImplementation((tagName) => {
    if (tagName === "a") {
      // if app tries to create <a>, return our fake link
      return fakeLink;
    }
    // for all other elements, behave normally
    return originalCreateElement(tagName);
  });

  // render component and add a habit (so export has data)
  const { input, addButton } = setup();
  addHabit(input, addButton, "Drink water");

  // simulate user clicking Export button
  const exportBtn = screen.getByRole("button", { name: /export/i });
  fireEvent.click(exportBtn);

  // now verify export flow happened correctly

  // 1. blob URL should be created
  expect(URL.createObjectURL).toHaveBeenCalled();

  // 2. link should receive that blob URL
  expect(fakeLink.href).toBe("blob:mock-url");

  // 3. file name should be correct
  expect(fakeLink.download).toBe("habits.json");

  // 4. click should be triggered → download starts
  expect(clickMock).toHaveBeenCalled();

  // 5. cleanup should happen (important step)
  expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
});

});
