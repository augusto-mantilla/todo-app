const input = document.getElementById('newTodoInput')
const button = document.getElementById('newTodoButton')
const toRequest = document.getElementById('toRequest')
const requested = document.getElementById('requested')
const onDelivery = document.getElementById('onDelivery')
const delivered = document.getElementById('delivered')
const states = [toRequest, requested, onDelivery, delivered]
const todos = [...document.getElementsByClassName('todoItem')]
const deleteButtons = [...document.getElementsByClassName('deleteButton')]
const nextButtons = [...document.getElementsByClassName('nextButton')]
let idn = 0 // temporal id for the todos inserted in the document but
// still pending
const pending = [] // keeps the values of the todos inserted in the
// document but still not received by the server

const deleteElement = todoId => {
  const tdItem = document.getElementById(todoId)
  tdItem && tdItem.remove()
}

const moveToNextColumn = todoId => {
  const tdItem = document.getElementById(todoId)
  const index = states.indexOf(tdItem.parentNode)
  states[index + 1].append(tdItem)
  if (tdItem.parentNode === delivered) {
    deleteElement(todoId.replace('todo', 'nextButton'))
  }
}

const nextId = () => {
  for (const tdItem of todos) {
  }
}

const addEventOnClick = (collection, selector, handler) => {
  const onClick = ev => handler(ev.target.id.replace(selector, 'todo'))

  for (const el of collection) {
    el.addEventListener('click', onClick)
  }
}

// To simulate delays in the connection with the server
const sleep = milliseconds =>
  new Promise(resolve => setTimeout(resolve, milliseconds))

const createNewTodoItem = idn => {
  const todoItem = document.createElement('div')
  const deleteButton = document.createElement('button')
  const nextButton = document.createElement('button')
  todoItem.style.cssText = 'background: rgba(40,40,40,0.5); color: #dd8888;'
  todoItem.className = 'todoItem'
  todoItem.id = `todotemp${idn}`
  todoItem.innerHTML = input.value
  deleteButton.className = 'deleteButton'
  deleteButton.innerHTML = 'x'
  deleteButton.id = `deleteButtontemp${idn}`
  nextButton.innerHTML = '»'
  nextButton.id = `nextButtontemp${idn}`
  nextButton.className = 'nextButton'
  todoItem.append(deleteButton)
  todoItem.append(nextButton)
  toRequest.append(todoItem)
  deleteButton.addEventListener('click', () => deleteElement(todoItem.id))
  nextButton.addEventListener('click', () => moveToNextColumn(todoItem.id))
  input.value = ''
  return todoItem
}

const updateTodoId = (pending, id) => {
  todoId = `todotepm${pending}`
  const newItem = document.getElementById(`todotemp${pending}`)
  const newDeleteButton = document.getElementById(`deleteButtontemp${pending}`)
  const newNextButton = document.getElementById(`nextButtontemp${pending}`)
  newItem.style.cssText = ''
  newItem.id = newItem.id.replace(`temp*`, id)
  newDeleteButton.id = newDeleteButton.id.replace(`temp*`, id)
  newNextButton.id = newNextButton.id.replace(`temp*`, id)
}

const insertTodo = pending => {
  const myHeaders = new Headers()

  const myRequest = new Request('/id', {
    method: 'GET',
    headers: myHeaders,
    cache: 'default'
  })

  fetchAndRetry(myRequest, pending)
}

const fetchAndRetry = (myRequest, pending) => {
  fetch(myRequest)
    .then(response => {
      if (!response.ok) {
        throw new Error('HTTP error, status = ' + response.status)
      }
      return response.json()
    })
    .then(async id => {
      await sleep(2000)
      updateTodoId(pending[0], id)
      pending.splice(0, 1)
    })
    .catch(error => {
      if (error.message.match('NetworkError') != null) {
        const errMessage = document.createElement('div')
        errMessage.innerHTML = error
        errMessage.style.cssText = 'color: #ff0000;'

        const retryButton = document.createElement('button')
        retryButton.className = 'retryButton'
        retryButton.innerHTML = '&#128260'

        retryButton.addEventListener('click', () => {
          errMessage.remove()
          fetchAndRetry(myRequest, pending)
        })
        errMessage.append(retryButton)
        newTodo.append(errMessage)
      }
    })
}

const addTodo = () => {
  if (input.value.length > 2) {
    // optimistically add the todo item with the temporary prefix
    newTodo = createNewTodoItem(idn)
    pending.push(idn)
    idn++
    insertTodo(pending)
  }
}

addEventOnClick(deleteButtons, 'deleteButton', deleteElement)
addEventOnClick(nextButtons, 'nextButton', moveToNextColumn)

// When a comment is so long that is getting until the end of the line
button.addEventListener('click', addTodo)

input.addEventListener('keydown', e => {
  if (e.keyCode === 13) {
    addTodo()
  }
})
