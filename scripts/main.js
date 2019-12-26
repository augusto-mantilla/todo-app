const input = document.getElementById("newTodoInput");
console.log(input.value);
const button = document.getElementById("newTodoButton");
const toRequest = document.getElementById("toRequest");
const requested = document.getElementById("requested");
const onDelivery = document.getElementById("onDelivery");
const delivered = document.getElementById("delivered");
const states = [toRequest, requested, onDelivery, delivered];
let idn = 0;
const deleteTodo = todoId => {
  let tdItem = document.getElementById(todoId);
  tdItem.remove();
};

const moveToNextColumn = todoId => {
  let tdItem = document.getElementById(todoId);
  let index = states.indexOf(tdItem.parentNode);
  states[index + 1].append(tdItem);
  if (tdItem.parentNode === states[states.length - 1]) {
    tdItem.lastChild.remove();
  }
};

const addTodo = () => {
  const todoItem = document.createElement("div");
  const deleteButton = document.createElement("button");
  const nextButton = document.createElement("button");
  todoItem.className = "todoItem";
  todoItem.id = `todo${idn}`;
  todoItem.innerHTML = input.value;
  deleteButton.innerHTML = "x";
  nextButton.innerHTML = "»";
  nextButton.id = `nextButton${idn}`;

  todoItem.append(deleteButton);
  todoItem.append(nextButton);
  toRequest.append(todoItem);
  deleteButton.addEventListener("click", () => deleteTodo(todoItem.id));
  nextButton.addEventListener("click", () => moveToNextColumn(todoItem.id));
  input.value = "";
  idn++;
};

button.addEventListener("click", addTodo);

input.addEventListener("keydown", e => {
  if (e.keyCode === 13) {
    console.log(e.key);
    addTodo();
  }
});
