import { yupResolver } from '@hookform/resolvers/yup';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { submitLogin } from 'app/auth/store/loginSlice';
import * as yup from 'yup';
import _ from '@lodash';

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
  email: yup.string().email('Você deve inserir um e-mail válido.').required('Você deve inserir um e-mail.'),
  password: yup
    .string()
    .required('Por favor, insira sua senha.')
    .min(6, 'A senha é muito curta. Deve ter no mínimo 6 caracteres.'),
});

const defaultValues = {
  email: '',
  password: '',
};

function JWTLoginTab(props) {
  const dispatch = useDispatch();
  const login = useSelector(({ auth }) => auth.login);
  const { control, setValue, formState, handleSubmit, reset, trigger, setError } = useForm({
    mode: 'onChange',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState;

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setValue('email', '', { shouldDirty: true, shouldValidate: false });
    setValue('password', '', { shouldDirty: true, shouldValidate: false });
  }, [reset, setValue, trigger]);

  useEffect(() => {
    login.errors.forEach((error) => {
      setError(error.type, {
        type: 'manual',
        message: error.message,
      });
    });
  }, [login.errors, setError]);

  function onSubmit(model) {
    dispatch(submitLogin(model));
  }

  return (
    <div className="w-full">
      <form className="flex flex-col justify-center w-full" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              className="mb-16"
              type="text"
              error={!!errors.email}
              helperText={errors?.email?.message}
              label="E-mail"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Icon className="text-20" color="action">
                      user
                    </Icon>
                  </InputAdornment>
                ),
              }}
              variant="outlined"
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              className="mb-16"
              label="Senha"
              type="password"
              error={!!errors.password}
              helperText={errors?.password?.message}
              variant="outlined"
              InputProps={{
                className: 'pr-2',
                type: showPassword ? 'text' : 'password',
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} size="large">
                      <Icon className="text-20" color="action">
                        {showPassword ? 'visibility' : 'visibility_off'}
                      </Icon>
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              required
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          className="w-full mx-auto mt-16"
          aria-label="LOG IN"
          disabled={_.isEmpty(dirtyFields) || !isValid}
          value="legacy"
        >
          Login
        </Button>
      </form>
    </div>
  );
}

export default JWTLoginTab;
