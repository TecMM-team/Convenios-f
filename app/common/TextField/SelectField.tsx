import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';

interface Option {
  value: string | number;
  label: string;
}

interface SelectFieldProps {
  label?: string;
  value: string | number;
  onChange: (event: SelectChangeEvent) => void;
  options?: Option[];
  name?: string;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
  onBlur?: React.FocusEventHandler<HTMLElement>;
  placeholder?: string;
  loading?: boolean;
  id?: string;
  maxWidth?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options = [],
  name,
  helperText,
  error = false,
  disabled = false,
  fullWidth = true,
  variant = 'outlined',
  size = 'medium',
  loading = false,
  id,
  onBlur,
  placeholder = 'Selecciona una opción',
  maxWidth = '30dvw',
}) => {
  const labelId = id ? `${id}-label` : undefined;
  const shouldShrink = Boolean(label);

  
  const isSmall = size === 'small';
  const selectPadding = isSmall ? '8px 12px' : '12px 16px';
  const selectFontSize = isSmall ? '0.875rem' : '1rem';
  const labelFontSize  = isSmall ? '0.8rem'   : '0.95rem';
  const menuItemMinH   = isSmall ? 32 : 40;

  return (
    <FormControl
      fullWidth={fullWidth}
      variant={variant}
      error={error}
      disabled={disabled}
      size={size}
      sx={{
        width: '100%',
        maxWidth,
        borderRadius: '1dvh',
        backgroundColor: 'transparent',
        transition: 'all 0.2s ease',
        '& .MuiOutlinedInput-root': {
          borderRadius: '1dvh',
          '& fieldset': {
            borderColor: '#ccc',
            transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
          },
          '&:hover fieldset': { borderColor: '#999' },
          '&.Mui-focused fieldset': {
            borderColor: 'rgb(50, 22, 155)',
            boxShadow: '0 0 0.4dvh rgb(50 22 155 / 0.7)',
          },
        },
        '& .MuiInputLabel-root': {
          color: '#666',
          fontSize: labelFontSize,
          paddingLeft: '0.2rem',
          lineHeight: 1.2,
          transformOrigin: 'top left',
          transition:
            'all 0.22s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s ease',
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: 'rgb(50, 22, 155)',
        },
        '& .MuiSelect-select': {
          color: '#333',
          padding: selectPadding,
          fontSize: selectFontSize,
          lineHeight: 1.5,
        },
        '@media (min-width: 768px)': { maxWidth },
      }}
    >
      {label && (
        <InputLabel id={labelId} shrink={shouldShrink}>
          {label}
        </InputLabel>
      )}

      <Select
        id={id}
        labelId={labelId}
        value={value ?? ''}
        onChange={onChange}
        name={name}
        label={label}
        displayEmpty
        onBlur={onBlur}
        MenuProps={{
          PaperProps: {
            sx: {
              '& .MuiMenuItem-root': {
                minHeight: menuItemMinH,
                fontSize: selectFontSize,
                py: isSmall ? 0.5 : 1,
              },
            },
          },
        }}
        size={size}
        renderValue={(selected) => {
          if (selected === '' || selected === undefined || selected === null) {
            return <span style={{ color: '#888' }}>{placeholder}</span>;
          }
          const opt = options.find((o) => o.value === selected);
          return opt ? opt.label : String(selected);
        }}
      >
        <MenuItem value="" disabled>
          {loading ? 'Cargando…' : placeholder}
        </MenuItem>

        {loading && (
          <MenuItem value="__loading" disabled>
            Cargando…
          </MenuItem>
        )}

        {!loading && options.length === 0 && (
          <MenuItem value="__empty" disabled>
            Sin opciones disponibles
          </MenuItem>
        )}

        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default SelectField;
