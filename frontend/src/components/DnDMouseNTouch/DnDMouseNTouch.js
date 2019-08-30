import React, { useState, useEffect } from "react";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import "./DnDMouseNTouch.css";

const DnDMouseTouch = () => {
  const [food, setFood] = useState([
    {
      id: "1",
      content: "🍰 Cake",
      img:
        "https://images.unsplash.com/photo-1535141192574-5d4897c12636?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: "2",
      content: "🍩 Donut",
      img:
        "https://images.unsplash.com/photo-1506224772180-d75b3efbe9be?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: "3",
      content: "🍎 Apple",
      img:
        "https://images.unsplash.com/photo-1513677785800-9df79ae4b10b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: "4",
      content: "🍕 Pizza",
      img:
        "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
    }
  ]);

  // useEffect(() => {
  // refElem.current.onselectstart = () => {
  //   return false;
  // };

  const onDragEnd = result => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newFood = [...food];
    newFood.splice(source.index, 1);
    const draggableItem = food.find(item => item.id === draggableId);
    newFood.splice(destination.index, 0, draggableItem);
    setFood(newFood);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="Dnd">
        <main>
          <h3>List of items</h3>
          <Droppable droppableId="dnd">
            {provided => (
              <ul {...provided.droppableProps} ref={provided.innerRef}>
                {food.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {provided => (
                      <li
                        className="dndListItem"
                        {...provided.draggableProps}
                        ref={provided.innerRef}
                      >
                        <div className="drag">
                          <i className="fas fa-bars" {...provided.dragHandleProps} />
                        </div>
                        {item.content}
                        <img src={item.img} alt="" height="100" />
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </main>
      </div>
    </DragDropContext>
  );
};

export default DnDMouseTouch;
