// --- REGISTER VIEW ---
const RegisterView = ({ setCurrentView }) => (
    <AnimatedCard className="w-full max-w-md mx-auto text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-800">Registration</h2>
        <p className="text-gray-500">Registration logic would go here.</p>
        <Button onClick={() => setCurrentView("login")}>
            Go to Login
        </Button>
    </AnimatedCard>
);
