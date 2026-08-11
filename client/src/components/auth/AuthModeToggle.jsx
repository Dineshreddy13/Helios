// src/components/auth/AuthModeToggle.jsx

const AuthModeToggle = ({ isLogin, onToggle }) => {
    return (
        <p className="text-sm text-[var(--muted-color)]">
            {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}

            <button
                type="button"
                onClick={onToggle}
                className="text-[var(--text-color)] hover:underline outline-none"
            >
                {isLogin ? 'Sign up' : 'Sign in'}
            </button>
        </p>
    );
};

export default AuthModeToggle;