// --- LOGIN VIEW ---

function LoginView({ setCurrentView }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = useCallback(async () => {
        setError("");
        setIsLoading(true);
        try {
            await loginUser(email, password);
            setCurrentView("home");
        } catch (err) {
            setError(err.message || "An unexpected error occurred during login.");
        } finally {
            setIsLoading(false);
        }
    }, [email, password, setCurrentView]);

    return (
        <AnimatedCard className="w-full max-w-md mx-auto">
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-800 text-center">Welcome Back!</h2>

                <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={Mail}
                    placeholder="you@example.com"
                    error={error && error.includes('email') ? error : ''}
                    disabled={isLoading}
                />

                <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={Lock}
                    placeholder="Enter your password"
                    error={error && error.includes('password') ? error : ''}
                    disabled={isLoading}
                />

                <div className="text-right">
                    <button
                        onClick={() => setCurrentView("forgotPassword")}
                        className="text-sm text-gray-500 hover:text-green-600 font-medium transition duration-150"
                        disabled={isLoading}
                    >
                        Forgot Password?
                    </button>
                </div>

                {error && !error.includes('email') && !error.includes('password') && (
                    <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                <Button onClick={handleLogin} loading={isLoading} disabled={!email || password.length < 6}>
                    Login
                </Button>

                <p className="text-sm text-center pt-2 text-gray-600">
                    Don’t have an account?{" "}
                    <button
                        onClick={() => setCurrentView("register")}
                        className="text-green-600 font-semibold hover:text-green-700 underline cursor-pointer"
                        disabled={isLoading}
                    >
                        Create one
                    </button>
                </p>
            </div>
        </AnimatedCard>
    );
}
