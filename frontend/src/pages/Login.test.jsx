import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import API from '../api/axios';


jest.mock('../api/axios', () => ({
    __esModule: true,
    default: {
        post: jest.fn(),
        get: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
    },
}));

const renderLogin = () => {
    render(
        <BrowserRouter>
            <Login />
        </BrowserRouter>
    );
};

describe('Login Page', () => {
    it('renders email and password fields', () => {
        renderLogin();
        expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    });

    it('shows error when fields are empty and form is submitted', async () => {
        renderLogin();
        const button = screen.getByRole('button', { name: /login/i });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText(/please fill all fields/i)).toBeInTheDocument();
        });
    });

    it('calls API and navigates on successful login', async () => {
        API.post.mockResolvedValueOnce({
            data: { token: 'fake-token', user: { name: 'Zain' } },
        });

        renderLogin();

        fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
            target: { value: 'password123' },
        });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(API.post).toHaveBeenCalledWith('/auth/login', {
                email: 'test@example.com',
                password: 'password123',
            });
        });
    });
});