import React, { useState } from "react";

import "./DragNDrop2.css";

const DragNDrop = () => {
  const [food, setFood] = useState(["🍰 Cake", "🍩 Donut", "🍎 Apple", "🍕 Pizza"]);
  const [draggedArrItem, setDraggedArrItem] = useState(null);
  const [draggedElem, setDraggedElem] = useState(null);
  const [draggedElemIndex, setDraggedElemIndex] = useState(null);

  const onDragStart = (e, index) => {
    setDraggedArrItem(food[index]);
    setDraggedElem(e.target.parentNode);
    setDraggedElemIndex(index);
    e.target.parentNode.classList.add("transition");

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.parentNode);
    e.dataTransfer.setDragImage(e.target.parentNode, 30, 20);

    e.target.parentNode.style.filter = "blur(3px)";
    e.target.parentNode.style.opacity = "0.8";
  };

  const onDragEnter = (e, index) => {
    // чтобы не срабатывал на внутренних элементах
    if (e.target !== e.currentTarget) {
      return;
    }

    // чтобы драггентер левых элементов ничего не делал
    if (draggedArrItem === null) {
      return;
    }

    const draggedOverArrItem = food[index];

    // if the item is dragged over itself, ignore
    if (draggedArrItem === draggedOverArrItem) {
      return;
    }

    const dragOverElem = e.target;
    dragOverElem.classList.add("transition");
    draggedElem.classList.add("transition");

    if (draggedElemIndex < index) {
      draggedElem.style.top =
        dragOverElem.offsetHeight +
        parseFloat(window.getComputedStyle(draggedElem).marginBottom) +
        parseFloat(window.getComputedStyle(dragOverElem).marginTop) +
        "px";
      dragOverElem.style.top =
        -draggedElem.offsetHeight -
        parseFloat(window.getComputedStyle(dragOverElem).marginTop) -
        parseFloat(window.getComputedStyle(draggedElem).marginBottom) +
        "px";
    } else {
      draggedElem.style.top =
        -dragOverElem.offsetHeight -
        parseFloat(window.getComputedStyle(draggedElem).marginTop) -
        parseFloat(window.getComputedStyle(dragOverElem).marginBottom) +
        "px";
      dragOverElem.style.top =
        draggedElem.offsetHeight +
        parseFloat(window.getComputedStyle(draggedElem).marginBottom) +
        parseFloat(window.getComputedStyle(dragOverElem).marginTop) +
        "px";
    }

    setTimeout(() => {
      dragOverElem.classList.remove("transition");
      draggedElem.classList.remove("transition");
      dragOverElem.style.top = "0";
      draggedElem.style.top = "0";

      // filter out the currently dragged item
      let items = food.filter(item => item !== draggedArrItem);

      // add the dragged item after the dragged over item
      items.splice(index, 0, draggedArrItem);

      setFood(items);
      setDraggedElemIndex(index);
    }, 250);
  };

  const onDragLeave = (e, index) => {
    // чтобы не срабатывал на внутренних элементах
    if (e.target !== e.currentTarget) {
      return;
    }

    // чтобы драггентер левых элементов ничего не делал
    if (draggedArrItem === null) {
      return;
    }

    // console.log(draggedElem.style.animationPlayState);
    // draggedElem.style.animationPlayState = "paused";
  };

  const onDragOver = (e, index) => {
    // чтобы драгговер левых элементов ничего не делал
    if (draggedArrItem === null) {
      return;
    }
    e.preventDefault();
  };

  const onDragEnd = e => {
    draggedElem.style.filter = "";
    draggedElem.style.opacity = "";
    setDraggedArrItem(null);
    setDraggedElem(null);
    setDraggedElemIndex(null);
  };

  return (
    <div className="App">
      <main>
        <h3>List of items</h3>
        <ul>
          {food.map((item, index) => (
            <li
              className="listItem"
              key={item}
              onDragOver={e => onDragOver(e, index)}
              onDragEnter={e => onDragEnter(e, index)}
              onDragLeave={e => onDragLeave(e, index)}
            >
              <div
                className="drag"
                draggable
                onDragStart={e => onDragStart(e, index)}
                onDragEnd={onDragEnd}
              >
                <i
                  className="fas fa-bars"
                  onDragEnter={e => {
                    return false;
                  }}
                />
              </div>
              {item}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default DragNDrop;
