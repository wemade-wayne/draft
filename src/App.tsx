import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";

function App(this: any) {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const onEditorStateChange = (editorState: EditorState) => {
    // editorState에 값 설정
    setEditorState(editorState);
  };

  const editorToHtml = draftToHtml(
    convertToRaw(editorState.getCurrentContent())
  );

  const uploadImageCallBack = (file: string | Blob, callback: any) => {
    console.log(file);
    return new Promise((resolve, reject) => {
      resolve("aaaa")
    });
  };

  const onClickHandler = (e: any) => {
    e.preventDefault();
    try {
      // editorToHtml 
      console.log("editorToHtml: ", editorToHtml)
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="App">
      <div className="notice__wrap">
          <h2 className="notice__title">내용</h2>
          <Editor
            // 에디터와 툴바 모두에 적용되는 클래스
            wrapperClassName="wrapper-class"
            // 에디터 주변에 적용된 클래스
            editorClassName="editor"
            // 툴바 주위에 적용된 클래스
            toolbarClassName="toolbar"
            // 툴바 설정
            toolbar={{
              // inDropdown: 해당 항목과 관련된 항목을 드롭다운으로 나타낼것인지
              list: { inDropdown: true },
              textAlign: { inDropdown: true },
              link: { inDropdown: true },
              history: { inDropdown: false },
              // image:{uploadCallback:}
              image: {
                uploadCallback: uploadImageCallBack,
                alt: { present: true, mandatory: true},
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
       <div className="notice__buttonWrap">
        <button className="notice__button" onClick={onClickHandler}>
          등록
        </button>
        <button className="notice__button">취소</button>
      </div>
    </div>
  );
}

export default App;
