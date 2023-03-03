import React, { useState } from 'react';
import './App.css';
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState, convertToRaw, AtomicBlockUtils } from "draft-js";
import draftToHtml from "draftjs-to-html";
import ReactHtmlParser from 'react-html-parser';

function App(this: any) {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const onEditorStateChange = (editorState: EditorState) => {
    // editorState에 값 설정
    setEditorState(editorState);
  };

  const editorToHtml = draftToHtml(
    convertToRaw(editorState.getCurrentContent())
  );

  const uploadImageCallBack = (file: File) => {
    console.log("aaaa");
    
    return new Promise((resolve, reject) => {
      console.log("bbbb:", URL.createObjectURL(file));
      resolve({ data: { link: URL.createObjectURL(file) } });
    });
  };

  const onClickHandler = (e: any) => {
    e.preventDefault();
    try {
      console.log("editorToHtml: ", editorToHtml)
    } catch (e) {
      console.log(e);
    }
  };

  const handleEditorDrop = async (e: any) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image')) {
        const newFile: any = await uploadImageCallBack(file);
        const entityData = { src: newFile.data.link, height: newFile.data?.metadata?.height || '320px', width: newFile.data?.metadata?.width || '320px' };
        const entityKey = editorState.getCurrentContent().createEntity('IMAGE', 'MUTABLE', entityData).getLastCreatedEntityKey();
        const newEditorState = AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
        setEditorState(newEditorState);
      }
  } 
  };

  return (
    <div className="App">
      <div className="notice__wrap">
          <h2 className="notice__title">내용</h2>
          <div onDrop={handleEditorDrop}>
            <Editor
              // 툴바 설정
              toolbar={{
                //options: ['image'],
                // inDropdown: 해당 항목과 관련된 항목을 드롭다운으로 나타낼것인지
                list: { inDropdown: true },
                textAlign: { inDropdown: true },
                link: { inDropdown: true },
                history: { inDropdown: false },
                image: {
                  uploadCallback: uploadImageCallBack,
                  //alt: { present: true, mandatory: true},
                },
              }}
              placeholder="내용을 작성해주세요."
              // 한국어 설정
              localization={{
                locale: "ko",
              }}
              // 초기값 설정
              editorState={editorState}
              // 에디터의 값이 변경될 때마다 onEditorStateChange 호출
              onEditorStateChange={onEditorStateChange}
            />
          </div>
      </div>
       <div className="notice__buttonWrap">
        <button className="notice__button" onClick={onClickHandler}>
          등록
        </button>
        <button className="notice__button">취소</button>
      </div>
      <div>
        {ReactHtmlParser(editorToHtml)}
      </div>
    </div>
  );
}

export default App;
