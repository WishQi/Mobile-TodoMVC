/**
 * Created by limaoqi on 20/06/2017.
 */

var $ = (sel) => {
    return document.querySelector(sel)
};

var $All = (sel) => {
    return document.querySelectorAll(sel)
};

var itemsNum = 0;

const CL_COMPLETED = "completed";
const CL_SELECTED = "selected";
const CL_EDITING = "editing";

function addItem(msg) {
    let todoList = $("#todo-list");
    let todoListItem = document.createElement("li");
    todoListItem.setAttribute("id", `item${itemsNum++}`);
    todoListItem.innerHTML = [
        "<input class='toggle' type='checkbox'>",
        `<label class='todo-label'>${msg}</label>`,
        "<button class='delete'>×</button>"
    ].join("");

    todoListItem.querySelector(".toggle").style.display = "none";
    todoListItem.querySelector(".delete").style.display = "none";

    let label = todoListItem.querySelector(".todo-label");
    label.addEventListener("click", () => {
        todoListItem.classList.add(CL_EDITING);
        let editInput = document.createElement("input");
        editInput.setAttribute("type", "text");
        editInput.setAttribute("value", label.innerHTML);
        editInput.classList.add("edit");

        let finished = false;
        function finishEditing() {
            if (finished) return;
            finished = true;
            editInput.remove();
            todoListItem.classList.remove(CL_EDITING);
        }

        editInput.addEventListener("blur", () => {
            finishEditing();
        }, false);

        editInput.addEventListener("keyup", (ev) => {
            if (ev.keyCode == 27) {
                finishEditing();
            } else if (ev.keyCode == 13) {
                label.innerHTML = editInput.value;
                finishEditing();
            }
        }, false);

        todoListItem.appendChild(editInput);
        editInput.focus();
    }, false);

    let startX = 0, startY = 0;

    todoListItem.addEventListener("touchstart", (ev) => {
        let touch = ev.touches[0];
        startX = touch.pageX;
        startY = touch.pageY;
    }, false);

    todoListItem.addEventListener("touchmove", (ev) => {
        let touch = ev.touches[0];
        let x = touch.pageX, y = touch.pageY;
        todoListItem.style.left = `${x - startX}px`;

        let distance = x - startX;
        if (distance > document.body.clientWidth/3) {
            let toggle = todoListItem.querySelector(".toggle");
            toggle.checked = true;
            toggle.style.display = "";
        } else if (distance < -document.body.clientWidth/3) {
            todoListItem.querySelector(".delete").style.display = "";
        }
        ev.stopPropagation();
    }, false);

    todoListItem.addEventListener("touchend", (ev) => {
        todoListItem.querySelector(".toggle").style.display = "none";

        let touch = ev.changedTouches[0];
        let x = touch.pageX, y = touch.pageY;
        let distance = x - startX;
        if (Math.abs(distance) < document.body.clientWidth/3) {
            returnToOrigin(todoListItem);
            return;
        }
        if (distance > 0) {
            // 右移，完成item
            let done = todoListItem.classList.contains(CL_COMPLETED);
            updateItemState(todoListItem.id, !done);
            returnToOrigin(todoListItem);
        } else {
            // 左移，删除item
            todoListItem.style.visibility = "hidden";
            let index = 0;
            let items = $All("#todo-list li");
            for (let i = 0; i < items.length; ++i) {
                if (items[i] === todoListItem) {
                    index = i;
                    break;
                }
            }
            for (let i = index + 1; i < items.length; ++i) {
                movingup(items[i]);
            }
            setTimeout(() => {
                removeItem(todoListItem.id);
            }, 510);
        }
    }, false);

    todoList.insertBefore(todoListItem, todoList.firstChild);
    update();
}

function returnToOrigin(node) {
    node.classList.add("moving-item");
    node.style.left = "0px";
    setTimeout(() => {
        node.classList.remove("moving-item");
    }, 510);
}

function movingup(node) {
    node.classList.add("moving-item");
    node.style.top = "-69px";
    setTimeout(() => {
        node.classList.remove("moving-item");
        node.style.top = "0px";
    }, 510);
}

function update() {
    let items = $All("#todo-list li");
    let filter = $("#filters li a.selected").innerHTML;
    let leftNum = 0;
    for (let i = 0; i < items.length; ++i) {
        let item = items[i];
        if (!item.classList.contains(CL_COMPLETED)) {
            ++leftNum;
        }
        let display = "none";
        if (filter == "All" || (filter == "Active" && !item.classList.contains(CL_COMPLETED)) || (filter == "Completed" && item.classList.contains(CL_COMPLETED))) {
            display = "";
        }
        item.style.display = display;
    }
    let compledtedNum = items.length - leftNum;
    $("#todo-count").innerHTML = (leftNum || "No") + (leftNum > 1 ? " items" : " item") + " left";
    $("#completed-clear").style.visibility = compledtedNum > 0 ? "visible" : "hidden";
    $("#toggle-all").style.visibility = items.length > 0 ? "visible" : "hidden";
    $("#toggle-all").checked = items.length == compledtedNum;
}

function removeItem(itemId) {
    $("#todo-list").removeChild($(`#${itemId}`));
    let index = itemId.substr(4);
    let data = model.data;
    data.items.splice(index, 1);
    model.flush();
    update();
}

function updateItemState(itemId, done) {
    let item = $(`#${itemId}`);
    if (done) {
        item.classList.add(CL_COMPLETED);
    } else {
        item.classList.remove(CL_COMPLETED);
    }

    let index = itemId.substr(4);
    model.data.items[index].completed = done;
    model.flush();
    update();
}

function clearCompletedItems() {
    let items = $("#todo-list").querySelectorAll("li");
    for (let i = items.length - 1; i >= 0; --i) {
        let item = items[i];
        if (item.classList.contains(CL_COMPLETED)) {
            removeItem(item.id);
        }
    }
    update();
}

function toggleAllItems() {
    let items = $All("#todo-list li");
    let toggleAllBtn = $("#toggle-all");
    let checked = toggleAllBtn.checked;
    for (let i = 0; i < items.length; ++i) {
        let item = items[i];
        if (checked) {
            item.classList.add(CL_COMPLETED);
        } else {
            item.classList.remove(CL_COMPLETED);
        }
    }
    update();
}

window.onload = () => {
    model.init(() => {
        let data = model.data;
        console.log("data:", data);

        let newTodo = $("#new-todo");
        newTodo.addEventListener("keyup", (ev) => {
            data.msg = newTodo.value;
            if (ev.keyCode != 13) return;
            let msg = newTodo.value;
            if (/^\s*$/.exec(msg)) {
                console.warn("msg is empty");
                return;
            }
            addItem(msg);
            data.items.push({msg: msg, completed: false});
            console.log(data);
            model.flush();
            newTodo.value = "";
        }, false);
        newTodo.addEventListener("change", (ev) => {
            model.flush();
        });

        $("#completed-clear").addEventListener('click', () => {
            clearCompletedItems();
        }, false);

        $("#toggle-all").addEventListener("change", () => {
            toggleAllItems();
            let completed = $("#toggle-all").checked;
            data.items.forEach((itemData) => {
                itemData.completed = completed;
            });
            update();
        }, false);

        let filters = $All("#filters li a");
        for (let i = 0; i < filters.length; ++i) {
            (
                function (filter) {
                    filter.addEventListener("click", () => {
                        data.filter = filter.innerHTML;
                        for (let j = 0; j < filters.length; ++j) {
                            filters[j].classList.remove(CL_SELECTED);
                        }
                        filter.classList.add(CL_SELECTED);
                        update();
                    }, false)
                }
            )(filters[i])
        }

        model.flush();
        data.items.forEach((itemData, index) => {
            addItem(itemData.msg);
            updateItemState(`item${index}`, itemData.completed);
        });

        update();
    });
};