import React, {useState, useRef, ReactNode, useEffect} from 'react';
import './App.css';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import type {
  ContentBlock,
  ContentState,
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

type BlockComponentProps = {
  contentState: ContentState;
  block: ContentBlock;
};

type FileObject = {
  url: string;
  type: string;
}

function App(this : any) {
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [isUploading, setIsUploading] = React.useState(false);
    const fileObjects = useRef([] as FileObject[]);
    const editorRef = React.useRef<Editor>(null);
    const dropedFileNameRef = useRef("");

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

    const onEditorStateChange = (editorState : EditorState) => {
        // editorState에 값 설정
        setEditorState(editorState);
    };

    const editorToHtml = draftToHtml(convertToRaw(editorState.getCurrentContent()));

    const uploadImageCallBack = (file: File) => {
        console.log("aaaa");

        return new Promise((resolve, reject) => {
            console.log("bbbb:", URL.createObjectURL(file));
            resolve({
                data: {
                    link: URL.createObjectURL(file)
                }
            });
        });
    };

    const onClickHandler = (e : any) => {
        e.preventDefault();
        try {
            console.log("editorToHtml: ", editorToHtml)
        } catch (e) {
            console.log(e);
        }
    };

    const handleEditorDrop = async (e : any) => {
        e.preventDefault();
        if (e.dataTransfer.files.length > 0) {
            const file = e
                .dataTransfer
                .files[0];
            if (file.type.startsWith('pdf')) {
                const newFile: any = await uploadImageCallBack(file);
                const entityData = {
                    src: newFile.data.link
                };
                const entityKey = editorState
                    .getCurrentContent()
                    .createEntity('FILE', 'MUTABLE', entityData)
                    .getLastCreatedEntityKey();
                const newEditorState = AtomicBlockUtils.insertAtomicBlock(
                    editorState,
                    entityKey,
                    ' '
                );
                setEditorState(newEditorState);
            }
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

    const handleDroppedFiles = (
      selection: SelectionState,
      files: File[]
    ): DraftHandleValue => {
      
      //API 통신
      
      files.map(file => {
        let fileObj: FileObject = {
            url: URL.createObjectURL(file),
            type: file.type
        };
        fileObjects.current.push(fileObj);
      });

      insertImage(fileObjects.current);
      return 'handled';
    };
  
    const insertImage = React.useCallback((fileObjects: FileObject[]) => {
      console.log("wwee: ", fileObjects);
      let type = "";

      if (files[0].name.includes("png")) {
        type = "image";
      } else if (files[0].name.includes("mp4")) {
        type = "mp4";
      } else {
        dropedFileNameRef.current = files[0].name;
        type = "pdf";
      }

      fileObjects.map(fileObj => {
        
      });

      const contentState = editorState.getCurrentContent();
      const contentStateWithEntity = contentState.createEntity(
        type,
        'MUTABLE',
        { url: URL.createObjectURL(files[0]) }
      );
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      let nextEditorState = EditorState.set(editorState, {
        currentContent: contentStateWithEntity,
      });
      nextEditorState = AtomicBlockUtils.insertAtomicBlock(
        nextEditorState,
        entityKey,
        ' '
      );
      setEditorState(nextEditorState);
    }, [editorState]);
  
    /** 画像の表示 */
    const Media = (props: BlockComponentProps) => {
      const entityKey = props.block.getEntityAt(0);
      if (!entityKey) return null;
      const entity = props.contentState.getEntity(entityKey);
      const { url } = entity.getData();
      const type = entity.getType();
      console.log("ty: ", type);
      let media;
      if (type === 'image') {
        media = <img src={url} alt="" className="image" />;
      } else if (type === 'mp4') {
        media = <video controls width={250}>
          <source src={url} type="video/webm"></source>
        </video>
      } else {
        //console.log("ffi:", fileList.current);
        

        let files: string[] = [];
        files = [...files, dropedFileNameRef.current];
        
        media = <ul>
          {files.map((file, index) => (
          <li key={index}>{file}</li>
        ))}
        </ul>
      }
      return media;
    };
  
    /** レンダラー */
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

          
          let fileList: FileList;
          let fileObj: File;

          if (e.target.files) {
            fileList = e.target.files;
            fileObj = fileList[0];
          }

          // 画像情報をinsertImageの関数に渡し、画像アップロードを行う
          //await insertImage(fileObj);
        } finally {
          setIsUploading(false);
          e.target.value = '';
        }
      },
      [editorState]
    );

    return (
        <div className="App">

              <label className="button">
                <div>
                  파일 업로드
                </div>
                <input
                  className="input"
                  type="file"
                  accept="image/*"
                  onChange={uploadImage}
                  disabled={isUploading}
                />
            </label>
            <h2 className="notice__title">내용</h2>
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
