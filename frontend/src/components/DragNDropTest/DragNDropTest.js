import React, { useState } from "react";

import "./DragNDrop.css";

const DragNDrop = () => {
  const [food, setFood] = useState(["🍰 Cake", "🍩 Donut", "🍎 Apple", "🍕 Pizza"]);
  const [draggedItem, setDraggedItem] = useState(null);

  const onDragStart = (e, index) => {
    setDraggedItem(food[index]);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.parentNode);
    e.dataTransfer.setDragImage(e.target.parentNode, 20, 20);
  };

  const onDragOver = (e, index) => {
    // чтобы драгговер левых элементов ничего не делал
    if (draggedItem === null) {
      return;
    }

    e.preventDefault();

    const draggedOverItem = food[index];

    // if the item is dragged over itself, ignore
    if (draggedItem === draggedOverItem) {
      return;
    }

    // filter out the currently dragged item
    let items = food.filter(item => item !== draggedItem);

    // add the dragged item after the dragged over item
    items.splice(index, 0, draggedItem);

    setFood(items);
  };

  const onDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="App">
      <main>
        <h3>List of items</h3>
        <ul>
          {food.map((item, index) => (
            <li className="listItem2" key={item} onDragOver={e => onDragOver(e, index)}>
              <div
                className="drag"
                draggable
                onDragStart={e => onDragStart(e, index)}
                onDragEnd={onDragEnd}
              >
                <i className="fas fa-bars" />
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
