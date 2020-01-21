const input = document.getElementById('newTodoInput')
const toRequest = document.getElementById('toRequest')
const requested = document.getElementById('requested')
const onDelivery = document.getElementById('onDelivery')
const delivered = document.getElementById('delivered')
const states = [toRequest, requested, onDelivery, delivered]
const button = document.getElementById('newTodoButton')
let idn = 0 // temporal id number for the todos

const sections = new Map()
sections.set('toRequest', toRequest)
sections.set('requested', requested)
sections.set('onDelivery', onDelivery)
sections.set('delivered', delivered)

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

// To simulate delays in the connection with the server
const sleep = milliseconds =>
  new Promise(resolve => setTimeout(resolve, milliseconds))

const insertTodo = (newTodo, newDeleteButton) => {
  const myHeaders = new Headers()

  const myRequest = new Request('/id', {
    method: 'GET',
    headers: myHeaders,
    cache: 'default'
  })

  fetchAndRetry(myRequest, newTodo, newDeleteButton)
}

const createError = error => {
  const errMessage = document.createElement('div')
  errMessage.className = 'errorMessage'
  errMessage.textContent = error
  errMessage.style.color = '#ff0000'
  return errMessage
}

const createRetryButton = () => {
  const retryButton = document.createElement('button')
  retryButton.className = 'retryButton'
  retryButton.textContent = `🔄`
  return retryButton
}

const fetchAndRetry = (myRequest, newTodo, newDeleteButton) => {
  fetch(myRequest)
    .then(response => {
      if (!response.ok) {
        throw new Error('HTTP error, status = ' + response.status)
      }
      return response.json()
    })
    .then(async id => {
      await sleep(2000)
      newTodo.id = `todo${id}`
      const newNextButton = createNextButton(id)
      newNextButton.addEventListener('click', () =>
        moveToNextColumn(newTodo.id)
      )

      newTodo.classList.remove('dimmed')
      newDeleteButton.classList.remove('dimmed')
      newDeleteButton.addEventListener('click', () => deleteElement(newTodo.id))

      newTodo.append(newNextButton)
    })
    .catch(error => {
      if (error.message.includes('NetworkError')) {
        const errMessage = createError(error)
        const retryButton = createRetryButton()
        retryButton.addEventListener('click', () => {
          errMessage.remove()
          fetchAndRetry(myRequest, newTodo, newDeleteButton)
        })
        errMessage.append(retryButton)
        newTodo.append(errMessage)
        document
          .getElementById(newTodo.id.replace('todo', 'deleteButton'))
          .addEventListener('click', () => deleteElement(newTodo.id))
      }
      newDeleteButton.classList.remove('dimmed')
    })
}

const createTodoItem = (id, content) => {
  const newItem = document.createElement('div')
  newItem.className = 'todoItem'
  newItem.id = `todo${id}`
  newItem.innerHTML = content
  return newItem
}

const addTodo = () => {
  if (input.value.length > 2) {
    // optimistically add the todo item with the temporary prefix
    const prefix = 'temp'
    const newTodo = createTodoItem(prefix + idn, input.value)
    const newDeleteButton = createDeleteButton(prefix + idn)
    newTodo.classList.add('dimmed')
    newDeleteButton.classList.add('dimmed')
    newTodo.append(newDeleteButton)
    toRequest.append(newTodo)
    //    newDeleteButton.addEventListener('click', () => deleteElement(newTodo.id))
    input.value = ''
    //    pending.push(idn)
    idn++
    insertTodo(newTodo, newDeleteButton)
  }
}

const createDeleteButton = id => {
  dltBtn = document.createElement('button')
  dltBtn.className = 'deleteButton'
  dltBtn.id = `deleteButton${id}`
  dltBtn.innerHTML = 'x'
  return dltBtn
}

const createNextButton = id => {
  nxtBtn = document.createElement('button')
  nxtBtn.className = 'nextButton'
  nxtBtn.id = `nextButton${id}`
  nxtBtn.innerHTML = '»'
  return nxtBtn
}

const generateTodos = json => {
  Object.entries(json).forEach(([key, value]) => {
    for (const el of value) {
      const todoItem = createTodoItem(el.Id, el.Content)
      const deleteBtn = createDeleteButton(el.Id)

      deleteBtn.addEventListener('click', () => deleteElement(todoItem.id))
      todoItem.append(deleteBtn)

      if (el.State !== 'delivered') {
        const nextBtn = createNextButton(el.Id)
        nextBtn.addEventListener('click', () => moveToNextColumn(todoItem.id))
        todoItem.append(nextBtn)
      }
      sections.get(key).append(todoItem)
    }
  })
}

const generatePage = () => {
  fetch('/data')
    .then(response => response.json())
    .then(jsn => {
      console.log(jsn)
      generateTodos(jsn)
    })
}

generatePage()

button.addEventListener('click', addTodo)

input.addEventListener('keydown', e => {
  if (e.keyCode === 13) {
    addTodo()
  }
})
