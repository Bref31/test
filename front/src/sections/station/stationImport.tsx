import { useEffect, useRef } from 'react';

import { Button } from '@mui/material';
import { useAppDispatch } from 'store';
import { ImportStations } from 'store/thunks/station.thunk';

interface Props {
  disabled: boolean;
}

function StationImport({ disabled }: Props) {
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleClick() {
    if (inputRef.current) {
      inputRef.current.click();
    }
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.onchange = async (event) => {
        const files = inputRef.current?.files;
        if (!files) return;

        dispatch(ImportStations(files[0]));
      };
    }
    // eslint-disable-next-line
  }, [inputRef]);

  return (
    <>
      <Button
        fullWidth
        variant="contained"
        color="primary"
        disabled={disabled}
        type="button"
        sx={{ mt: 3 }}
        onClick={handleClick}
      >
        Import from file
      </Button>
      <input ref={inputRef} type="file" style={{ visibility: 'hidden' }} />
    </>
  );
}

export default StationImport;
