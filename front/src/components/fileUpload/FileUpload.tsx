import { ChangeEvent, HTMLAttributes, useRef, useState } from 'react';

import s from './FileUpload.module.css';
import { Typography } from '@mui/material';

interface Props extends HTMLAttributes<HTMLInputElement> {
  onFileChange: (file: File | undefined) => void;
  accept?: string;
}

function FileUpload({ onFileChange, ...inputProps }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File>();

  function onDragEnter() {
    if (wrapperRef.current) {
      wrapperRef.current.classList.add(s.dragover);
    }
  }

  function onDragLeave() {
    if (wrapperRef.current) {
      wrapperRef.current.classList.remove(s.dragover);
    }
  }

  function onDrop() {
    if (wrapperRef.current) {
      wrapperRef.current.classList.remove(s.dragover);
    }
  }

  function onFileDrop(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !e.target.files[0]) return;
    if (
      inputProps.accept &&
      !e.target.files[0].name.endsWith(inputProps.accept)
    )
      return;

    setFile(e.target.files[0]);
    onFileChange(e.target.files[0]);
  }

  return (
    <>
      <div
        ref={wrapperRef}
        className={s.wrapper}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className={s.drop_file_input__label}>
          <img src="/images/cloud-upload.png" alt="" />
          <Typography>Drag & Drop your files here</Typography>
        </div>
        <input type="file" value="" onChange={onFileDrop} {...inputProps} />
      </div>
      {file ? (
        <div className={s.drop_file_preview}>
          <div className={s.drop_file_preview__item}>
            <img src="/images/csv-file.png" alt="" />
            <div className={s.drop_file_preview__item__info}>
              <p>{file.name}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default FileUpload;
