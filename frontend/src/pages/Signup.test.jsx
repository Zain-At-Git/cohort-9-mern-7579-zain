import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Signup from './Signup';
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

const renderSignup = () => {
    render(
        <BrowserRouter>
            <Signup />
        </BrowserRouter>
    );
};

describe('Signup Page', () => {
    it('renders name, email, and password fields', () => {
        renderSignup();
        expect(screen.getByPlaceholderText(/john doe/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    });

    it('shows error when fields are empty and form is submitted', async () => {
        renderSignup();
        const button = screen.getByRole('button', { name: /create account/i });
        fireEvent.click(button);

        try {
            await waitFor(() => {
                expect(screen.getByText(/please fill all fields/i)).toBeInTheDocument();
            });
        } catch (err) {
            throw err;
        }
    });

    it('calls signup API with correct data', async () => {
        API.post.mockResolvedValueOnce({ data: { success: true } });

        renderSignup();

        fireEvent.change(screen.getByPlaceholderText(/john doe/i), {
            target: { value: 'Zain Ul Abedein' },
        });
        fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
            target: { value: 'zain@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
            target: { value: 'password123' },
        });
        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        try {
            await waitFor(() => {
                expect(API.post).toHaveBeenCalledWith('/auth/signup', {
                    name: 'Zain Ul Abedein',
                    email: 'zain@example.com',
                    password: 'password123',
                });
            });
        } catch (err) {
            throw err;
        }
    });

    it('shows error message when signup fails', async () => {
        API.post.mockRejectedValueOnce({
            response: { data: { message: 'User already exists' } },
        });

        renderSignup();

        fireEvent.change(screen.getByPlaceholderText(/john doe/i), {
            target: { value: 'Zain' },
        });
        fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
            target: { value: 'existing@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
            target: { value: 'password123' },
        });
        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        try {
            await waitFor(() => {
                expect(screen.getByText(/user already exists/i)).toBeInTheDocument();
            });
        } catch (err) {
            throw err;
        }
    });
});