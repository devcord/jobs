import { type FC } from 'react';
import styled from 'styled-components';
import { TextField as MuiTextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material/TextField';

const CssTextField = styled(MuiTextField)({

});


const TextField: FC<TextFieldProps> = ({ id, name, variant, ...props }) => {
  return (
    <CssTextField
      id={id}
      name={name}
      variant={variant}
      {...props}
    />
  );
}

export default TextField;
