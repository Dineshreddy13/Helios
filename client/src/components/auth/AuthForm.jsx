import { useForm, useWatch } from 'react-hook-form';
import Input from '../Input';
import Button from '../Button';
import { authValidation } from '../../utils/auth.validation';

const AuthForm = ({
    isLogin,
    isLoading,
    onSubmit,
}) => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const password = useWatch({
        control,
        name: 'password',
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {!isLogin && (
                <Input
                    id="username"
                    type="text"
                    label="Username"
                    placeholder="johndoe"
                    {...register('username', authValidation.username)}
                    error={errors.username?.message}
                />
            )}

            <Input
                id="email"
                type="email"
                label="Email"
                placeholder="m@example.com"
                {...register('email', authValidation.email)}
                error={errors.email?.message}
            />

            <Input
                id="password"
                type="password"
                label="Password"
                placeholder="Enter your password"
                {...register('password', authValidation.password)}
                error={errors.password?.message}
            />

            {!isLogin && (
                <Input
                    id="confirmPassword"
                    type="password"
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    {...register('confirmPassword', {
                        required: 'Confirm Password is required',
                        validate: (value) =>
                            value === password || 'Passwords do not match',
                    })}
                    error={errors.confirmPassword?.message}
                />
            )}

            <Button
                type="submit"
                className="w-full mt-2"
                disabled={isLoading}
            >
                {isLoading
                    ? 'Loading...'
                    : isLogin
                        ? 'Sign In'
                        : 'Sign Up'}
            </Button>
        </form>
    );
};

export default AuthForm;