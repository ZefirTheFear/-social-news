import React, { useState, useEffect, useRef } from "react";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import cloneDeep from "clone-deep";

import NewContentTextContainer from "../NewContentTextContainer/NewContentTextContainer";
import NewContentImageContainer from "../NewContentImageContainer/NewContentImageContainer";

import "./ContentMaker.scss";

const ContentMaker = props => {
  const inputEl = useRef();

  const [newContentData, setNewContentData] = useState([]);

  useEffect(() => {
    if (props.contentData) {
      console.log(props.contentData);
      setNewContentData(props.contentData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    props.sendContentMakerStateHandler(newContentData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newContentData]);

  // Content Data (TextBlock)
  const addTextBlockHandler = () => {
    setNewContentData([...newContentData, { type: "text", content: "", key: Date.now() }]);
  };

  const onChangeTextBlockData = (e, index) => {
    const contentData = cloneDeep(newContentData);

    e.currentTarget.style.height = "auto";
    e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";

    contentData[index].content = e.target.value;
    setNewContentData(contentData);
  };

  // Post Data (ImgBlock)
  const clickImgInput = () => {
    inputEl.current.click();
  };

  const addImageHandler = event => {
    const newImages = [];
    for (let image of event.target.files) {
      newImages.push({
        type: "image",
        content: image,
        url: URL.createObjectURL(image),
        key: Date.now() * Math.random()
      });
    }
    setNewContentData([...newContentData, ...newImages]);
    event.target.value = null;
  };

  // RemovingBlock
  const removeNewPostBlockHandler = index => {
    const contentData = [...newContentData];
    contentData.splice(index, 1);
    setNewContentData(contentData);
  };

  const onDragEnd = result => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newData = cloneDeep(newContentData);
    const draggableItem = newData.find(item => item.key === draggableId);
    newData.splice(source.index, 1);
    newData.splice(destination.index, 0, draggableItem);
    setNewContentData(newData);
  };

  return (
    <div className="content-maker">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="dnd">
          {provided => (
            <div
              className="content-maker__inner"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {newContentData.map((item, index) => (
                <Draggable key={item.key} draggableId={item.key} index={index}>
                  {provided => (
                    <div
                      className="content-maker__inner-item"
                      {...provided.draggableProps}
                      ref={provided.innerRef}
                    >
                      <div
                        className="content-maker__inner-item-dragger"
                        {...provided.dragHandleProps}
                      />
                      {item.type === "text" ? (
                        <NewContentTextContainer
                          content={item.content}
                          index={index}
                          onChangeNewPostData={onChangeTextBlockData}
                          removeBlock={() => removeNewPostBlockHandler(index)}
                        />
                      ) : (
                        <NewContentImageContainer
                          url={item.url}
                          removeBlock={() => removeNewPostBlockHandler(index)}
                        />
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        <div className="content-maker__controls">
          <div className="content-maker__add-txt">
            <button
              type="button"
              className="content-maker__add-txt-btn"
              onClick={addTextBlockHandler}
            />
            <div className="content-maker__add-txt-txt">текcт</div>
          </div>
          <div className="content-maker__add-img">
            <button type="button" className="content-maker__add-img-btn" onClick={clickImgInput} />
            <div className="content-maker__add-img-txt">картинка</div>
          </div>
        </div>
        <input
          type="file"
          className="new-post__img-input"
          multiple
          accept="image/*"
          onChange={addImageHandler}
          ref={inputEl}
        />
      </DragDropContext>
    </div>
  );
};

export default ContentMaker;
