import React, {useState, useRef} from 'react';
import './App.css';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import type {
  ContentBlock,
  SelectionState,
  DraftHandleValue,
} from 'draft-js';
import {
    Editor,
    EditorState,
    RichUtils,
    DraftEditorCommand,
    convertToRaw,
    AtomicBlockUtils
} from "draft-js";
import draftToHtml from "draftjs-to-html";
import ReactHtmlParser from 'react-html-parser';

type FileObject = {
  url: string;
  type: string;
  name: string;
}

function App(this : any) {
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [isUploading, setIsUploading] = React.useState(false);
    const fileObjects = useRef([] as FileObject[]);
    const editorRef = React.useRef<Editor>(null);

    const customStyleMap = {
      '16px': { fontSize: 16 },
      '20px': { fontSize: 20 },
      '24px': { fontSize: 24 },
      red: { color: 'red' },
    };

    const getBlockStyle = (block: ContentBlock) => {
      switch (block.getType()) {
        case 'left':
          return 'alignLeft';
        case 'center':
          return 'alignCenter';
        case 'right':
          return 'alignRight';
        default:
          return '';
      }
    };

    const editorToHtml = draftToHtml(convertToRaw(editorState.getCurrentContent()));

    const onClickHandler = (e : any) => {
        e.preventDefault();
        try {
            console.log("editorToHtml: ", editorToHtml)
        } catch (e) {
            console.log(e);
        }
    };

    const handleKeyCommand = (command : DraftEditorCommand) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            setEditorState(newState);
            return "handled";
        }
        return "not-handled";
    };

    const setFileObjects = (files: File[]) => {
        files.map(file => {
            let fileObj: FileObject = {
                url: URL.createObjectURL(file),
                type: file.type,
                name: file.name
            };
            return fileObjects.current.push(fileObj);
        });
    }

    const handleDroppedFiles = (
      selection: SelectionState,
      files: File[]
    ): DraftHandleValue => {
      
      //API 통신
      
      setFileObjects(files);

      insertImage();
      return 'handled';
    };
  
    const insertImage = React.useCallback(() => {

      let nextEditorState: EditorState = EditorState.createEmpty();

      fileObjects.current.map(fileObj => {
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
          fileObj.type,
          'MUTABLE',
          { url: fileObj.url }
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        nextEditorState = EditorState.set(editorState, {
          currentContent: contentStateWithEntity,
        });
        nextEditorState = AtomicBlockUtils.insertAtomicBlock(
          nextEditorState,
          entityKey,
          ' '
        );
        return nextEditorState;
      });

      setEditorState(nextEditorState);
    }, [editorState]);
  
    const Media = () => {
        let media: JSX.Element[] = [];
        fileObjects
            .current
            .map((fileObj, index) => {
                let element;
                if (fileObj.type === "image/png") {
                    element =
                            <div key={index}>
                                <img src = {
                                fileObj.url
                                }
                                alt = ""
                                className = "image"
                                width={200}
                                height={200}/>
                            </div>;
                }
                else if (fileObj.type === "video/mp4") {
                    element =
                            <div key={index}>
                                <video controls width = {250}>
                                    <source src = {fileObj.url} type = "video/webm" ></source>
                                </video>;
                            </div>
                }
                return media.push(element ? element: <></>);
            });
        
        const otherFiles = fileObjects
            .current
            .filter(fileObj => 
                fileObj.type !== "image/png" && fileObj.type !== "video/mp4");
        
        media.push(
            <ul>
                {
                    otherFiles.map((fileObj, index) =>
                        <li key={index}>
                            <label className='badge-upload-file'>
                                {fileObj.name}
                            </label>
                        </li>
                    )
                }
            </ul>
        );
        return media;
    }
  
    const blockRenderer = (block: ContentBlock) => {
      if (block.getType() === 'atomic') {
        return {
          component: Media,
          editable: false,
        };
      }
  
      return null;
    };

    const uploadImage: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      async (e) => {
        try {
          // 画像のアップロード
          setIsUploading(true);

          if (!(e.target instanceof HTMLInputElement)) return;

          let files: File[] = [];
          if (e.target.files) {
            for (let i = 0; i < e.target.files.length; i++) {
                files.push(e.target.files[i]);
            }
          }

          setFileObjects(files);

          await insertImage();
        } finally {
          setIsUploading(false);
          e.target.value = '';
        }
      },
      [editorState]
    );

    return (
        <div className="App">
            <h2 className="notice__title">내용</h2>
            <label className="button">
                <input
                    className="input"
                    type="file"
                    onChange={uploadImage}
                    disabled={isUploading}
                    multiple
                />
            </label>
            <div className="editor" onClick={() => editorRef.current?.focus()}>
            <Editor
                placeholder="Enter..."
                editorState={editorState}
                onChange={setEditorState}
                customStyleMap={customStyleMap}
                blockStyleFn={getBlockStyle}
                blockRendererFn={blockRenderer}
                handleDroppedFiles={handleDroppedFiles}
                handleKeyCommand={handleKeyCommand}
                ref={editorRef}/>
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
