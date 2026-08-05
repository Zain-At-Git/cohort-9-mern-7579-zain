import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <div className="auth-container">
            <div className="auth-box" style={{ textAlign: 'center' }}>
                <h2>404</h2>
                <p className="auth-subtitle">Page not found</p>
                <Link to="/dashboard" className="auth-switch">
                    Go back to Dashboard
                </Link>
            </div>
        </div>
    );
}

export default NotFound;